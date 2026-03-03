import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const channel = await prisma.channel.findFirst();
        if (!channel) {
            res.status(404).json({ error: 'No data found' });
            return;
        }

        const videos = await prisma.video.findMany({
            where: { channelId: channel.id },
            include: {
                snapshots: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1,
                }
            }
        });

        const withStats = videos
            .filter(v => v.snapshots.length > 0 && parseInt(v.snapshots[0].viewCount.toString()) > 0)
            .map(v => {
                const snap = v.snapshots[0];
                const views = parseInt(snap.viewCount.toString());
                const engagement = (snap.likeCount + snap.commentCount) / views;
                const day = new Date(v.publishedAt).toLocaleDateString('en-GB', { weekday: 'long' });
                const durationSecs = parseDurationToSeconds(v.duration);
                return { views, engagement, day, durationSecs, title: v.title };
            });

        // Best day to post
        const dayStats: Record<string, { totalViews: number; count: number }> = {};
        for (const v of withStats) {
            if (!dayStats[v.day]) dayStats[v.day] = { totalViews: 0, count: 0 };
            dayStats[v.day].totalViews += v.views;
            dayStats[v.day].count += 1;
        }

        const bestDay = Object.entries(dayStats)
            .map(([day, stats]) => ({ day, avgViews: Math.round(stats.totalViews / stats.count), count: stats.count }))
            .sort((a, b) => b.avgViews - a.avgViews);

        // Short vs long form performance
        const shorts = withStats.filter(v => v.durationSecs <= 60);
        const longForm = withStats.filter(v => v.durationSecs > 60);

        const avgViewsShorts = shorts.length
            ? Math.round(shorts.reduce((s, v) => s + v.views, 0) / shorts.length)
            : 0;
        const avgViewsLong = longForm.length
            ? Math.round(longForm.reduce((s, v) => s + v.views, 0) / longForm.length)
            : 0;

        const avgEngagementShorts = shorts.length
            ? shorts.reduce((s, v) => s + v.engagement, 0) / shorts.length
            : 0;
        const avgEngagementLong = longForm.length
            ? longForm.reduce((s, v) => s + v.engagement, 0) / longForm.length
            : 0;

        // Top performing titles keywords
        const topVideos = [...withStats].sort((a, b) => b.views - a.views).slice(0, 10);
        const bottomVideos = [...withStats].sort((a, b) => a.views - b.views).slice(0, 10);

        res.json({
            bestDayToPost: bestDay.slice(0, 3),
            formatComparison: {
                shorts: {
                    count: shorts.length,
                    avgViews: avgViewsShorts,
                    avgEngagement: (avgEngagementShorts * 100).toFixed(2) + '%',
                },
                longForm: {
                    count: longForm.length,
                    avgViews: avgViewsLong,
                    avgEngagement: (avgEngagementLong * 100).toFixed(2) + '%',
                }
            },
            topTitles: topVideos.map(v => v.title),
            bottomTitles: bottomVideos.map(v => v.title),
        });
    } catch (error) {
        console.error('Insights error:', error);
        res.status(500).json({ error: 'Failed to generate insights' });
    }
});

function parseDurationToSeconds(duration: string | null): number {
    if (!duration) return 0;
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    return (
        parseInt(match[1] ?? '0') * 3600 +
        parseInt(match[2] ?? '0') * 60 +
        parseInt(match[3] ?? '0')
    );
}

export default router;