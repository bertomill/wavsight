import { createClient } from '@supabase/supabase-js';
import { FeedItem } from '@/types/feed';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export interface SavedArticle {
  id: string;
  article_id: string;
  article_title: string;
  article_url: string;
  feed_source: string;
  pub_date: string;
  created_at: string;
}

export async function saveArticle(article: FeedItem) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('saved_articles')
    .insert({
      user_id: user.user.id,
      article_id: article.id,
      article_title: article.title,
      article_url: article.link,
      feed_source: article.feedSource,
      pub_date: article.pubDate,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function unsaveArticle(articleId: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('saved_articles')
    .delete()
    .match({ user_id: user.user.id, article_id: articleId });

  if (error) {
    throw error;
  }
}

export async function isArticleSaved(articleId: string): Promise<boolean> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return false;
  }

  const { data, error } = await supabase
    .from('saved_articles')
    .select('id')
    .match({ user_id: user.user.id, article_id: articleId })
    .maybeSingle();

  if (error) {
    throw error;
  }

  return !!data;
}

export async function getSavedArticles(): Promise<SavedArticle[]> {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) {
    return [];
  }

  const { data, error } = await supabase
    .from('saved_articles')
    .select('*')
    .match({ user_id: user.user.id })
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}
