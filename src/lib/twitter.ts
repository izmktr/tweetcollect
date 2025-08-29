import { TwitterApi } from 'twitter-api-v2';
import { TweetData } from '@/types';

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw new Error('TWITTER_BEARER_TOKEN is required');
}

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);

export async function getTweetsByUsername(username: string): Promise<TweetData> {
  try {
    // ユーザー情報を取得
    const user = await twitterClient.v2.userByUsername(username);
    
    if (!user.data) {
      throw new Error(`User @${username} not found`);
    }

    // 最新20件のツイートを取得
    const tweets = await twitterClient.v2.userTimeline(user.data.id, {
      max_results: 20,
      'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
      'user.fields': ['name', 'username', 'profile_image_url'],
      expansions: ['author_id'],
    });

    return {
      tweets: tweets.data?.data || [],
      users: tweets.data?.includes?.users || [],
      meta: tweets.data?.meta || {
        result_count: 0,
        newest_id: '',
        oldest_id: ''
      }
    };
  } catch (error) {
    console.error('Error fetching tweets:', error);
    throw new Error(`Failed to fetch tweets for @${username}`);
  }
}

export function formatTweetData(tweetData: TweetData) {
  const userMap = new Map(tweetData.users.map(user => [user.id, user]));
  
  return tweetData.tweets.map(tweet => ({
    ...tweet,
    author: tweet.author_id ? userMap.get(tweet.author_id) : undefined
  })).sort((a, b) => {
    const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
    const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
    return bDate - aDate;
  });
}
