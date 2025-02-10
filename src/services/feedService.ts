import { FeedItem, FeedSource } from '../types/feed';
import Parser from 'rss-parser';

interface CustomFeed {
  title: string;
  description: string;
  link: string;
  items: CustomItem[];
}

interface CustomItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  description?: string;
  contentEncoded?: string;
  isoDate?: string;
  creator?: string;
  categories?: string[];
  mediaContent?: string;
  guid?: string;
  [key: string]: unknown;
}

interface CustomParser extends Parser<CustomFeed, CustomItem> {
  customFields: {
    item: string[];
  };
}

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  selftext_html: string;
  url: string;
  permalink: string;
  created_utc: number;
  link_flair_text?: string;
}

interface RedditChild {
  kind: string;
  data: RedditPost;
}

interface RedditResponse {
  data: {
    children: RedditChild[];
  };
}

type FetchError = {
  message: string;
  status?: number;
  response?: Response;
};

const parser: CustomParser = new Parser({
  customFields: {
    item: [
      'creator',
      'content',
      'contentSnippet',
      'contentEncoded',
      'mediaContent',
    ],
  },
}) as CustomParser;

// Use our own proxy API endpoint for RSS feeds
const CORS_PROXY = '/api/proxy?url=';
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
      if (!response.ok) {
        throw {
          message: `HTTP error! status: ${response.status}`,
          status: response.status,
          response
        } as FetchError;
      }
      const data = await response.json() as RedditResponse;
      return parseRedditFeed(data, source);
    }

    // Regular RSS/Atom feeds with CORS proxy
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(source.url)}`;
    const response = await fetchWithTimeout(proxyUrl);
    
    if (!response.ok) {
      throw {
        message: `HTTP error! status: ${response.status}`,
        status: response.status,
        response
      } as FetchError;
    }
    
    const feedText = await response.text();
    const feed = await parser.parseString(feedText);

    return feed.items.map((item) => ({
      id: item.guid || item.link || `${source.id}-${Date.now()}`,
      title: item.title || 'Untitled',
      description: item.contentSnippet || item.description || '',
      content: item.contentEncoded || item.content || item.description || '',
      link: item.link || '',
      pubDate: item.isoDate || item.pubDate || new Date().toISOString(),
      feedSource: source.name,
      feedSourceUrl: source.url,
      categories: [...(item.categories || []), ...source.categories],
    }));
  } catch (error) {
    const err = error as FetchError;
    console.error(`Error fetching feed from ${source.url}:`, err.message || String(error));
    return [];
  }
}

function parseRedditFeed(data: RedditResponse, source: FeedSource): FeedItem[] {
  if (!data.data?.children) return [];

  return data.data.children
    .filter((child) => child.kind === 't3') // Only posts, not comments
    .map((child) => {
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
  try {
    const feedPromises = sources.map(source => fetchFeed(source));
    const feedsArrays = await Promise.all(feedPromises);
    return feedsArrays.flat().sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );
  } catch (error) {
    const err = error as FetchError;
    console.error('Error fetching all feeds:', err.message || String(error));
    return [];
  }
}
