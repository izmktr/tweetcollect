'use client';

import { useState, useEffect } from 'react';
import { Tweet, Account } from '@/types';
import TweetCard from '@/components/TweetCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cached, setCached] = useState(false);
  const [displayMode, setDisplayMode] = useState<'all' | 'single'>('all');
  const [selectedAccount, setSelectedAccount] = useState<string>('');

  // ページ読み込み時にアカウント一覧を取得し、自動で全ツイートを読み込み
  useEffect(() => {
    fetchAccounts();
  }, []);

  // アカウント取得後、自動で全ツイートを読み込み
  useEffect(() => {
    if (accounts.length > 0 && displayMode === 'all') {
      fetchAllTweets();
    }
  }, [accounts, displayMode]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchAllTweets = async () => {
    setLoading(true);
    setError('');
    setTweets([]);

    try {
      // usernameパラメータなしで全ツイートを取得
      const response = await fetch('/api/tweets');
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

  const fetchSingleAccountTweets = async () => {
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

  const handleModeChange = (mode: 'all' | 'single') => {
    setDisplayMode(mode);
    setTweets([]);
    setError('');
    
    if (mode === 'all' && accounts.length > 0) {
      fetchAllTweets();
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
            登録されたTwitterアカウントの最新ツイートを表示します
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
            {/* 表示モード選択 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表示モード
              </label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleModeChange('all')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    displayMode === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  全アカウント
                </button>
                <button
                  onClick={() => handleModeChange('single')}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    displayMode === 'single'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  個別アカウント
                </button>
              </div>
            </div>

            {/* 個別アカウント選択 */}
            {displayMode === 'single' && (
              <div>
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
                    onClick={fetchSingleAccountTweets}
                    disabled={!selectedAccount || loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '取得中...' : 'ツイート取得'}
                  </button>
                </div>
              </div>
            )}

            {/* 全アカウントモードの場合の更新ボタン */}
            {displayMode === 'all' && (
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    登録アカウント数: {accounts.length}
                  </span>
                  <button
                    onClick={fetchAllTweets}
                    disabled={loading || accounts.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '更新中...' : '最新ツイート取得'}
                  </button>
                </div>
              </div>
            )}
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
              {displayMode === 'all' 
                ? `全アカウントの最新ツイート (${tweets.length}件)`
                : `@${selectedAccount} の最新ツイート`
              }
            </h2>
            <div className="space-y-4">
              {tweets.map((tweet) => (
                <TweetCard key={`${tweet.author?.username}-${tweet.id}`} tweet={tweet} />
              ))}
            </div>
          </div>
        )}

        {!loading && tweets.length === 0 && accounts.length === 0 && (
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-500">
              まずアカウント管理ページでTwitterアカウントを登録してください。
            </p>
          </div>
        )}

        {!loading && tweets.length === 0 && accounts.length > 0 && !error && (
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-500">ツイートが見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  );
}
