import { Queue, Worker, Job } from "bullmq";
import Redis from "ioredis";
import nodemailer from "nodemailer";

const connection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // ⚠ required for BullMQ
});

connection.on("connect", () => {
  console.log("[Redis] Connecting to Redis...");
});

connection.on("ready", () => {
  console.log("[Redis] Redis connection is ready!");
});

connection.on("error", (err) => {
  console.error("[Redis] Redis connection error:", err);
});

connection.on("close", () => {
  console.warn("[Redis] Redis connection closed");
});

connection.on("reconnecting", () => {
  console.log("[Redis] Reconnecting to Redis...");
});

connection.on("end", () => {
  console.warn("[Redis] Redis connection ended");
});

// Nodemailer transporter with pool
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465", // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

// Queue for sending emails
export const mailQueue = new Queue("mailQueue", { connection });

// Worker that processes email jobs
export const mailWorker = new Worker(
  "mailQueue",
  async (job: Job<any, any, string>) => {
    const { to, subject, text, html } = job.data;
    try {
      await transporter.sendMail({
        from: `"Game App" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html, 
      });
      console.log(`[MailWorker] Mail sent to ${to}`);
    } catch (err) {
      console.error(`[MailWorker] Failed to send mail to ${to}:`, err);
      throw err; // triggers retry
    }
  },
  {
    connection,
    concurrency: 5,
  }
);

// Optional: handle failed jobs for logging
mailWorker.on("failed", (job, err) => {
  const email = job?.data?.to ?? "unknown";
  console.error(`[MailWorker] Job failed for ${email}:`, err);
});
