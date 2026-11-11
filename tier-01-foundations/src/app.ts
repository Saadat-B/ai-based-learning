import express from 'express';
import { tasksRouter } from './tasks.js';

export const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/tasks', tasksRouter);
