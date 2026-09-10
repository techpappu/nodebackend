import dns from "node:dns";
import mongoose from "mongoose";
import { env } from "./env";

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);
  } catch (error) {
    const isSrvDnsRefusal =
      env.mongoUri.startsWith("mongodb+srv://") &&
      error instanceof Error &&
      "code" in error &&
      error.code === "ECONNREFUSED" &&
      error.message.includes("querySrv");

    if (!isSrvDnsRefusal) throw error;

    console.warn("Local DNS refused the MongoDB SRV query; retrying with public DNS");
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    await mongoose.connect(env.mongoUri);
  }
  console.log("MongoDB connected");
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
