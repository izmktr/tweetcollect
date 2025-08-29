import { NextRequest, NextResponse } from 'next/server';
import { getTweetsByUsername, formatTweetData } from '@/lib/twitter';
import { getCachedTweets, setCachedTweets } from '@/lib/kv';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

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
  } catch (error) {
    console.error('Error in tweets API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch tweets' },
      { status: 500 }
    );
  }
}
