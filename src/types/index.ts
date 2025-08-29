export interface Tweet {
  id: string;
  text: string;
  created_at?: string;
  author_id?: string;
  public_metrics?: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  author?: {
    id: string;
    name: string;
    username: string;
    profile_image_url?: string;
  };
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
}

export interface TweetData {
  tweets: Tweet[];
  users: TwitterUser[];
  meta: {
    result_count: number;
    newest_id: string;
    oldest_id: string;
  };
}

export interface Account {
  id: string;
  username: string;
  createdAt: string;
}
