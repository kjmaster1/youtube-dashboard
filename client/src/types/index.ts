export interface ChannelStats {
    id: string;
    title: string;
    description: string | null;
    thumbnailUrl: string | null;
    customUrl: string | null;
    publishedAt: string;
}

export interface ChannelSnapshot {
    id: string;
    subscriberCount: number;
    viewCount: string; // BigInt comes back as string from JSON
    videoCount: number;
    recordedAt: string;
}

export interface Video {
    id: string;
    youtubeVideoId: string;
    title: string;
    thumbnailUrl: string | null;
    publishedAt: string;
    duration: string | null;
    snapshots: VideoSnapshot[];
}

export interface VideoSnapshot {
    id: string;
    viewCount: string; // BigInt comes back as string from JSON
    likeCount: number;
    commentCount: number;
    recordedAt: string;
}

export interface DashboardData {
    channel: ChannelStats;
    latestSnapshot: ChannelSnapshot;
    snapshotHistory: ChannelSnapshot[];
    topVideos: Video[];
}