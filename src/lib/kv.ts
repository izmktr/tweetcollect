import { kv } from '@vercel/kv';
import { TweetData, Account } from '@/types';

const TWEETS_CACHE_PREFIX = 'tweets:';
const ACCOUNTS_KEY = 'accounts';
const CACHE_DURATION = 3600; // 1時間（秒）

export async function getCachedTweets(username: string): Promise<TweetData | null> {
  try {
    const cached = await kv.get<TweetData>(`${TWEETS_CACHE_PREFIX}${username}`);
    return cached;
  } catch (error) {
    console.error('Error getting cached tweets:', error);
    return null;
  }
}

export async function setCachedTweets(username: string, tweetData: TweetData): Promise<void> {
  try {
    await kv.setex(`${TWEETS_CACHE_PREFIX}${username}`, CACHE_DURATION, tweetData);
  } catch (error) {
    console.error('Error setting cached tweets:', error);
  }
}

export async function getAccounts(): Promise<Account[]> {
  try {
    const accounts = await kv.get<Account[]>(ACCOUNTS_KEY);
    return accounts || [];
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
}

export async function addAccount(username: string): Promise<void> {
  try {
    const accounts = await getAccounts();
    const newAccount: Account = {
      id: Date.now().toString(),
      username,
      createdAt: new Date().toISOString()
    };
    
    // 重複チェック
    if (!accounts.find(acc => acc.username.toLowerCase() === username.toLowerCase())) {
      accounts.push(newAccount);
      await kv.set(ACCOUNTS_KEY, accounts);
    }
  } catch (error) {
    console.error('Error adding account:', error);
    throw error;
  }
}

export async function removeAccount(username: string): Promise<void> {
  try {
    const accounts = await getAccounts();
    const filteredAccounts = accounts.filter(
      acc => acc.username.toLowerCase() !== username.toLowerCase()
    );
    await kv.set(ACCOUNTS_KEY, filteredAccounts);
    
    // キャッシュされたツイートも削除
    await kv.del(`${TWEETS_CACHE_PREFIX}${username}`);
  } catch (error) {
    console.error('Error removing account:', error);
    throw error;
  }
}
