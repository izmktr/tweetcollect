import { NextRequest, NextResponse } from 'next/server';
import { getTweetsByUsername, formatTweetData } from '@/lib/twitter';
import { getCachedTweets, setCachedTweets, getAccounts } from '@/lib/kv';
import { Tweet } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // 特定のユーザーのツイートを取得する場合（既存の機能）
    if (username) {
      // キャッシュからデータを取得
      const cachedData = await getCachedTweets(username);
      
      if (cachedData) {
        const formattedTweets = formatTweetData(cachedData);
        return NextResponse.json({
          tweets: formattedTweets,
          cached: true,
          username
        });
      }

      // キャッシュにない場合はTwitter APIから取得
      const tweetData = await getTweetsByUsername(username);
      
      // キャッシュに保存
      await setCachedTweets(username, tweetData);
      
      const formattedTweets = formatTweetData(tweetData);

      return NextResponse.json({
        tweets: formattedTweets,
        cached: false,
        username
      });
    }

    // 全アカウントのツイートを取得する場合（新機能）
    const accounts = await getAccounts();
    
    if (accounts.length === 0) {
      return NextResponse.json({
        tweets: [],
        cached: false,
        message: 'No accounts registered'
      });
    }

    let allTweets: Tweet[] = [];
    let anyFromCache = false;
    let anyFromAPI = false;

    // 各アカウントのツイートを取得
    for (const account of accounts) {
      try {
        // キャッシュからデータを取得
        let cachedData = await getCachedTweets(account.username);
        
        if (cachedData) {
          const formattedTweets = formatTweetData(cachedData);
          allTweets.push(...formattedTweets);
          anyFromCache = true;
        } else {
          // キャッシュにない場合はTwitter APIから取得
          const tweetData = await getTweetsByUsername(account.username);
          
          // キャッシュに保存
          await setCachedTweets(account.username, tweetData);
          
          const formattedTweets = formatTweetData(tweetData);
          allTweets.push(...formattedTweets);
          anyFromAPI = true;
        }
      } catch (error) {
        console.error(`Error fetching tweets for @${account.username}:`, error);
        // エラーがあってもほかのアカウントの処理を続行
      }
    }

    // 全ツイートを時系列でソート
    allTweets.sort((a, b) => {
      const aDate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bDate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bDate - aDate;
    });

    return NextResponse.json({
      tweets: allTweets,
      cached: anyFromCache && !anyFromAPI,
      accounts: accounts.map(acc => acc.username),
      totalAccounts: accounts.length
    });

  } catch (error) {
    console.error('Error in tweets API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
}
