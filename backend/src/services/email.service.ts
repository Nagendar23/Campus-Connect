import nodemailer from "nodemailer";

// Create a transporter
// Ideally, use environment variables for SMTP configuration
let transporter: nodemailer.Transporter;

const initTransporter = async () => {
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log("Email service: Using configured SMTP server");
    } else {
        // Fallback to Ethereal for development
        try {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log("Email service: Using Ethereal (dev mode)");
            console.log(`Ethereal Creds: ${testAccount.user} / ${testAccount.pass}`);
        } catch (err) {
            console.error("Failed to create Ethereal account:", err);
        }
    }
};

// Initialize on start
initTransporter();

export const emailService = {
    async sendEmail(to: string, subject: string, html: string) {
        if (!transporter) {
            await initTransporter();
        }

        try {
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM || '"Campus Connect" <noreply@campusconnect.com>',
                to,
                subject,
                html,
            });

            console.log(`Email sent: ${info.messageId}`);
            // Preview only available when sending through an Ethereal account
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                console.log(`Preview URL: ${previewUrl}`);
            }
            return info;
        } catch (error) {
            console.error("Error sending email:", error);
            // Don't throw, just log. We don't want to break the registration flow if email fails.
            return null;
        }
    },

    async sendRegistrationEmail(to: string, userName: string, eventName: string, eventDate: Date, ticketId: string) {
        const formattedDate = new Date(eventDate).toLocaleString();
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Registration Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>You have successfully registered for <strong>${eventName}</strong>.</p>
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Date:</strong> ${formattedDate}</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
        </div>
        <p>Please present your ticket ID or QR code at the venue for check-in.</p>
        <br>
        <p>Best regards,<br>The Campus Connect Team</p>
      </div>
    `;
        return this.sendEmail(to, `Registration Confirmed: ${eventName}`, html);
    },

    async sendPaymentSuccessEmail(to: string, userName: string, amount: number, eventName: string, ticketId: string) {
        // Assuming amount is in cents if from Stripe, or ensure unit consistency.
        // Here assuming 'amount' is raw number (e.g. 100 for $100) based on existing Payment model
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Payment Successful</h2>
        <p>Hi ${userName},</p>
        <p>We have received your payment of <strong>$${amount}</strong> for <strong>${eventName}</strong>.</p>
        <div style="background-color: #ECFDF5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Event:</strong> ${eventName}</p>
          <p><strong>Amount Paid:</strong> $${amount}</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
        </div>
        <p>Pass this ticket at the entry.</p>
        <br>
        <p>Best regards,<br>The Campus Connect Team</p>
      </div>
    `;
        return this.sendEmail(to, `Payment Receipt: ${eventName}`, html);
    },

    async sendVolunteerAssignmentEmail(to: string, volunteerName: string, eventName: string, roleTitle?: string) {
                const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563EB;">You're Assigned to a Task</h2>
                <p>Hi ${volunteerName},</p>
                <p>You have been assigned${roleTitle ? ` as ${roleTitle}` : ""} for <strong>${eventName}</strong>.</p>
                <p>Please check your dashboard for details and next steps.</p>
                <br>
                <p>Best regards,<br>The Campus Connect Team</p>
            </div>
        `;
                return this.sendEmail(to, `Volunteer Assignment: ${eventName}`, html);
        },

        async sendSponsorIntroEmail(to: string, companyName: string, eventName: string, packageTitle?: string) {
                const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #374151;">New Sponsorship Opportunity</h2>
                <p>Hi ${companyName},</p>
                <p>There's a sponsorship opportunity for <strong>${eventName}</strong>${packageTitle ? ` (Package: ${packageTitle})` : ""}.</p>
                <p>Visit your sponsor dashboard to review details and next steps.</p>
                <br>
                <p>Best regards,<br>The Campus Connect Team</p>
            </div>
        `;
                return this.sendEmail(to, `Sponsorship Opportunity: ${eventName}`, html);
        },

        async sendCertificateEmail(to: string, recipientName: string, eventName: string, certificateUrl: string) {
                const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8B5CF6;">Certificate of Participation</h2>
                <p>Hi ${recipientName},</p>
                <p>Thank you for participating in <strong>${eventName}</strong>. Download your certificate here:</p>
                <p><a href="${certificateUrl}" target="_blank" rel="noopener">Download Certificate</a></p>
                <br>
                <p>Best regards,<br>The Campus Connect Team</p>
            </div>
        `;
                return this.sendEmail(to, `Your Certificate: ${eventName}`, html);
        }
};
