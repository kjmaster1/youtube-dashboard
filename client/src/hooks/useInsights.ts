import {useEffect, useState} from 'react';
import {getInsights} from '../services/api';
import type {Insights} from '../types';

export function useInsights() {
    const [data, setData] = useState<Insights | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetch() {
            try {
                setLoading(true);
                const result = await getInsights();
                setData(result);
            } catch {
                setError('Failed to load insights');
            } finally {
                setLoading(false);
            }
        }

        fetch();
    }, []);

    return {data, loading, error};
}