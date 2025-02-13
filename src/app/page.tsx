'use client';

import { useState, useEffect } from 'react';
import { FeedItem, FeedFilters } from '@/types/feed';
import FeedList from '@/components/FeedList';
import FeedFilter from '@/components/FeedFilter';
import PersonalArticles from '@/components/PersonalArticles';
import NewsSummary from '@/components/NewsSummary';
import PersonalProfile from '@/components/PersonalProfile';
import { fetchAllFeeds } from '@/services/feedService';
import { feedSources } from '@/data/feedSources';

const INITIAL_FEED_LIMIT = 8;
const TOTAL_FEEDS_TO_LOAD = 50;

export default function Home() {
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [personalArticles, setPersonalArticles] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FeedFilters>({
    sources: feedSources.map(feed => feed.name),
  });

  useEffect(() => {
    loadFeeds();
  }, []);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      const items = await fetchAllFeeds(
        feedSources.filter(feed => feed.id !== 'personal-medium'),
        TOTAL_FEEDS_TO_LOAD
      );
      console.log('Loaded feeds:', items.length);
      setFeeds(items);

      // Load personal articles
      const personal = await fetchAllFeeds(
        [feedSources.find(feed => feed.id === 'personal-medium')!],
        10
      );
      setPersonalArticles(personal);
    } catch (error) {
      console.error('Error loading feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeeds = feeds.filter(item => {
    // Check if it's a job posting by looking for common job-related keywords in title and description
    const jobKeywords = ['job', 'hiring', 'career', 'position', 'engineer', 'developer', 'analyst', 'manager', '@ ', 'software engineer'];
    const isJobPosting = jobKeywords.some(keyword => 
      item.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    if (isJobPosting) {
      return false;
    }

    // Source filter
    if (!filters.sources.includes(item.feedSource)) {
      return false;
    }

    return true;
  });

  return (
    <main className="p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[250px,1fr] gap-4">
          <aside className="lg:sticky lg:top-4 space-y-2">
            <PersonalProfile />
            <NewsSummary articles={feeds} personalArticles={personalArticles} />
            <PersonalArticles feedUrl="https://bertomill.medium.com/feed" />
            <FeedFilter
              sources={feedSources.filter(feed => feed.id !== 'personal-medium')}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </aside>
          <div>
            <FeedList 
              feeds={feeds} 
              loading={loading} 
              pageSize={INITIAL_FEED_LIMIT} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}
