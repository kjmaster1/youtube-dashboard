import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const channel = await prisma.channel.findFirst({
            include: {
                snapshots: {
                    orderBy: { recordedAt: 'desc' },
                    take: 30, // last 30 snapshots for trend charts
                },
            }
        });

        if (!channel) {
            res.status(404).json({ error: 'No channel data found. Please sync first.' });
            return;
        }

        const topVideos = await prisma.video.findMany({
            where: { channelId: channel.id },
            include: {
                snapshots: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1, // just the latest snapshot per video
                }
            },
            orderBy: {
                snapshots: {
                    _count: 'desc',
                }
            },
            take: 10,
        });

        // Sort top videos by latest view count
        const sortedVideos = topVideos.sort((a, b) => {
            const aViews = BigInt(a.snapshots[0]?.viewCount ?? 0);
            const bViews = BigInt(b.snapshots[0]?.viewCount ?? 0);
            return aViews > bViews ? -1 : 1;
        });

        res.json({
            channel: {
                id: channel.id,
                title: channel.title,
                description: channel.description,
                thumbnailUrl: channel.thumbnailUrl,
                customUrl: channel.customUrl,
                publishedAt: channel.publishedAt,
            },
            latestSnapshot: channel.snapshots.length > 0 ? {
                ...channel.snapshots[channel.snapshots.length - 1],
                viewCount: channel.snapshots[channel.snapshots.length - 1].viewCount.toString(),
            } : null,
            snapshotHistory: channel.snapshots.map(s => ({
                ...s,
                viewCount: s.viewCount.toString(),
            })),
            topVideos: sortedVideos.map(video => ({
                ...video,
                snapshots: video.snapshots.map(s => ({
                    ...s,
                    viewCount: s.viewCount.toString(),
                }))
            })),
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to load dashboard data' });
    }
});

export default router;