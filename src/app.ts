import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import "express-async-errors";
import { Request, Response, NextFunction } from "express";
import prisma from "./config/prisma";
import { errorHandler } from "./middlewares/error.middleware";
import { ResponseHandler } from "./utils/response";
import { ApiError, NotFoundError } from "./utils/error";
import { ErrorCode } from "./constants/errors";
import authRouter from "./routes/auth.route";
import publicRoutes from './routes/public.route';

const app = express();

// Security Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req: Request, res: Response) => {
      ResponseHandler.error(
        res,
        new ApiError(
          ErrorCode.TOO_MANY_REQUESTS,
          429,
          "Too many requests from this IP"
        )
      );
    },
  })
);

// Body Parsing
app.use(express.json({ limit: "10kb" }));

// Routes

app.use('/api/v1/auth', authRouter);
app.use('/api/v1', publicRoutes);


app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Heart is betting....." });
});

// 404 Handler
app.use((req: Request, res: Response) => {
  ResponseHandler.error(res, new NotFoundError("Endpoint not found"));
});

// Error Handling
app.use(errorHandler);

// Database Connection
prisma
  .$connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err: Error) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

export default app;
