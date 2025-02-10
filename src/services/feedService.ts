import Parser from 'rss-parser';
import { FeedItem, FeedSource } from '../types/feed';

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
      ['content', 'content'],
    ],
  },
});

// Use a CORS proxy for RSS feeds
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';
const FETCH_TIMEOUT = 5000; // 5 seconds timeout

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function fetchFeed(source: FeedSource): Promise<FeedItem[]> {
  try {
    // Special handling for Reddit JSON feeds
    if (source.url.includes('reddit.com')) {
      const jsonUrl = source.url.endsWith('.json') ? source.url : `${source.url}.json`;
      const response = await fetchWithTimeout(jsonUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      return parseRedditFeed(data, source);
    }

    // Regular RSS/Atom feeds with CORS proxy
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(source.url)}`;
    const response = await fetchWithTimeout(proxyUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const feedText = await response.text();
    const feed = await parser.parseString(feedText);

    return feed.items.map(item => ({
      id: item.guid || item.link || `${source.id}-${Date.now()}`,
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.description || '',
      content: (item as any).contentEncoded || (item as any).content || item.description || '',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      feedSource: source.name,
      feedSourceUrl: source.url,
      categories: [...(item.categories || []), ...source.categories],
    }));
  } catch (error) {
    console.error(`Error fetching feed from ${source.url}:`, error);
    return [];
  }
}

function parseRedditFeed(data: any, source: FeedSource): FeedItem[] {
  if (!data.data?.children) return [];

  return data.data.children
    .filter((child: any) => child.kind === 't3') // Only posts, not comments
    .map((child: any) => {
      const post = child.data;
      return {
        id: post.id,
        title: post.title,
        description: post.selftext || post.url,
        content: post.selftext_html || post.selftext || '',
        link: `https://www.reddit.com${post.permalink}`,
        pubDate: new Date(post.created_utc * 1000).toISOString(),
        feedSource: source.name,
        feedSourceUrl: source.url,
        categories: [...(post.link_flair_text ? [post.link_flair_text] : []), ...source.categories],
      };
    });
}

export async function fetchAllFeeds(sources: FeedSource[]): Promise<FeedItem[]> {
  // Fetch feeds in parallel with a maximum of 5 concurrent requests
  const results: FeedItem[] = [];
  const batchSize = 5;
  
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize);
    const batchPromises = batch.map(source => fetchFeed(source));
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(...result.value);
      }
    });
  }
  
  // Sort by date
  return results.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}
