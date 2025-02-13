import { useEffect, useState } from 'react';
import { FeedItem } from '@/types/feed';
import FeedItemComponent from './FeedItem';

interface FeedListProps {
  feeds: FeedItem[];
  loading?: boolean;
  pageSize?: number;
}

export default function FeedList({ feeds = [], loading = false, pageSize = 8 }: FeedListProps) {
  const [displayedItems, setDisplayedItems] = useState<FeedItem[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!feeds) return;
    // Initially show first page of items
    setDisplayedItems(feeds.slice(0, pageSize));
  }, [feeds, pageSize]);

  const loadMore = () => {
    setLoadingMore(true);
    // Add next page of items
    const currentLength = displayedItems.length;
    const nextItems = feeds.slice(currentLength, currentLength + pageSize);
    setDisplayedItems(prev => [...prev, ...nextItems]);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!feeds || feeds.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No articles found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {displayedItems.map(item => (
          <FeedItemComponent key={item.id} item={item} />
        ))}
      </div>
      
      {displayedItems.length < feeds.length && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
