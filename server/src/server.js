import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRouter.js";
import taskRoutes from "./routes/taskRoutes.js";

import teamRoutes from "./routes/teamRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import projectMemberRoutes from "./routes/projectMemberRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// TEMP: логирование запросов
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRouter);
app.use("/api", taskRoutes);

app.use("/api/teams", teamRoutes);

app.use("/api", memberRoutes);
app.use("/api", projectMemberRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});