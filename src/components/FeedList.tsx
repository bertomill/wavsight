import { FeedItem as FeedItemType } from '@/types/feed';
import FeedItem from '@/components/FeedItem';

interface FeedListProps {
  items: FeedItemType[];
}

export default function FeedList({ items }: FeedListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No items found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map(item => (
        <FeedItem key={item.id} item={item} />
      ))}
    </div>
  );
}
