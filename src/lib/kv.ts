import { get } from '@vercel/edge-config';
import { TweetData, Account } from '@/types';

const ACCOUNTS_KEY = 'accounts';

// Edge Configは読み取り専用なので、アカウント管理はローカルストレージまたはファイルベースで実装
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

export async function getCachedTweets(username: string): Promise<TweetData | null> {
  try {
    // Edge Configは読み取り専用のため、キャッシュ機能は制限される
    // 開発環境では常にnullを返してAPIから取得
    return null;
  } catch (error) {
    console.error('Error getting cached tweets:', error);
    return null;
  }
}

export async function setCachedTweets(_username: string, tweetData: TweetData): Promise<void> {
  try {
    // Edge Configは読み取り専用のため、キャッシュ設定は実装できない
    // プロダクション環境ではRedisやKVを使用することを推奨
    console.log(`Would cache tweets for ${_username}:`, tweetData.tweets.length, 'tweets');
  } catch (error) {
    console.error('Error setting cached tweets:', error);
  }
}

export async function getAccounts(): Promise<Account[]> {
  try {
    // Edge Configから取得を試行
    const accounts = await get<Account[]>(ACCOUNTS_KEY);
    if (accounts && accounts.length > 0) {
      return accounts;
    }
    
    // Edge Configに設定がない場合は開発用モックデータを返す
    console.log('Using mock accounts for development');
    return MOCK_ACCOUNTS;
  } catch (error) {
    console.error('Error getting accounts from Edge Config, using mock data:', error);
    return MOCK_ACCOUNTS;
  }
}

export async function addAccount(username: string): Promise<void> {
  try {
    // Edge Configは読み取り専用のため、アカウント追加は実装できない
    // ここではログ出力のみ
    console.log(`Would add account: ${username}`);
    console.log('Note: Edge Config is read-only. Use Vercel dashboard to update accounts.');
    
    // 実際の実装では、Edge ConfigをVercelダッシュボードで手動更新するか、
    // 別のストレージ（Database、KV等）を使用する必要がある
  } catch (error) {
    console.error('Error adding account:', error);
    throw new Error('Account management not available with Edge Config (read-only)');
  }
}

export async function removeAccount(username: string): Promise<void> {
  try {
    // Edge Configは読み取り専用のため、アカウント削除は実装できない
    console.log(`Would remove account: ${username}`);
    console.log('Note: Edge Config is read-only. Use Vercel dashboard to update accounts.');
    
    throw new Error('Account management not available with Edge Config (read-only)');
  } catch (error) {
    console.error('Error removing account:', error);
    throw error;
  }
}
