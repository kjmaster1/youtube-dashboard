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

export default router;