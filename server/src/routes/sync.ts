import {Request, Response, Router} from 'express';
import {Auth} from 'googleapis';
import 'express-session';
import {syncChannelData} from '../services/sync';
import {prisma} from '../db';

declare module 'express-session' {
    interface SessionData {
        tokens?: Auth.Credentials;
    }
}

const router = Router();

async function getTokens(req: Request): Promise<Auth.Credentials | null> {
    // Use session tokens if available
    if (req.session.tokens) return req.session.tokens;

    // In development, fall back to tokens stored in database
    if (process.env.NODE_ENV !== 'production') {
        const apiKey = req.headers['x-api-key'];
        if (apiKey === process.env.DEV_API_KEY) {
            const stored = await prisma.authToken.findUnique({
                where: {id: 'primary'}
            });
            if (stored) {
                return {
                    access_token: stored.accessToken,
                    refresh_token: stored.refreshToken ?? undefined,
                    expiry_date: stored.expiryDate?.getTime() ?? undefined,
                };
            }
        }
    }

    return null;
}

router.post('/now', async (req: Request, res: Response) => {
    const tokens = await getTokens(req);

    if (!tokens) {
        res.status(401).json({error: 'Not authenticated'});
        return;
    }

    try {
        const result = await syncChannelData(tokens);
        res.json({success: true, ...result});
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({error: 'Sync failed'});
    }
});

export default router;