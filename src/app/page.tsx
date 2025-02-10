'use client';

import { useState, useEffect } from 'react';
import { FeedItem, FeedSource, FeedFilters } from '@/types/feed';
import FeedList from '@/components/FeedList';
import FeedFilter from '@/components/FeedFilter';
import { fetchAllFeeds } from '@/services/feedService';
import { mockSources as mockFeeds } from '@/data/mockFeeds';
import { startOfToday, endOfToday } from 'date-fns';

export default function Home() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FeedFilters>({
    sources: mockFeeds.map(feed => feed.id),
    dateRange: {
      start: startOfToday().toISOString(),
      end: endOfToday().toISOString(),
    },
  });

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      const items = await fetchAllFeeds(mockFeeds);
      setFeeds(items);
    } catch (error) {
      console.error('Error loading feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeeds = feeds.filter(item => {
    // Filter by source
    if (!filters.sources.includes(item.feedSource)) {
      return false;
    }

    // Filter by date range
    if (filters.dateRange.start || filters.dateRange.end) {
      const itemDate = new Date(item.pubDate).getTime();
      
      if (filters.dateRange.start && itemDate < new Date(filters.dateRange.start).getTime()) {
        return false;
      }
      
      if (filters.dateRange.end && itemDate > new Date(filters.dateRange.end).getTime()) {
        return false;
      }
    }

    return true;
  });

  return (
    <main className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[300px,1fr] gap-6">
          <aside>
            <FeedFilter
              sources={mockFeeds}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </aside>

          <section>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B4513]"></div>
              </div>
            ) : (
              <FeedList items={filteredFeeds} />
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
