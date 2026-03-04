import { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useVideos } from '../hooks/useVideos';
import { formatNumber, formatDuration, formatDate, engagementRate } from '../utils/format';
import { exportCSV } from '../services/api';

type SortKey = 'publishedAt' | 'viewCount' | 'likeCount' | 'engagementRate';
type SortDir = 'asc' | 'desc';

export default function VideosPage() {
    const { videos, loading, error } = useVideos();
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('viewCount');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    function handleSort(key: SortKey) {
        if (key === sortKey) {
            setSortDir(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            setSortKey(key);
            setSortDir('desc');
        }
    }

    const filtered = videos
        .filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
        .filter(v => v.snapshots.length > 0)
        .sort((a, b) => {
            const snap_a = a.snapshots[0];
            const snap_b = b.snapshots[0];
            let valA: number;
            let valB: number;

            switch (sortKey) {
                case 'viewCount':
                    valA = parseInt(snap_a.viewCount);
                    valB = parseInt(snap_b.viewCount);
                    break;
                case 'likeCount':
                    valA = snap_a.likeCount;
                    valB = snap_b.likeCount;
                    break;
                case 'engagementRate':
                    valA = (snap_a.likeCount + snap_a.commentCount) / (parseInt(snap_a.viewCount) || 1);
                    valB = (snap_b.likeCount + snap_b.commentCount) / (parseInt(snap_b.viewCount) || 1);
                    break;
                case 'publishedAt':
                default:
                    valA = new Date(a.publishedAt).getTime();
                    valB = new Date(b.publishedAt).getTime();
                    break;
            }

            return sortDir === 'desc' ? valB - valA : valA - valB;
        });

    function SortButton({ label, column }: { label: string; column: SortKey }) {
        const active = sortKey === column;
        return (
            <button
                onClick={() => handleSort(column)}
                className={`flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors ${
                    active ? 'text-red-400' : 'text-gray-400 hover:text-white'
                }`}
            >
                {label}
                <span>{active ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}</span>
            </button>
        );
    }

    const channelTitle = localStorage.getItem('channelTitle') ?? undefined;

    if (loading) {
        return (
            <Layout channelTitle={channelTitle}>
                <div className="flex items-center justify-center h-64 text-gray-400">
                    Loading...
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout channelTitle={channelTitle}>
                <div className="flex items-center justify-center h-64 text-red-400">
                    {error}
                </div>
            </Layout>
        );
    }

    return (
        <Layout channelTitle={channelTitle}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Videos</h1>
                    <p className="text-sm text-gray-400 mt-1">
                        {filtered.length} of {videos.length} videos
                    </p>
                </div>
                <button
                    onClick={exportCSV}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-700"
                >
                    Export CSV
                </button>
                <input
                    type="text"
                    placeholder="Search videos..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="bg-gray-900 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:border-red-500"
                />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 border-b border-gray-800">
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Video</span>
                    <SortButton label="Published" column="publishedAt" />
                    <SortButton label="Views" column="viewCount" />
                    <SortButton label="Likes" column="likeCount" />
                    <SortButton label="Engagement" column="engagementRate" />
                </div>

                <div className="divide-y divide-gray-800">
                    {filtered.map(video => {
                        const snap = video.snapshots[0];
                        return (
                            <div
                                key={video.id}
                                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-3 hover:bg-gray-800 transition-colors items-center"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <img
                                        src={video.thumbnailUrl ?? ''}
                                        alt={video.title}
                                        className="w-16 h-9 object-cover rounded shrink-0"
                                    />
                                    <div className="min-w-0">

                                    <a    href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sm text-white hover:text-red-400 transition-colors truncate block"
                                        >
                                        {video.title}
                                    </a>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {formatDuration(video.duration)}
                                    </p>
                                </div>
                            </div>
                        <span className="text-sm text-gray-300">
                  {formatDate(video.publishedAt)}
                </span>
                        <span className="text-sm text-white font-medium">
                  {formatNumber(snap.viewCount)}
                </span>
                        <span className="text-sm text-gray-300">
                  {formatNumber(snap.likeCount)}
                </span>
                        <span className="text-sm text-gray-300">
                  {engagementRate(snap.viewCount, snap.likeCount, snap.commentCount)}
                </span>
                    </div>
                    );
                    })}
                </div>
            </div>
        </Layout>
    );
}