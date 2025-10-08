import { mailQueue } from "./mail.queue";

export class MailService {
  /**
   * Queues an email job
   */
  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      await mailQueue.add(
        "sendMail",
        { to, subject, text, html },
        {
          attempts: 3,        // retry 3 times on failure
          backoff: { type: "exponential", delay: 5000 }, // 5s, 10s, 20s...
          removeOnComplete: true, // clean up completed jobs
          removeOnFail: false,    // keep failed jobs for inspection
        }
      );
      console.log(`[MailService] Mail job queued for ${to}`);
    } catch (err) {
      console.error(`[MailService] Failed to queue mail for ${to}:`, err);
      throw err;
    }
  }
}
