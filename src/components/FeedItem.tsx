import { useState, useRef, useEffect } from 'react';
import { FeedItem as FeedItemType } from '../types/feed';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid';

interface FeedItemProps {
  item: FeedItemType;
}

export default function FeedItem({ item }: FeedItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      const element = contentRef.current;
      if (element) {
        // Check if content height exceeds the line-clamp height
        const isOverflowing = element.scrollHeight > element.clientHeight;
        setHasOverflow(isOverflowing || !!item.content);
      }
    };

    checkOverflow();
    // Recheck on window resize
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [item.description, item.content]);

  // Function to safely render HTML content
  const createMarkup = (content: string) => {
    return { __html: content };
  };

  return (
    <article className="group relative p-4 bg-[rgba(255,255,255,0.08)] backdrop-blur-lg rounded-lg transition-all duration-300 hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.1)] mb-3">
      <div className="flex flex-col space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-white leading-tight tracking-tight mb-1">
              <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-[#8B4513] transition-colors duration-200"
              >
                {item.title}
              </a>
            </h2>
            <div className="flex items-center text-xs text-gray-400 space-x-2">
              <a
                href={item.feedSourceUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-white transition-colors duration-200"
              >
                {item.feedSource}
              </a>
              <span>•</span>
              <span>{formatDistanceToNow(new Date(item.pubDate), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative">
          <div 
            ref={contentRef}
            className={`text-sm text-gray-300 leading-relaxed transition-all duration-300 ${
              isExpanded ? 'max-h-none' : 'line-clamp-2'
            }`}
          >
            {isExpanded && item.content ? (
              <div 
                className="prose prose-invert prose-sm max-w-none [&>img]:rounded-lg [&>img]:my-4"
                dangerouslySetInnerHTML={createMarkup(item.content)} 
              />
            ) : (
              <p>{item.description}</p>
            )}
          </div>
          {hasOverflow && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 flex items-center text-xs text-[#8B4513] hover:text-[#A0522D] transition-colors duration-200 group"
            >
              {isExpanded ? (
                <>
                  <ChevronUpIcon className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:-translate-y-0.5" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDownIcon className="h-4 w-4 mr-1 transition-transform duration-200 group-hover:translate-y-0.5" />
                  Read more
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center space-x-3 text-xs">
          <button className="text-gray-400 hover:text-white transition-colors duration-200">
            Share
          </button>
          <span className="text-gray-600">•</span>
          <button className="text-gray-400 hover:text-white transition-colors duration-200">
            Save
          </button>
        </div>
      </div>
    </article>
  );
}
