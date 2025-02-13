-- Create saved_articles table
create table if not exists public.saved_articles (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade,
    article_id text not null,
    article_title text not null,
    article_url text not null,
    feed_source text not null,
    pub_date timestamp with time zone not null,
    created_at timestamp with time zone default now(),
    unique(user_id, article_id)
);
