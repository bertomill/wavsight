import { FeedSource, FeedItem } from '@/types/feed';
import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';

// Custom parser type to handle various feed formats
type CustomFeed = {
  items: Array<{
    title: string;
    link: string;
    pubDate: string;
    content?: string;
    contentSnippet?: string;
    description?: string;
    guid?: string;
    categories?: string[] | string;
    'content:encoded'?: string;
    'dc:creator'?: string;
    creator?: string;
    isoDate?: string;
  }>;
};

const parser = new Parser<CustomFeed>({
  timeout: 20000, // Increase timeout to 20 seconds
  maxRedirects: 5,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/rss+xml, application/xml, application/atom+xml, application/json, text/xml, */*'
  },
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
      ['description', 'description']
    ]
  }
});

// Helper function to clean CDATA and HTML content
function cleanContent(content: string): string {
  return content
    // Remove CDATA wrapper
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    // Remove HTML tags except for paragraphs and links
    .replace(/<(?!\/?(p|a)(?=>|\s.*>))\/?(?:.|\n)*?>/gm, '')
    // Remove TechCrunch copyright notice
    .replace(/© \d{4} TechCrunch\. All rights reserved\. For personal use only\./g, '')
    .trim();
}

// Helper function to extract a description from content if contentSnippet is not available
function extractDescription(content: string): string {
  // Remove HTML tags and get first 300 characters
  const text = content.replace(/<[^>]*>/g, '').trim();
  return text.length > 300 ? text.slice(0, 297) + '...' : text;
}

export async function fetchAllFeeds(sources: FeedSource[], limit: number = 200): Promise<FeedItem[]> {
  console.log(`Fetching ${sources.length} feeds with limit ${limit}`);
  
  const feedPromises = sources.map(source => fetchFeed(source, Math.ceil(limit / sources.length)));
  const results = await Promise.allSettled(feedPromises);
  
  const feeds = results
    .filter((result): result is PromiseFulfilledResult<FeedItem[]> => result.status === 'fulfilled')
    .flatMap(result => result.value);
  
  // Sort by publication date, newest first
  const sortedFeeds = feeds.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  console.log(`Total items fetched: ${sortedFeeds.length}`);
  
  return sortedFeeds.slice(0, limit);
}

// Export fetchFeed for single feed sources
export async function fetchFeed(source: FeedSource, limit: number = 50): Promise<FeedItem[]> {
  try {
    console.log(`Fetching feed for ${source.name} from ${source.url}`);
    const feed = await parser.parseURL(source.url);
    
    if (!feed.items || feed.items.length === 0) {
      console.warn(`No items found in feed for ${source.name}`);
      return [];
    }

    // Get all items and validate their dates
    const items = feed.items
      .map(item => {
        try {
          // Try to parse the date, using various possible date fields
          const dateString = item.isoDate || item.pubDate;
          const pubDate = dateString ? new Date(dateString) : new Date();
          if (isNaN(pubDate.getTime())) {
            console.warn(`Invalid date for item in ${source.name}:`, dateString);
            return null;
          }

          // Handle different content formats
          const fullContent = item['content:encoded'] || item.content || '';
          
          // Handle different description formats
          let description = '';
          if (item.contentSnippet) {
            description = item.contentSnippet;
          } else if (item.description) {
            // Clean up description from HTML and CDATA
            description = cleanContent(item.description);
          } else {
            description = extractDescription(fullContent);
          }

          // Handle different category formats
          let categories: string[] = [];
          if (Array.isArray(item.categories)) {
            categories = item.categories.map(c => cleanContent(c));
          } else if (typeof item.categories === 'string') {
            // Some feeds provide categories as a comma-separated string
            categories = item.categories.split(',').map(c => cleanContent(c.trim()));
          }
          
          // Combine with source categories and remove duplicates
          categories = [...new Set([...categories, ...(source.categories || [])])];

          // Get the author (creator) from various possible fields
          const author = cleanContent(item.creator || item['dc:creator'] || '');

          return {
            id: item.guid || uuidv4(),
            title: item.title || 'Untitled',
            description: description,
            content: cleanContent(fullContent),
            link: item.link || '',
            pubDate: pubDate.toISOString(),
            feedSource: source.name,
            feedSourceUrl: source.url,
            categories: categories,
            author: author || undefined,
          };
        } catch (error) {
          console.error(`Error processing feed item from ${source.name}:`, error);
          return null;
        }
      })
      .filter((item): item is FeedItem => item !== null)
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, limit);

    console.log(`Successfully fetched ${items.length} items from ${source.name}`);
    return items;
  } catch (error) {
    console.error(`Error fetching feed for ${source.name}:`, error);
    return [];
  }
}
