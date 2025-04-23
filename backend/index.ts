// backend/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes';
import transactionRoutes from './src/routes/transactionRoutes';
import budgetRoutes from './src/routes/budgetRoutes';
import chatbotRoutes from './src/routes/chatbotRoutes';
import dashboardRoutes from './src/routes/dashboardRoutes';
import recurringRoutes from './src/routes/recurringRoutes';
import calendarRoutes from './src/routes/calendarRoutes';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/recurring-payments', recurringRoutes);
app.use('/api/calendar', calendarRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

