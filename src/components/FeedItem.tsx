import { useState, useRef, useEffect } from 'react';
import { FeedItem as FeedItemType } from '../types/feed';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';
import { saveArticle, unsaveArticle, isArticleSaved } from '@/services/savedArticlesService';

interface FeedItemProps {
  item: FeedItemType;
}

export default function FeedItem({ item }: FeedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const element = contentRef.current;
      if (element) {
        const isOverflowing = element.scrollHeight > element.clientHeight;
        setHasOverflow(isOverflowing || !!item.content);
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [item.description, item.content]);

  useEffect(() => {
    checkIfSaved();
  }, [item.id]);

  const checkIfSaved = async () => {
    try {
      const saved = await isArticleSaved(item.id);
      setIsSaved(saved);
    } catch (error) {
      console.error('Error checking if article is saved:', error);
    }
  };

  const handleSaveToggle = async () => {
    setIsLoading(true);
    try {
      if (isSaved) {
        await unsaveArticle(item.id);
        setIsSaved(false);
      } else {
        await saveArticle(item);
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling article save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMarkup = (content: string) => {
    return { __html: content };
  };

  const formatTimeAgo = (date: string) => {
    try {
      // Use a stable date format that won't change between server and client
      const parsedDate = new Date(date);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      } else {
        // For older dates, use a stable format
        return parsedDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'recently';
    }
  };

  return (
    <article className="group relative p-2 bg-[rgba(255,255,255,0.08)] backdrop-blur-lg rounded-lg transition-all duration-300 hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.1)] mb-2">
      <div className="flex flex-col space-y-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h2 className="text-sm font-medium text-white leading-tight tracking-tight">
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#8B4513] transition-colors duration-200"
              >
                {item.title}
              </a>
            </h2>
            <div className="flex items-center text-xs text-gray-400 space-x-1 mt-0.5">
              <a
                href={item.feedSourceUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                {item.feedSource}
              </a>
              <span>•</span>
              <time dateTime={item.pubDate} className="text-gray-500">
                {formatTimeAgo(item.pubDate)}
              </time>
            </div>
          </div>
          <div className="absolute top-2 right-2">
            <button
              onClick={handleSaveToggle}
              disabled={isLoading}
              className="p-1 rounded-full hover:bg-[rgba(255,255,255,0.1)] transition-colors"
              title={isSaved ? 'Remove from saved' : 'Save article'}
            >
              <svg
                className={`h-5 w-5 ${
                  isSaved ? 'text-yellow-400' : 'text-gray-400 group-hover:text-gray-300'
                } transition-colors ${isLoading ? 'animate-pulse' : ''}`}
                fill={isSaved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative">
          <div 
            ref={contentRef}
            className={`text-xs text-gray-300 leading-normal transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'line-clamp-2'
            }`}
          >
            {isExpanded && item.content ? (
              <div 
                className="prose prose-invert prose-sm max-w-none [&>img]:rounded-lg [&>img]:my-2"
                dangerouslySetInnerHTML={createMarkup(item.content)} 
              />
            ) : (
              <p>{item.description}</p>
            )}
          </div>
          {hasOverflow && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 flex items-center text-xs text-[#8B4513] hover:text-[#A0522D] transition-colors duration-200 group"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="h-3 w-3 mr-0.5 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-3 w-3 mr-0.5 transition-transform duration-200 group-hover:translate-y-0.5" />
                  Read more
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
