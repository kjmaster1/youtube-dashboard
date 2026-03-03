import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import { prisma } from './db';
import authRouter from './routes/auth';
import syncRouter from './routes/sync';
import dashboardRouter from './routes/dashboard';
import videosRouter from './routes/videos';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
    }
}));

app.use('/api/auth', authRouter);
app.use('/api/sync', syncRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/videos', videosRouter);

app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});