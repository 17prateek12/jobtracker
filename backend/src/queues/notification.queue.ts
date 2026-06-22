import { Queue } from "bullmq";

const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const redisPort = parseInt(process.env.REDIS_PORT || "6379");

export const connectionOptions = {
    host: redisHost,
    port: redisPort,
    maxRetriesPerRequest: null,
};

export const notificationQueue = new Queue("outreach-notifications", {
    connection: connectionOptions,
});

export const initNotificationQueue = async () => {
    // Schedule check-followups job to run every hour
    await notificationQueue.add(
        "check-followups",
        {},
        {
            repeat: {
                every: 3600000, // hourly (in milliseconds)
            },
            jobId: "hourly-followup-check",
        }
    );
    console.log("BullMQ followups notification queue initialized successfully.");
};
