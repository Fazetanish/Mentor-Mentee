require("dotenv").config();
const nodemailer = require("nodemailer");

// Reusable Gmail transporter (uses the same EMAIL_USER & EMAIL_PASS from .env)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify connection on first load
transporter.verify((error) => {
    if (error) {
        console.error("📧 Email transporter verification failed:", error.message);
    } else {
        console.log("📧 Email transporter ready (emailService)");
    }
});

/**
 * Generate a styled HTML email for project status updates.
 *
 * @param {"approved"|"rejected"|"changes_requested"} status
 * @param {Object} data
 * @param {string} data.studentName
 * @param {string} data.mentorName
 * @param {string} data.projectTitle
 * @param {string} [data.mentorFeedback]
 * @returns {string} HTML string
 */
function buildStatusEmailHTML(status, { studentName, mentorName, projectTitle, mentorFeedback }) {
    // Theme colours per status
    const themes = {
        approved: {
            color: "#16a34a",
            bg: "#f0fdf4",
            icon: "🎉",
            heading: "Project Request Approved!",
            message: `Great news, <strong>${studentName}</strong>! Your mentor <strong>${mentorName}</strong> has <span style="color:#16a34a;font-weight:700;">approved</span> your project request. You can now start working on your project.`,
        },
        rejected: {
            color: "#dc2626",
            bg: "#fef2f2",
            icon: "❌",
            heading: "Project Request Declined",
            message: `Hi <strong>${studentName}</strong>, unfortunately your mentor <strong>${mentorName}</strong> has <span style="color:#dc2626;font-weight:700;">declined</span> your project request. Please review the feedback below and consider submitting a revised proposal.`,
        },
        changes_requested: {
            color: "#ea580c",
            bg: "#fff7ed",
            icon: "📝",
            heading: "Changes Requested on Your Project",
            message: `Hi <strong>${studentName}</strong>, your mentor <strong>${mentorName}</strong> has <span style="color:#ea580c;font-weight:700;">requested changes</span> to your project proposal. Please review the feedback and update your submission accordingly.`,
        },
    };

    const theme = themes[status] || themes.changes_requested;

    const feedbackBlock = mentorFeedback
        ? `
        <tr>
            <td style="padding:20px 30px 10px;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">Mentor Feedback:</p>
                <div style="background:#f9fafb;border-left:4px solid ${theme.color};padding:14px 18px;border-radius:4px;font-size:14px;color:#4b5563;line-height:1.6;">
                    ${mentorFeedback}
                </div>
            </td>
        </tr>`
        : "";

    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <!-- Header -->
                    <tr>
                        <td style="background:${theme.color};padding:28px 30px;text-align:center;">
                            <p style="margin:0;font-size:36px;">${theme.icon}</p>
                            <h1 style="margin:10px 0 0;font-size:22px;color:#ffffff;font-weight:700;">${theme.heading}</h1>
                        </td>
                    </tr>

                    <!-- Project title pill -->
                    <tr>
                        <td style="padding:24px 30px 0;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background:${theme.bg};border-radius:8px;padding:16px 20px;">
                                        <p style="margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;font-weight:600;">Project</p>
                                        <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${projectTitle}</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body message -->
                    <tr>
                        <td style="padding:20px 30px 0;">
                            <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">
                                ${theme.message}
                            </p>
                        </td>
                    </tr>

                    <!-- Feedback (conditional) -->
                    ${feedbackBlock}

                    <!-- CTA -->
                    <tr>
                        <td style="padding:28px 30px;" align="center">
                            <p style="margin:0;font-size:14px;color:#6b7280;">
                                Log in to the <strong>Mentor-Mentee Platform</strong> to view full details and take action.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background:#f9fafb;padding:20px 30px;border-top:1px solid #e5e7eb;text-align:center;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;">
                                This is an automated email from the Mentor-Mentee Platform. Please do not reply.
                            </p>
                            <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">
                                &copy; ${new Date().getFullYear()} Mentor-Mentee Platform &mdash; Manipal University Jaipur
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

/**
 * Send a project-status-update email to the student.
 *
 * @param {Object} opts
 * @param {string} opts.toEmail        - Student email address
 * @param {"approved"|"rejected"|"changes_requested"} opts.status
 * @param {string} opts.studentName
 * @param {string} opts.mentorName
 * @param {string} opts.projectTitle
 * @param {string} [opts.mentorFeedback]
 * @returns {Promise<void>}
 */
async function sendProjectStatusEmail({ toEmail, status, studentName, mentorName, projectTitle, mentorFeedback }) {
    // Human-readable subject lines
    const subjects = {
        approved: `✅ Project Approved — "${projectTitle}"`,
        rejected: `❌ Project Declined — "${projectTitle}"`,
        changes_requested: `📝 Changes Requested — "${projectTitle}"`,
    };

    const html = buildStatusEmailHTML(status, { studentName, mentorName, projectTitle, mentorFeedback });

    const mailOptions = {
        from: `"Mentor-Mentee Platform" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: subjects[status] || `Project Update — "${projectTitle}"`,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Status email sent to ${toEmail} (messageId: ${info.messageId})`);
    } catch (error) {
        // Log but do NOT throw — the API response should still succeed even if
        // the email fails (the in-app notification is the primary channel).
        console.error(`📧 Failed to send status email to ${toEmail}:`, error.message);
    }
}

module.exports = ({
    sendProjectStatusEmail : sendProjectStatusEmail
});