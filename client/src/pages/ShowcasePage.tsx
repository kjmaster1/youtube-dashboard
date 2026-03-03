import {useEffect, useState} from 'react';
import {getShowcase} from '../services/api';
import {engagementRate, formatDate, formatDuration, formatNumber} from '../utils/format';

interface ShowcaseData {
    channel: {
        title: string;
        description: string | null;
        thumbnailUrl: string | null;
        customUrl: string | null;
        publishedAt: string;
    };
    stats: {
        subscriberCount: number;
        viewCount: string;
        videoCount: number;
    };
    topVideos: {
        youtubeVideoId: string;
        title: string;
        thumbnailUrl: string | null;
        publishedAt: string;
        duration: string | null;
        viewCount: string;
        likeCount: number;
        commentCount: number;
    }[];
}

export default function ShowcasePage() {
    const [data, setData] = useState<ShowcaseData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getShowcase()
            .then(setData)
            .catch(() => setError('Failed to load showcase'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    const {channel, stats, topVideos} = data;

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-4xl mx-auto px-6 py-16">

                <div className="flex items-center gap-6 mb-12">
                    {channel.thumbnailUrl && (
                        <img
                            src={channel.thumbnailUrl}
                            alt={channel.title}
                            className="w-20 h-20 rounded-full ring-2 ring-red-500"
                        />
                    )}
                    <div>
                        <h1 className="text-3xl font-bold">{channel.title}</h1>
                        <p className="text-gray-400 mt-1">
                            {channel.customUrl} · Creating since {formatDate(channel.publishedAt)}
                        </p>
                        {channel.description && (
                            <p className="text-gray-500 text-sm mt-2 max-w-lg line-clamp-2">
                                {channel.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-12">
                    {[
                        {label: 'Subscribers', value: formatNumber(stats.subscriberCount)},
                        {label: 'Total Views', value: formatNumber(stats.viewCount)},
                        {label: 'Videos Published', value: stats.videoCount.toString()},
                    ].map(stat => (
                        <div
                            key={stat.label}
                            className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center"
                        >
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Top Videos</h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {topVideos.map(video => (
                            <a
                                key={video.youtubeVideoId}
                                href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-4 hover:border-red-500 transition-colors group"
                            >
                                <img
                                    src={video.thumbnailUrl ?? ''}
                                    alt={video.title}
                                    className="w-24 h-14 object-cover rounded shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white group-hover:text-red-400 transition-colors truncate">
                                        {video.title}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDuration(video.duration)} · {formatDate(video.publishedAt)}
                                    </p>
                                    <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-400">
                      {formatNumber(video.viewCount)} views
                    </span>
                                        <span className="text-xs text-gray-500">
                      {engagementRate(video.viewCount, video.likeCount, video.commentCount)} eng.
                    </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-6 mt-12 flex items-center justify-between">
                    <p className="text-xs text-gray-600">
                        Powered by a custom-built YouTube Analytics Dashboard
                    </p>
                    <a
                        href="https://github.com/kjmaster1/youtube-dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                    >
                        View Source →
                    </a>
                </div>

            </div>
        </div>
    );
}