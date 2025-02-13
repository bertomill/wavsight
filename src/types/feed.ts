export interface FeedItem {
  id: string;
  title: string;
  description: string;
  content: string;
  link: string;
  pubDate: string;
  feedSource: string;
  feedSourceUrl: string;
  categories?: string[];
  author?: string;
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  categories?: string[];
}

export interface FeedFilters {
  sources: string[];
  articles?: FeedItem[];
}
