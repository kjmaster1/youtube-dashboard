import { Router, Request, Response } from 'express';
import { prisma } from '../db';

const router = Router();

router.get('/showcase', async (req: Request, res: Response) => {
    try {
        const channel = await prisma.channel.findFirst({
            include: {
                snapshots: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1,
                }
            }
        });

        if (!channel) {
            res.status(404).json({ error: 'No channel data found' });
            return;
        }

        const topVideos = await prisma.video.findMany({
            where: { channelId: channel.id },
            include: {
                snapshots: {
                    orderBy: { recordedAt: 'desc' },
                    take: 1,
                }
            }
        });

        const sorted = topVideos
            .filter(v => v.snapshots.length > 0)
            .sort((a, b) =>
                Number(b.snapshots[0].viewCount - a.snapshots[0].viewCount)
            )
            .slice(0, 6);

        const snapshot = channel.snapshots[0];

        res.json({
            channel: {
                title: channel.title,
                description: channel.description,
                thumbnailUrl: channel.thumbnailUrl,
                customUrl: channel.customUrl,
                publishedAt: channel.publishedAt,
            },
            stats: {
                subscriberCount: snapshot.subscriberCount,
                viewCount: snapshot.viewCount.toString(),
                videoCount: snapshot.videoCount,
            },
            topVideos: sorted.map(v => ({
                youtubeVideoId: v.youtubeVideoId,
                title: v.title,
                thumbnailUrl: v.thumbnailUrl,
                publishedAt: v.publishedAt,
                duration: v.duration,
                viewCount: v.snapshots[0].viewCount.toString(),
                likeCount: v.snapshots[0].likeCount,
                commentCount: v.snapshots[0].commentCount,
            }))
        });
    } catch (error) {
        console.error('Showcase error:', error);
        res.status(500).json({ error: 'Failed to load showcase' });
    }
});

export default router;