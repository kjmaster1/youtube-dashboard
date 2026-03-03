import { google, Auth } from 'googleapis';

export function getYoutubeClient(tokens: Auth.Credentials) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
    oauth2Client.setCredentials(tokens);
    return google.youtube({ version: 'v3', auth: oauth2Client });
}

export async function fetchChannelData(tokens: Auth.Credentials) {
    const youtube = getYoutubeClient(tokens);

    const response = await youtube.channels.list({
        part: ['snippet', 'statistics'],
        mine: true,
    });

    const channel = response.data.items?.[0];
    if (!channel) throw new Error('No channel found for this account');

    return {
        youtubeChannelId: channel.id!,
        title: channel.snippet?.title!,
        description: channel.snippet?.description ?? null,
        thumbnailUrl: channel.snippet?.thumbnails?.default?.url ?? null,
        customUrl: channel.snippet?.customUrl ?? null,
        publishedAt: new Date(channel.snippet?.publishedAt!),
        statistics: {
            subscriberCount: parseInt(channel.statistics?.subscriberCount ?? '0'),
            viewCount: BigInt(channel.statistics?.viewCount ?? '0'),
            videoCount: parseInt(channel.statistics?.videoCount ?? '0'),
        }
    };
}

export async function fetchVideos(tokens: Auth.Credentials, channelId: string) {
    const youtube = getYoutubeClient(tokens);

    // First get the uploads playlist ID
    const channelResponse = await youtube.channels.list({
        part: ['contentDetails'],
        id: [channelId],
    });

    const uploadsPlaylistId = channelResponse.data.items?.[0]
        ?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) throw new Error('No uploads playlist found');

    // Fetch videos from the uploads playlist
    const playlistResponse = await youtube.playlistItems.list({
        part: ['snippet'],
        playlistId: uploadsPlaylistId,
        maxResults: 50,
    });

    const videoIds = playlistResponse.data.items
        ?.map(item => item.snippet?.resourceId?.videoId!)
        .filter(Boolean) ?? [];

    if (videoIds.length === 0) return [];

    // Fetch full details for each video
    const videosResponse = await youtube.videos.list({
        part: ['snippet', 'statistics', 'contentDetails'],
        id: videoIds,
    });

    return videosResponse.data.items?.map(video => ({
        youtubeVideoId: video.id!,
        title: video.snippet?.title!,
        description: video.snippet?.description ?? null,
        thumbnailUrl: video.snippet?.thumbnails?.medium?.url ?? null,
        publishedAt: new Date(video.snippet?.publishedAt!),
        duration: video.contentDetails?.duration ?? null,
        statistics: {
            viewCount: BigInt(video.statistics?.viewCount ?? '0'),
            likeCount: parseInt(video.statistics?.likeCount ?? '0'),
            commentCount: parseInt(video.statistics?.commentCount ?? '0'),
        }
    })) ?? [];
}