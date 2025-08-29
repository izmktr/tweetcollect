# ツイート収集アプリ

指定したTwitterアカウントの最新20件のツイートを取得し、時系列に並べて表示するNext.jsアプリケーションです。

## 機能

- 🐦 Twitterアカウントの最新20件のツイート取得
- 📋 アカウント登録・管理機能（管理者パスワード認証付き）
- ⚡ Vercel KVによる1時間キャッシュ機能
- 📱 レスポンシブデザイン

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下の変数を設定してください：

```env
# Twitter API Credentials
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here

# Admin Password for Account Registration
ADMIN_PASSWORD=your_secure_admin_password_here

# Vercel Edge Config Configuration
EDGE_CONFIG=your_edge_config_connection_string_here
```

### 3. Twitter API の設定

1. [Twitter Developer Portal](https://developer.twitter.com/) でアプリケーションを作成
2. Bearer Token を取得し、`TWITTER_BEARER_TOKEN` に設定

### 4. Vercel Edge Config の設定

1. Vercelプロジェクトでストレージを有効化
2. Edge Configを作成
3. 接続文字列を環境変数に設定
4. アカウント情報をEdge Configに手動設定

#### Edge Configでのアカウント設定例
```json
{
  "accounts": [
    {
      "id": "1",
      "username": "elonmusk",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    {
      "id": "2", 
      "username": "vercel",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

## 開発環境での実行

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認できます。

## デプロイ

### Vercelへのデプロイ

1. GitHubリポジトリにプッシュ
2. [Vercel](https://vercel.com) でプロジェクトをインポート
3. 環境変数を設定
4. デプロイ実行

## 使用方法

1. **アカウント管理**：「アカウント管理」ページで管理者パスワードを使用してTwitterアカウントを登録
2. **ツイート表示**：ホームページでアカウントを選択し、「ツイート取得」ボタンをクリック
3. **キャッシュ機能**：一度取得したデータは1時間キャッシュされ、再取得時に高速表示

## 技術スタック

- **フレームワーク**: Next.js 15
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Vercel Edge Config
- **API**: Twitter API v2
- **認証**: bcryptjs
- **デプロイ**: Vercel

## ファイル構成

```
src/
├── app/
│   ├── api/
│   │   ├── accounts/route.ts    # アカウント管理API
│   │   └── tweets/route.ts      # ツイート取得API
│   ├── register/
│   │   └── page.tsx            # アカウント登録ページ
│   ├── layout.tsx              # レイアウト
│   └── page.tsx                # ホームページ
├── components/
│   ├── TweetCard.tsx           # ツイートカードコンポーネント
│   └── LoadingSpinner.tsx      # ローディングコンポーネント
├── lib/
│   ├── twitter.ts              # Twitter API クライアント
│   └── kv.ts                   # Vercel Edge Config ユーティリティ
└── types/
    └── index.ts                # TypeScript型定義
```

## ライセンス

MIT
