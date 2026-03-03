import { useState } from 'react';
import Layout from '../components/layout/Layout';
import StatCard from '../components/StatCard';
import TopVideos from '../components/TopVideos';
import SubscriberChart from '../components/SubscriberChart';
import { useDashboard } from '../hooks/useDashboard';
import { triggerSync } from '../services/api';
import { formatNumber, formatDate } from '../utils/format';

export default function DashboardPage() {
    const { data, loading, error, refetch } = useDashboard();
    const [syncing, setSyncing] = useState(false);

    async function handleSync() {
        setSyncing(true);
        try {
            await triggerSync();
            await refetch();
        } catch (err) {
            console.error('Sync failed', err);
        } finally {
            setSyncing(false);
        }
    }

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64 text-gray-400">
                    Loading...
                </div>
            </Layout>
        );
    }

    if (error || !data) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64 text-red-400">
                    {error ?? 'No data found. Try syncing first.'}
                </div>
            </Layout>
        );
    }

    const { channel, latestSnapshot, snapshotHistory, topVideos } = data;

    return (
        <Layout>
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {channel.thumbnailUrl && (
                        <img
                            src={channel.thumbnailUrl}
                            alt={channel.title}
                            className="w-12 h-12 rounded-full"
                        />
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">{channel.title}</h1>
                        <p className="text-sm text-gray-400">
                            {channel.customUrl} · Since {formatDate(channel.publishedAt)}
                        </p>
                    </div>
                </div>
                <button
                    onClick={handleSync}
                    disabled={syncing}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
                <StatCard
                    label="Subscribers"
                    value={formatNumber(latestSnapshot.subscriberCount)}
                    sub="Total"
                />
                <StatCard
                    label="Total Views"
                    value={formatNumber(latestSnapshot.viewCount)}
                    sub="All time"
                />
                <StatCard
                    label="Videos"
                    value={latestSnapshot.videoCount.toString()}
                    sub="Published"
                />
                <StatCard
                    label="Avg Views"
                    value={formatNumber(
                        Math.round(parseInt(latestSnapshot.viewCount) / latestSnapshot.videoCount)
                    )}
                    sub="Per video"
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
                <SubscriberChart snapshots={snapshotHistory} />
                <TopVideos videos={topVideos} />
            </div>
        </Layout>
    );
}