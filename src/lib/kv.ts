import { Redis } from '@upstash/redis';
import { TweetData, Account } from '@/types';

const TWEETS_CACHE_PREFIX = 'tweets:';
const ACCOUNTS_KEY = 'accounts';
const CACHE_DURATION = 3600; // 1時間（秒）

// 環境変数チェック
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// 開発環境用のモックデータ
const MOCK_ACCOUNTS: Account[] = [
  {
    id: '1',
    username: 'elonmusk',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    username: 'vercel',
    createdAt: new Date().toISOString()
  }
];

// Upstash Redis クライアントの初期化（環境変数が設定されている場合のみ）
let redis: Redis | null = null;

if (REDIS_URL && REDIS_TOKEN && REDIS_URL !== 'your_upstash_redis_url_here') {
  redis = new Redis({
    url: REDIS_URL,
    token: REDIS_TOKEN,
  });
} else {
  console.log('Upstash Redis not configured, using mock data for development');
}

export async function getCachedTweets(username: string): Promise<TweetData | null> {
  try {
    if (!redis) {
      console.log('Redis not available, returning null for cache');
      return null;
    }
    const cached = await redis.get<TweetData>(`${TWEETS_CACHE_PREFIX}${username}`);
    return cached;
  } catch (error) {
    console.error('Error getting cached tweets:', error);
    return null;
  }
}

export async function setCachedTweets(username: string, tweetData: TweetData): Promise<void> {
  try {
    if (!redis) {
      console.log(`Would cache tweets for ${username}:`, tweetData.tweets.length, 'tweets');
      return;
    }
    await redis.setex(`${TWEETS_CACHE_PREFIX}${username}`, CACHE_DURATION, tweetData);
  } catch (error) {
    console.error('Error setting cached tweets:', error);
  }
}

export async function getAccounts(): Promise<Account[]> {
  try {
    if (!redis) {
      console.log('Redis not available, using mock accounts');
      return MOCK_ACCOUNTS;
    }
    const accounts = await redis.get<Account[]>(ACCOUNTS_KEY);
    return accounts || [];
  } catch (error) {
    console.error('Error getting accounts:', error);
    return MOCK_ACCOUNTS;
  }
}

export async function addAccount(username: string): Promise<void> {
  try {
    if (!redis) {
      console.log(`Would add account: ${username} (Redis not configured)`);
      return;
    }
    
    const accounts = await getAccounts();
    const newAccount: Account = {
      id: Date.now().toString(),
      username,
      createdAt: new Date().toISOString()
    };
    
    // 重複チェック
    if (!accounts.find(acc => acc.username.toLowerCase() === username.toLowerCase())) {
      accounts.push(newAccount);
      await redis.set(ACCOUNTS_KEY, accounts);
    }
  } catch (error) {
    console.error('Error adding account:', error);
    throw error;
  }
}

export async function removeAccount(username: string): Promise<void> {
  try {
    if (!redis) {
      console.log(`Would remove account: ${username} (Redis not configured)`);
      return;
    }
    
    const accounts = await getAccounts();
    const filteredAccounts = accounts.filter(
      acc => acc.username.toLowerCase() !== username.toLowerCase()
    );
    await redis.set(ACCOUNTS_KEY, filteredAccounts);
    
    // キャッシュされたツイートも削除
    await redis.del(`${TWEETS_CACHE_PREFIX}${username}`);
  } catch (error) {
    console.error('Error removing account:', error);
    throw error;
  }
}
