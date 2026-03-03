// Format large numbers: 53100 → "53.1K"
export function formatNumber(num: number | string): string {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
}

// Format ISO 8601 duration: "PT1M3S" → "1:03"
export function formatDuration(duration: string | null): string {
    if (!duration) return '—';
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;
    const hours = parseInt(match[1] ?? '0');
    const minutes = parseInt(match[2] ?? '0');
    const seconds = parseInt(match[3] ?? '0');
    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// Format engagement rate: (likes + comments) / views * 100
export function engagementRate(
    views: string,
    likes: number,
    comments: number
): string {
    const v = parseInt(views);
    if (v === 0) return '0%';
    return `${(((likes + comments) / v) * 100).toFixed(2)}%`;
}

// Format date: "2025-06-28T08:07:24.000Z" → "28 Jun 2025"
export function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}