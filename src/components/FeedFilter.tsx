import { FeedFilters, FeedSource } from '../types/feed';
import { startOfToday, startOfWeek, endOfToday, isEqual, format } from 'date-fns';

interface FeedFilterProps {
  sources: FeedSource[];
  filters: FeedFilters;
  onFiltersChange: (filters: FeedFilters) => void;
}

type DateRange = 'today' | 'week' | 'all';

export default function FeedFilter({ sources, filters, onFiltersChange }: FeedFilterProps) {
  const handleSourceToggle = (sourceId: string) => {
    const newSources = filters.sources.includes(sourceId)
      ? filters.sources.filter(id => id !== sourceId)
      : [...filters.sources, sourceId];

    onFiltersChange({
      ...filters,
      sources: newSources,
    });
  };

  const handleDateRangeChange = (range: DateRange) => {
    let start: string | null = null;
    let end: string | null = null;

    switch (range) {
      case 'today':
        start = startOfToday().toISOString();
        end = endOfToday().toISOString();
        break;
      case 'week':
        start = startOfWeek(new Date()).toISOString();
        end = endOfToday().toISOString();
        break;
      case 'all':
        start = null;
        end = null;
        break;
    }

    onFiltersChange({
      ...filters,
      dateRange: { start, end },
    });
  };

  // Helper function to check if a date range is active
  const isDateRangeActive = (range: DateRange): boolean => {
    if (!filters.dateRange.start || !filters.dateRange.end) {
      return range === 'all';
    }

    const filterStart = new Date(filters.dateRange.start);
    const filterEnd = new Date(filters.dateRange.end);

    switch (range) {
      case 'today':
        return isEqual(filterStart, startOfToday()) && 
               isEqual(filterEnd, endOfToday());
      case 'week':
        return isEqual(filterStart, startOfWeek(new Date())) && 
               isEqual(filterEnd, endOfToday());
      case 'all':
        return false;
      default:
        return false;
    }
  };

  return (
    <div className="sticky top-8">
      <div className="bg-[rgba(255,255,255,0.08)] backdrop-blur-lg rounded-2xl p-6 border border-[rgba(255,255,255,0.1)]">
        <h3 className="text-xl font-medium text-white mb-6">Filters</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Time Range</h4>
            <div className="inline-flex bg-[rgba(255,255,255,0.05)] p-1 rounded-lg">
              <button
                onClick={() => handleDateRangeChange('today')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  isDateRangeActive('today')
                    ? 'bg-[#8B4513] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleDateRangeChange('week')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  isDateRangeActive('week')
                    ? 'bg-[#8B4513] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Last Week
              </button>
              <button
                onClick={() => handleDateRangeChange('all')}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  isDateRangeActive('all')
                    ? 'bg-[#8B4513] text-white shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                All Time
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Sources</h4>
            <div className="space-y-3">
              {sources.map((source) => (
                <label 
                  key={source.id} 
                  className="flex items-center group cursor-pointer"
                >
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source.id)}
                      onChange={() => handleSourceToggle(source.id)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-gray-600 rounded-md peer-checked:border-[#8B4513] peer-checked:bg-[#8B4513] transition-all duration-200" />
                    <div className="absolute inset-0 flex items-center justify-center text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200">
                      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                        <path
                          d="M2 6L5 9L10 3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <span className="ml-3 text-sm text-gray-400 group-hover:text-white transition-colors duration-200">
                    {source.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-3">Date Range</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">From</label>
                <input
                  type="date"
                  value={filters.dateRange.start || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      start: e.target.value,
                    },
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white focus:border-[#8B4513] focus:outline-none transition-colors duration-200 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">To</label>
                <input
                  type="date"
                  value={filters.dateRange.end || ''}
                  onChange={(e) => onFiltersChange({
                    ...filters,
                    dateRange: {
                      ...filters.dateRange,
                      end: e.target.value,
                    },
                  })}
                  className="w-full px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-white focus:border-[#8B4513] focus:outline-none transition-colors duration-200 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
