import { useState } from 'react';
import { FeedItem } from '@/types/feed';
import Collapsible from './Collapsible';

interface NewsSummaryProps {
  articles: FeedItem[];
  personalArticles: FeedItem[];
}

interface Theme {
  name: string;
  description: string;
  articles: {
    title: string;
    link: string;
    source: string;
  }[];
}

export default function NewsSummary({ articles, personalArticles }: NewsSummaryProps) {
  const [recentArticlesCount, setRecentArticlesCount] = useState(30);
  const [personalArticlesCount, setPersonalArticlesCount] = useState(5);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);

  const articleCountOptions = [
    { value: 30, label: '30 articles' },
    { value: 50, label: '50 articles' },
    { value: 100, label: '100 articles' }
  ];

  const personalArticleOptions = Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1} article${i === 0 ? '' : 's'}`
  }));

  const analyzeThemes = async () => {
    setLoading(true);
    try {
      const selectedArticles = articles.slice(0, recentArticlesCount);
      const selectedPersonalArticles = personalArticles.slice(0, personalArticlesCount);

      const response = await fetch('/api/analyze-themes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articles: selectedArticles,
          personalArticles: selectedPersonalArticles,
          additionalNotes,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze themes');
      }

      const data = await response.json();
      setThemes(data.themes);
    } catch (error) {
      console.error('Error analyzing themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Recent Articles to Consider
        </label>
        <div className="flex items-center space-x-1">
          {articleCountOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setRecentArticlesCount(option.value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                recentArticlesCount === option.value
                  ? 'bg-[#8B4513] text-white'
                  : 'bg-[rgba(255,255,255,0.1)] text-gray-400 hover:bg-[rgba(255,255,255,0.15)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-1">
          <div className="h-1 bg-[rgba(255,255,255,0.1)] rounded-full">
            <div
              className="h-1 bg-[#8B4513] rounded-full transition-all"
              style={{
                width: `${(recentArticlesCount / Math.max(...articleCountOptions.map(o => o.value))) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Personal Articles to Consider
        </label>
        <div className="flex items-center space-x-1">
          {personalArticleOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setPersonalArticlesCount(option.value)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                personalArticlesCount === option.value
                  ? 'bg-[#8B4513] text-white'
                  : 'bg-[rgba(255,255,255,0.1)] text-gray-400 hover:bg-[rgba(255,255,255,0.15)]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="mt-1">
          <div className="h-1 bg-[rgba(255,255,255,0.1)] rounded-full">
            <div
              className="h-1 bg-[#8B4513] rounded-full transition-all"
              style={{
                width: `${(personalArticlesCount / Math.max(...personalArticleOptions.map(o => o.value))) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Additional Notes
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Add any additional context for the AI..."
          className="w-full px-2 py-1 text-xs rounded-lg border border-gray-600 bg-[rgba(255,255,255,0.05)] text-white placeholder-gray-500 focus:border-[#8B4513] focus:outline-none transition-colors"
          rows={2}
        />
      </div>

      <button
        onClick={analyzeThemes}
        disabled={loading}
        className="w-full px-3 py-1.5 text-xs font-medium text-white bg-[#8B4513] rounded-lg hover:bg-[#A0522D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Analyze Themes'}
      </button>

      {themes.length > 0 && (
        <div className="mt-4 space-y-4">
          {themes.map((theme, index) => (
            <div key={index} className="space-y-2">
              <h3 className="text-sm font-medium text-white">
                {theme.name}
              </h3>
              <p className="text-xs text-gray-400">
                {theme.description}
              </p>
              <ul className="space-y-1">
                {theme.articles.map((article, articleIndex) => (
                  <li key={articleIndex} className="text-xs">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-[#8B4513] transition-colors"
                    >
                      {article.title}
                      <span className="text-gray-500 ml-1">
                        ({article.source})
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Collapsible title="News Summary" defaultOpen={false}>
      {content}
    </Collapsible>
  );
}
