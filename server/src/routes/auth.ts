import {Request, Response, Router} from 'express';
import {Auth, google} from 'googleapis';
import 'express-session';
import {prisma} from '../db';

declare module 'express-session' {
    interface SessionData {
        tokens?: Auth.Credentials;
    }
}

const router = Router();

const SCOPES = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
];

function getOAuthClient() {
    return new google.auth.OAuth2({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
}

// Step 1 of OAuth — redirect user to Google's login page
router.get('/login', (req: Request, res: Response) => {
    const oauth2Client = getOAuthClient();
    console.log('GOOGLE_REDIRECT_URI:', JSON.stringify(process.env.GOOGLE_REDIRECT_URI));
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent',
    });
    console.log('Generated auth URL:', authUrl);
    res.redirect(authUrl);
});

// Step 2 of OAuth — Google redirects back here with an auth code
router.get('/callback', async (req: Request, res: Response) => {
    const oauth2Client = getOAuthClient();
    const {code} = req.query;

    try {
        const {tokens} = await oauth2Client.getToken(code as string);
        req.session.tokens = tokens;

        await prisma.authToken.upsert({
            where: {id: 'primary'},
            update: {
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token ?? undefined,
                expiryDate: tokens.expiry_date
                    ? new Date(tokens.expiry_date)
                    : undefined,
            },
            create: {
                id: 'primary',
                accessToken: tokens.access_token!,
                refreshToken: tokens.refresh_token ?? undefined,
                expiryDate: tokens.expiry_date
                    ? new Date(tokens.expiry_date)
                    : undefined,
            }
        });

        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`);
    } catch (error) {
        console.error('OAuth callback error:', error);
        res.status(500).json({error: 'Authentication failed'});
    }
});

// Check if the current user is logged in
router.get('/status', (req: Request, res: Response) => {
    if (req.session.tokens) {
        res.json({authenticated: true});
    } else {
        res.json({authenticated: false});
    }
});

// Log out
router.get('/logout', (req: Request, res: Response) => {
    req.session.destroy(() => {
        res.json({success: true});
    });
});

export default router;