import { FeedItem, FeedSource } from '../types/feed';

export const feedSources: FeedSource[] = [
  {
    id: '1',
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    categories: ['Tech News', 'Startups', 'Venture Capital'],
  },
  {
    id: '2',
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    categories: ['Tech News', 'Consumer Tech', 'Digital Culture'],
  },
  {
    id: '3',
    name: 'Hacker News',
    url: 'https://news.ycombinator.com/rss',
    categories: ['Tech News', 'Programming', 'Startups'],
  },
  {
    id: '4',
    name: 'BetaKit',
    url: 'https://betakit.com/feed/',
    categories: ['Canadian Tech', 'Startups', 'Tech News'],
  },
  {
    id: '5',
    name: 'AI News',
    url: 'https://buttondown.com/ainews/rss',
    categories: ['AI', 'Machine Learning', 'Tech News'],
  }
];
