import Layout from '../components/layout/Layout';
import { useInsights } from '../hooks/useInsights';
import { formatNumber } from '../utils/format';

export default function InsightsPage() {
    const { data, loading, error } = useInsights();

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
            </Layout>
        );
    }

    if (error || !data) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64 text-red-400">{error}</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Content Insights</h1>
                <p className="text-sm text-gray-400 mt-1">
                    Patterns derived from your channel's performance data
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h2 className="text-base font-semibold text-white mb-1">Best Days to Post</h2>
                    <p className="text-xs text-gray-500 mb-4">Average views by publish day</p>
                    <div className="flex flex-col gap-3">
                        {data.bestDayToPost.map((d, i) => (
                            <div key={d.day} className="flex items-center gap-3">
                <span className={`text-sm font-bold w-5 ${i === 0 ? 'text-red-400' : 'text-gray-500'}`}>
                  {i + 1}
                </span>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-white">{d.day}</span>
                                        <span className="text-sm text-gray-400">{formatNumber(d.avgViews)} avg views</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-red-500 rounded-full"
                                            style={{
                                                width: `${(d.avgViews / data.bestDayToPost[0].avgViews) * 100}%`
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 w-16 text-right">{d.count} videos</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h2 className="text-base font-semibold text-white mb-1">Shorts vs Long Form</h2>
                    <p className="text-xs text-gray-500 mb-4">Performance comparison by format</p>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Shorts', data: data.formatComparison.shorts, color: 'text-red-400' },
                            { label: 'Long Form', data: data.formatComparison.longForm, color: 'text-blue-400' },
                        ].map(({ label, data: fd, color }) => (
                            <div key={label} className="bg-gray-800 rounded-lg p-4">
                                <p className={`text-sm font-semibold mb-3 ${color}`}>{label}</p>
                                <div className="flex flex-col gap-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Videos</p>
                                        <p className="text-lg font-bold text-white">{fd.count}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Avg Views</p>
                                        <p className="text-lg font-bold text-white">{formatNumber(fd.avgViews)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Avg Engagement</p>
                                        <p className="text-lg font-bold text-white">{fd.avgEngagement}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h2 className="text-base font-semibold text-white mb-1">Top Performing Titles</h2>
                    <p className="text-xs text-gray-500 mb-4">Your 10 highest view count videos</p>
                    <div className="flex flex-col gap-2">
                        {data.topTitles.map((title, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                                <p className="text-sm text-gray-300 truncate">{title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <h2 className="text-base font-semibold text-white mb-1">Lowest Performing Titles</h2>
                    <p className="text-xs text-gray-500 mb-4">Your 10 lowest view count videos</p>
                    <div className="flex flex-col gap-2">
                        {data.bottomTitles.map((title, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 w-4">{i + 1}</span>
                                <p className="text-sm text-gray-300 truncate">{title}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </Layout>
    );
}