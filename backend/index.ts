import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './src/auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 8999;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
app.get('/', (_req, res) => {
    res.send('Finance Manager API running!');
  });
    