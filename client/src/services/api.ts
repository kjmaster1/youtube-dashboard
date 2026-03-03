import axios from 'axios';
import type {DashboardData, Video, Insights} from '../types';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
});

export async function getAuthStatus(): Promise<boolean> {
    const res = await api.get('/auth/status');
    return res.data.authenticated;
}

export async function triggerSync(): Promise<void> {
    await api.post('/sync/now');
}

export async function getDashboardData(): Promise<DashboardData> {
    const res = await api.get('/dashboard');
    return res.data;
}

export async function getVideos(): Promise<Video[]> {
    const res = await api.get('/videos');
    return res.data;
}

export async function exportCSV(): Promise<void> {
    const response = await fetch('/api/videos/export');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube-analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
}

export async function getInsights(): Promise<Insights> {
    const res = await api.get('/insights');
    return res.data;
}

export async function getShowcase() {
    const res = await fetch('/api/public/showcase');
    if (!res.ok) throw new Error('Failed to load showcase');
    return res.json();
}