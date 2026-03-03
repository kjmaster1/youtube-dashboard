import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type {ChannelSnapshot} from '../types';
import { formatNumber, formatDate } from '../utils/format';

interface SubscriberChartProps {
    snapshots: ChannelSnapshot[];
}

export default function SubscriberChart({ snapshots }: SubscriberChartProps) {
    const data = snapshots.map(s => ({
        date: formatDate(s.recordedAt),
        subscribers: s.subscriberCount,
        views: parseInt(s.viewCount),
    }));

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">
                Subscriber Growth
            </h2>
            {data.length < 2 ? (
                <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
                    Sync again tomorrow to start seeing growth trends
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            tickLine={false}
                        />
                        <YAxis
                            tickFormatter={formatNumber}
                            tick={{ fill: '#6b7280', fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#111827',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                            }}
                            labelStyle={{ color: '#f9fafb' }}
                            itemStyle={{ color: '#ef4444' }}
                            formatter={(value: number | undefined) => [formatNumber(value ?? 0), 'Subscribers']}
                        />
                        <Line
                            type="monotone"
                            dataKey="subscribers"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}