import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes.js';
import { initDB } from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: [
    "https://community-vaofficial.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.post('/api/test', (req, res) => {
  res.json({ success: true });
});

// Main router mounting
app.use('/api', router);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({ error: 'Internal Server Error. Please inspect server logs.' });
});

// Run DB migrations and bootstrap server
const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` COMMUNITY.VA Server running on port ${PORT}`);
    console.log(` API Endpoint base: http://localhost:${PORT}/api`);
    console.log(`===============================================`);
  });
};

startServer();
