import Outreached from "../models/Outreached";
import { OutreachStatus } from "../types/types";
import { sendFollowupEmail } from "./mail.service";

export const checkFollowupReminders = async (): Promise<number> => {
    // Find all active outreaches that are SENT or FOLLOWUP
    const outreaches = await Outreached.find({
        status: { $in: [OutreachStatus.SENT, OutreachStatus.FOLLOWUP] }
    })
    .populate("userId", "name email")
    .populate({
        path: "opportunityId",
        populate: {
            path: "companyId",
            select: "name"
        }
    });

    let sentCount = 0;
    const now = new Date();

    for (const outreach of outreaches) {
        const user = outreach.userId as any;
        if (!user || !user.email) continue;

        const opp = outreach.opportunityId as any;
        if (!opp) continue;

        const companyName = opp.companyId?.name || "Company";
        const jobRole = opp.jobRole || "position";

        // Determine the base contact date (last follow-up or when the outreach was sent)
        const lastContactDate = outreach.lastInteractionAt || outreach.sentAt || (outreach as any).createdAt;
        if (!lastContactDate) continue;

        const diffTime = now.getTime() - new Date(lastContactDate).getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const notified3 = (outreach as any).notified3Day || false;
        const notified7 = (outreach as any).notified7Day || false;

        // Threshold checks (3 days & 7 days)
        if (diffDays >= 7 && !notified7) {
            // Trigger 7-day notification
            await sendFollowupEmail(
                user.email,
                user.name,
                companyName,
                jobRole,
                7,
                outreach.contactName
            );
            (outreach as any).notified7Day = true;
            (outreach as any).notified3Day = true; // set both to true
            await outreach.save();
            sentCount++;
        } else if (diffDays >= 3 && diffDays < 7 && !notified3) {
            // Trigger 3-day notification
            await sendFollowupEmail(
                user.email,
                user.name,
                companyName,
                jobRole,
                3,
                outreach.contactName
            );
            (outreach as any).notified3Day = true;
            await outreach.save();
            sentCount++;
        }
    }

    return sentCount;
};
