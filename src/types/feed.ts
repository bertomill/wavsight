export interface FeedItem {
  id: string;
  title: string;
  description: string;
  content?: string;  // Full article content if available
  link: string;
  pubDate: string;
  feedSource: string;
  feedSourceUrl: string;
  categories: string[];
}

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  categories: string[];
}

export interface FeedFilters {
  sources: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}
