import { Worker } from "bullmq";
import { connectionOptions } from "../queues/notification.queue";
import { checkFollowupReminders } from "../services/notification.service";

export const initNotificationWorker = () => {
    const worker = new Worker(
        "outreach-notifications",
        async (job) => {
            console.log(`[BullMQ Worker] Processing job ${job.id} (${job.name})`);
            if (job.name === "check-followups") {
                const count = await checkFollowupReminders();
                console.log(`[BullMQ Worker] Follow-up check complete. Sent ${count} emails.`);
                return { sentCount: count };
            }
        },
        { connection: connectionOptions }
    );

    worker.on("completed", (job) => {
        console.log(`[BullMQ Worker] Job ${job.id} completed successfully.`);
    });

    worker.on("failed", (job, err) => {
        console.error(`[BullMQ Worker] Job ${job?.id} failed:`, err.message);
    });

    console.log("BullMQ followups notification worker initialized successfully.");
};
