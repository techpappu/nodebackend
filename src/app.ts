import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { errorHandler } from "./middleware/error-handler";
import { notFound } from "./middleware/not-found";
import { authRouter } from "./routes/auth.routes";
import { noteRouter } from "./routes/note.routes";
import { postRouter } from "./routes/post.routes";
import { userRouter } from "./routes/user.routes";

export const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));
app.use("/auth", authRouter);
app.use("/notes", noteRouter);
app.use("/users", userRouter);
app.use("/posts", postRouter);
app.use(notFound);
app.use(errorHandler);
