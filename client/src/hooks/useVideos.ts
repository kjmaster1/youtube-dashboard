import {useEffect, useState} from 'react';
import {getVideos} from '../services/api';
import type {Video} from '../types';

interface UseVideosResult {
    videos: Video[];
    loading: boolean;
    error: string | null;
}

export function useVideos(): UseVideosResult {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchVideos() {
            try {
                setLoading(true);
                const result = await getVideos();
                setVideos(result);
            } catch (err) {
                setError('Failed to load videos');
            } finally {
                setLoading(false);
            }
        }

        fetchVideos();
    }, []);

    return {videos, loading, error};
}