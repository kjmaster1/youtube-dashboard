import type {Video} from '../types';
import {engagementRate, formatDuration, formatNumber} from '../utils/format';

interface TopVideosProps {
    videos: Video[];
}

export default function TopVideos({videos}: TopVideosProps) {
    const sorted = [...videos]
        .filter(v => v.snapshots.length > 0)
        .sort((a, b) =>
            parseInt(b.snapshots[0].viewCount) - parseInt(a.snapshots[0].viewCount)
        )
        .slice(0, 10);

    return (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Top Videos</h2>
            <div className="flex flex-col gap-3">
                {sorted.map((video, index) => (
                    <div key={video.id} className="flex items-center gap-3">
                        <span className="text-gray-600 text-sm w-5 shrink-0">{index + 1}</span>
                        <img
                            src={video.thumbnailUrl ?? ''}
                            alt={video.title}
                            className="w-16 h-9 object-cover rounded shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <a
                                href={`https://youtube.com/watch?v=${video.youtubeVideoId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-white hover:text-red-400 transition-colors truncate block"
                            >
                                {video.title}
                            </a>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {formatDuration(video.duration)}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-white">
                                {formatNumber(video.snapshots[0].viewCount)}
                            </p>
                            <p className="text-xs text-gray-500">
                                {engagementRate(
                                    video.snapshots[0].viewCount,
                                    video.snapshots[0].likeCount,
                                    video.snapshots[0].commentCount
                                )} eng.
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}