import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import {prisma} from './db';
import authRouter from './routes/auth';
import syncRouter from './routes/sync';
import dashboardRouter from './routes/dashboard';
import videosRouter from './routes/videos';
import insightsRouter from './routes/insights';
import publicRouter from './routes/public';
import {startScheduler} from './services/scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Public routes — allow all origins, no credentials needed
app.use('/api/public', cors(), publicRouter);

// All other routes — restrict to client URL only
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
    }
}));

app.use('/api/auth', authRouter);
app.use('/api/sync', syncRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/videos', videosRouter);
app.use('/api/insights', insightsRouter);

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({status: 'ok', database: 'connected'});
    } catch (error) {
        res.status(200).json({status: 'ok', database: 'disconnected'});
    }
});

app.get('/', (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
});

startScheduler();

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});