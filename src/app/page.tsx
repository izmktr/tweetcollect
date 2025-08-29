'use client';

import { useState, useEffect } from 'react';
import { Tweet, Account } from '@/types';
import TweetCard from '@/components/TweetCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);

  // アカウント一覧を取得
  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchTweets = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError('');
    setTweets([]);

    try {
      const response = await fetch(`/api/tweets?username=${encodeURIComponent(selectedAccount)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch tweets');
      }

      setTweets(data.tweets || []);
      setCached(data.cached || false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ツイート収集アプリ
          </h1>
          <p className="text-gray-600 mb-4">
            登録されたTwitterアカウントの最新20件のツイートを表示します
          </p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            アカウント管理
          </Link>
        </header>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-2">
              Twitterアカウントを選択
            </label>
            <div className="flex space-x-4">
              <select
                id="account-select"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">アカウントを選択してください</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.username}>
                    @{account.username}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchTweets}
                disabled={!selectedAccount || loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '取得中...' : 'ツイート取得'}
              </button>
            </div>
          </div>
        </div>

        {cached && (
          <div className="max-w-2xl mx-auto mb-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-yellow-700">
                キャッシュされたデータを表示しています（1時間以内に取得済み）
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-4">
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {tweets.length > 0 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              @{selectedAccount} の最新ツイート
            </h2>
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
          </div>
        )}

        {!loading && tweets.length === 0 && selectedAccount && !error && (
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-500">ツイートが見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  );
}
