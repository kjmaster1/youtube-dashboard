import { useState, useEffect } from 'react';
import { getDashboardData } from '../services/api';
import type {DashboardData} from '../types';

interface UseDashboardResult {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    async function fetchData() {
        try {
            setLoading(true);
            setError(null);
            const result = await getDashboardData();
            setData(result);
        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return { data, loading, error, refetch: fetchData };
}