'use client';

import { Tweet } from '@/types';
import Image from 'next/image';

interface TweetCardProps {
  tweet: Tweet;
}

export default function TweetCard({ tweet }: TweetCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        {tweet.author?.profile_image_url && (
          <Image
            src={tweet.author.profile_image_url}
            alt={`${tweet.author.name} profile`}
            width={48}
            height={48}
            className="rounded-full"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-gray-900 truncate">
              {tweet.author?.name || 'Unknown User'}
            </h3>
            <span className="text-gray-500 text-sm">
              @{tweet.author?.username || 'unknown'}
            </span>
          </div>
          <p className="text-gray-700 mt-2 whitespace-pre-wrap">{tweet.text}</p>
          <div className="flex items-center justify-between mt-3 text-gray-500 text-sm">
            <span>{formatDate(tweet.created_at)}</span>
            {tweet.public_metrics && (
              <div className="flex space-x-4">
                <span className="flex items-center space-x-1">
                  <span>💬</span>
                  <span>{formatNumber(tweet.public_metrics.reply_count)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>🔄</span>
                  <span>{formatNumber(tweet.public_metrics.retweet_count)}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>❤️</span>
                  <span>{formatNumber(tweet.public_metrics.like_count)}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
