import cron from 'node-cron';
import { prisma } from '../db';
import { fetchChannelData, fetchVideos } from './youtube';

export function startScheduler() {
    // Runs every day at 9am
    cron.schedule('0 9 * * *', async () => {
        console.log('[Scheduler] Starting daily sync...');

        try {
            const stored = await prisma.authToken.findUnique({
                where: { id: 'primary' }
            });

            if (!stored) {
                console.log('[Scheduler] No auth token found, skipping sync');
                return;
            }

            const tokens = {
                access_token: stored.accessToken,
                refresh_token: stored.refreshToken ?? undefined,
                expiry_date: stored.expiryDate?.getTime() ?? undefined,
            };

            const channelData = await fetchChannelData(tokens);

            const channel = await prisma.channel.upsert({
                where: { youtubeChannelId: channelData.youtubeChannelId },
                update: { title: channelData.title },
                create: {
                    youtubeChannelId: channelData.youtubeChannelId,
                    title: channelData.title,
                    description: channelData.description,
                    thumbnailUrl: channelData.thumbnailUrl,
                    customUrl: channelData.customUrl,
                    publishedAt: channelData.publishedAt,
                }
            });

            await prisma.channelSnapshot.create({
                data: {
                    channelId: channel.id,
                    subscriberCount: channelData.statistics.subscriberCount,
                    viewCount: channelData.statistics.viewCount,
                    videoCount: channelData.statistics.videoCount,
                }
            });

            const videos = await fetchVideos(tokens, channelData.youtubeChannelId);

            for (const videoData of videos) {
                const video = await prisma.video.upsert({
                    where: { youtubeVideoId: videoData.youtubeVideoId },
                    update: { title: videoData.title },
                    create: {
                        youtubeVideoId: videoData.youtubeVideoId,
                        channelId: channel.id,
                        title: videoData.title,
                        description: videoData.description,
                        thumbnailUrl: videoData.thumbnailUrl,
                        publishedAt: videoData.publishedAt,
                        duration: videoData.duration,
                    }
                });

                await prisma.videoSnapshot.create({
                    data: {
                        videoId: video.id,
                        viewCount: videoData.statistics.viewCount,
                        likeCount: videoData.statistics.likeCount,
                        commentCount: videoData.statistics.commentCount,
                    }
                });
            }

            console.log(`[Scheduler] Daily sync complete — ${videos.length} videos updated`);
        } catch (error) {
            console.error('[Scheduler] Daily sync failed:', error);
        }
    });

    console.log('[Scheduler] Daily sync scheduled for 9:00am');
}