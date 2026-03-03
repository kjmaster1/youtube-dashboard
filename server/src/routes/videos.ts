import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const channel = await prisma.channel.findFirst();

        if (!channel) {
            res.status(404).json({ error: 'No channel data found. Please sync first.' });
            return;
        }

        const videos = await prisma.video.findMany({
            where: { channelId: channel.id },
            include: {
                snapshots: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1,
                }
            },
            orderBy: { publishedAt: 'desc' },
        });

        res.json(videos.map(video => ({
            ...video,
            snapshots: video.snapshots.map(s => ({
                ...s,
                viewCount: s.viewCount.toString(),
            }))
        })));
    } catch (error) {
        console.error('Videos error:', error);
        res.status(500).json({ error: 'Failed to load videos' });
    }
});

router.get('/export', async (req: Request, res: Response) => {
    try {
        const channel = await prisma.channel.findFirst();
        if (!channel) {
            res.status(404).json({ error: 'No channel data found' });
            return;
        }

        const videos = await prisma.video.findMany({
            where: { channelId: channel.id },
            include: {
                snapshots: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1,
                }
            },
            orderBy: { publishedAt: 'desc' },
        });

        const rows = [
            ['Title', 'Published', 'Duration', 'Views', 'Likes', 'Comments', 'Engagement Rate', 'URL'],
            ...videos
                .filter(v => v.snapshots.length > 0)
                .map(v => {
                    const snap = v.snapshots[0];
                    const views = parseInt(snap.viewCount.toString());
                    const engagement = views > 0
                        ? (((snap.likeCount + snap.commentCount) / views) * 100).toFixed(2) + '%'
                        : '0%';
                    return [
                        `"${v.title.replace(/"/g, '""')}"`,
                        new Date(v.publishedAt).toLocaleDateString('en-GB'),
                        v.duration ?? '',
                        snap.viewCount.toString(),
                        snap.likeCount.toString(),
                        snap.commentCount.toString(),
                        engagement,
                        `https://youtube.com/watch?v=${v.youtubeVideoId}`,
                    ];
                })
        ];

        const csv = rows.map(r => r.join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="youtube-analytics.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Export failed' });
    }
});

export default router;