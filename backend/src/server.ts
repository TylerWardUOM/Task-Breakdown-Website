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


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

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

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
