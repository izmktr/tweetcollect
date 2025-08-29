'use client';

import { useState, useEffect } from 'react';
import { Account } from '@/types';
import Link from 'next/link';

export default function RegisterPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

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

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setMessage('ユーザー名とパスワードを入力してください');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add account');
      }

      setMessage(`アカウント @${data.username} を追加しました`);
      setMessageType('success');
      setUsername('');
      setPassword('');
      await fetchAccounts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'エラーが発生しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAccount = async (accountUsername: string) => {
    if (!password.trim()) {
      setMessage('削除するにはパスワードを入力してください');
      setMessageType('error');
      return;
    }

    if (!confirm(`@${accountUsername} を削除しますか？`)) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/accounts', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: accountUsername,
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove account');
      }

      setMessage(`アカウント @${data.username} を削除しました`);
      setMessageType('success');
      await fetchAccounts();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'エラーが発生しました');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
            >
              ← ホームに戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">アカウント管理</h1>
            <p className="text-gray-600 mt-2">
              Twitterアカウントの追加・削除を行います
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                messageType === 'success'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {message}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              アカウント管理について
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">Edge Config使用時の注意</h3>
              <p className="text-blue-800 text-sm mb-2">
                現在、ストレージにVercel Edge Configを使用しています。Edge Configは読み取り専用のため、アカウントの追加・削除はVercelダッシュボードで手動で行う必要があります。
              </p>
              <div className="text-blue-800 text-sm">
                <strong>手動設定手順:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Vercelダッシュボードにアクセス</li>
                  <li>プロジェクト → Storage → Edge Config</li>
                  <li>&quot;Edit Config&quot;でアカウント設定を更新</li>
                </ol>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              アカウント追加（テスト用）
            </h3>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Twitterユーザー名
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="例: elonmusk（@なしで入力）"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  管理者パスワード
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="管理者パスワードを入力"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? '追加中...' : 'アカウント追加'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              登録済みアカウント
            </h2>
            {accounts.length === 0 ? (
              <p className="text-gray-500">登録されているアカウントはありません</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900">
                        @{account.username}
                      </span>
                      <p className="text-sm text-gray-500">
                        登録日: {new Date(account.createdAt).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveAccount(account.username)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      削除
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
