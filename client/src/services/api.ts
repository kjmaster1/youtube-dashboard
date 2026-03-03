import axios from 'axios';
import type {DashboardData, Video} from '../types';

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