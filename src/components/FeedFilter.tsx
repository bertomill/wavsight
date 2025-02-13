import { FeedFilters, FeedSource } from '../types/feed';
import Collapsible from './Collapsible';

interface FeedFilterProps {
  sources: FeedSource[];
  filters: FeedFilters;
  onFiltersChange: (filters: FeedFilters) => void;
}

export default function FeedFilter({ sources, filters, onFiltersChange }: FeedFilterProps) {
  const handleSourceChange = (sourceName: string) => {
    const newSources = filters.sources.includes(sourceName)
      ? filters.sources.filter(s => s !== sourceName)
      : [...filters.sources, sourceName];
    onFiltersChange({ ...filters, sources: newSources });
  };

  const getMainUrl = (feedUrl: string): string => {
    try {
      const url = new URL(feedUrl);
      if (feedUrl.includes('reddit.com')) {
        return `https://reddit.com/r/${url.pathname.split('/')[2]}`;
      }
      if (feedUrl.includes('feeds.feedburner.com')) {
        return `https://${feedUrl.split('/').pop()}`;
      }
      return url.origin;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return '#';
    }
  };

  return (
    <Collapsible title="Sources" defaultOpen={true}>
      <div className="space-y-1">
        {sources.map(source => (
          <div key={source.id} className="flex items-center gap-1.5 group">
            <input
              type="checkbox"
              checked={filters.sources.includes(source.name)}
              onChange={() => handleSourceChange(source.name)}
              className="rounded-sm bg-transparent border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
            />
            <span className="text-xs text-gray-400 group-hover:text-white transition-colors flex-grow">
              {source.name}
            </span>
            <a
              href={getMainUrl(source.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-full hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
              title={`Visit ${source.name} website`}
            >
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        ))}
      </div>
    </Collapsible>
  );
}
