import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
// @ts-ignore
import pool from "./config/db";
import authRoutes from "./routes/authRoutes";
import taskRoutes from "./routes/taskRoutes";
import userRoutes from "./routes/userRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import {scheduleCronJobs,runRepeatTasks} from "./cronJob";  // Import the cron job schedule function


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
scheduleCronJobs();  // This starts your cron job when the server starts

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',  // Allow requests from your Next.js frontend
  methods: 'GET,POST,PUT',
  credentials: true,
}));
app.use(express.json());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/user",userRoutes,);
app.use("api/category",categoryRoutes)
// @ts-ignore
app.get("/", (req, res) => {
  res.send("🚀 Server is running!");
});

// Create an endpoint for triggering the cron job manually
// @ts-ignore
app.get('/run-cron-job', async (req, res) => {
  try {
      await runRepeatTasks();  // Manually trigger the cron job
      res.send('Cron job triggered successfully.');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error triggering cron job.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
