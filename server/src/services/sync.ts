import {prisma} from '../db';
import {fetchChannelData, fetchVideos} from './youtube';
import {Auth} from 'googleapis';

export async function syncChannelData(tokens: Auth.Credentials) {
    // 1. Fetch channel data from YouTube
    const channelData = await fetchChannelData(tokens);

    // 2. Upsert the channel — create if it doesn't exist, update if it does
    const channel = await prisma.channel.upsert({
        where: {youtubeChannelId: channelData.youtubeChannelId},
        update: {
            title: channelData.title,
            description: channelData.description,
            thumbnailUrl: channelData.thumbnailUrl,
            customUrl: channelData.customUrl,
        },
        create: {
            youtubeChannelId: channelData.youtubeChannelId,
            title: channelData.title,
            description: channelData.description,
            thumbnailUrl: channelData.thumbnailUrl,
            customUrl: channelData.customUrl,
            publishedAt: channelData.publishedAt,
        }
    });

    // 3. Save a snapshot of current statistics
    await prisma.channelSnapshot.create({
        data: {
            channelId: channel.id,
            subscriberCount: channelData.statistics.subscriberCount,
            viewCount: channelData.statistics.viewCount,
            videoCount: channelData.statistics.videoCount,
        }
    });

    // 4. Fetch all videos
    const videos = await fetchVideos(tokens, channelData.youtubeChannelId);

    // 5. Upsert each video and save a snapshot
    for (const videoData of videos) {
        const video = await prisma.video.upsert({
            where: {youtubeVideoId: videoData.youtubeVideoId},
            update: {
                title: videoData.title,
                description: videoData.description,
                thumbnailUrl: videoData.thumbnailUrl,
                duration: videoData.duration,
            },
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

    return {
        channel: channelData.title,
        videosSync: videos.length,
    };
}