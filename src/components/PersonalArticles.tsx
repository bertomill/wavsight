import { useState, useEffect } from 'react';
import { FeedItem } from '@/types/feed';
import { formatDistanceToNow } from 'date-fns';
import { fetchFeed } from '@/services/feedService';
import Collapsible from './Collapsible';

interface PersonalArticlesProps {
  feedUrl: string;
}

export default function PersonalArticles({ feedUrl }: PersonalArticlesProps) {
  const [articles, setArticles] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        setLoading(true);
        setError(null);
        const items = await fetchFeed({
          id: 'personal-medium',
          name: 'My Articles',
          url: feedUrl,
          categories: ['Personal', 'Tech Writing'],
        }, 10);
        setArticles(items);
      } catch (err) {
        console.error('Error loading personal articles:', err);
        setError('Failed to load personal articles');
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, [feedUrl]);

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <Collapsible title="My Articles" defaultOpen={true}>
      <div className="space-y-2">
        {loading ? (
          <div className="text-gray-400 text-sm">Loading articles...</div>
        ) : articles.length > 0 ? (
          articles.map(article => (
            <article key={article.id} className="text-sm">
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-[rgba(255,255,255,0.1)] rounded p-2 transition-colors"
              >
                <h3 className="font-medium text-white">{article.title}</h3>
                <div className="text-gray-400 text-xs mt-1">
                  {formatDistanceToNow(new Date(article.pubDate), { addSuffix: true })}
                </div>
              </a>
            </article>
          ))
        ) : (
          <div className="text-gray-400 text-sm">No articles found</div>
        )}
      </div>
    </Collapsible>
  );
}
