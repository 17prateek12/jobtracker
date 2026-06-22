import nodemailer from "nodemailer";

const getTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER || "ecomreply@gmail.com",
            pass: process.env.SMTP_PASS || "qmab oouk xmus lowa",
        },
    });
};

export const sendFollowupEmail = async (
    userEmail: string,
    userName: string,
    companyName: string,
    role: string,
    daysElapsed: number,
    contactName?: string
) => {
    const transporter = getTransporter();
    const recipientLabel = contactName ? contactName : "your contact";
    const subject = `Job Tracker Reminder: Follow up with ${companyName} (${role})`;

    const text = `Hi ${userName},

This is a reminder that it has been ${daysElapsed} days since you last contacted ${recipientLabel} at ${companyName} regarding the ${role} position.

Following up is key to staying fresh in the recruiter's mind! You can use one of your cold outreach or follow-up email templates directly within the Job Tracker interface to reach out.

Best,
Your Job Tracker OS`;

    const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; padding: 24px; border: 1px solid #e5e4e7; border-radius: 8px; color: #6b6375;">
            <div style="font-size: 24px; font-weight: bold; color: #aa3bff; margin-bottom: 16px;">💼 Follow-up Reminder</div>
            <p style="font-size: 16px; color: #08060d; margin-top: 0;">Hi <strong>${userName}</strong>,</p>
            <p style="font-size: 15px; line-height: 1.5;">This is a reminder that it has been <span style="color: #aa3bff; font-weight: bold;">${daysElapsed} days</span> since you last reached out to <strong>${recipientLabel}</strong> at <strong>${companyName}</strong> for the <strong>${role}</strong> role.</p>
            <p style="font-size: 15px; line-height: 1.5;">Staying in touch helps keep you top-of-mind during the selection process. Consider sending a quick follow-up draft using your pre-built templates in the app!</p>
            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px dashed #e5e4e7; font-size: 12px; color: #9ca3af;">
                Sent automatically by your Job Tracker Career Operating System.
            </div>
        </div>
    `;

    await transporter.sendMail({
        from: `"Job Tracker" <${process.env.SMTP_USER || "ecomreply@gmail.com"}>`,
        to: userEmail,
        subject,
        text,
        html,
    });
};
