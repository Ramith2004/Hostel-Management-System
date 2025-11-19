import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create transporter with optimized settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 5000,
  socketTimeout: 5000,
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
  rateDelta: 2000,
  rateLimit: 5,
});

// Lightweight email template
const studentCredentialsTemplate = (data: Record<string, any>): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 500px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2c3e50; margin: 0 0 16px 0; font-size: 20px;">Welcome to Hostel Management</h2>
    
    <p style="margin: 0 0 12px 0;">Hi <strong>${escapeHtml(data.studentName)}</strong>,</p>
    
    <p style="margin: 0 0 16px 0;">Your account has been created. Login credentials:</p>
    
    <div style="background: #f5f5f5; padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 13px;">
      <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${escapeHtml(data.email)}</p>
      <p style="margin: 0;"><strong>Password:</strong> <code style="background: #e8e8e8; padding: 2px 6px; border-radius: 3px;">${escapeHtml(data.tempPassword)}</code></p>
    </div>

    ${data.roomDetails ? `
    <div style="background: #f0f7ff; padding: 12px; border-radius: 4px; margin: 16px 0; font-size: 13px; border-left: 3px solid #007bff;">
      <p style="margin: 0 0 8px 0; font-weight: 600;">Room Assignment</p>
      <p style="margin: 4px 0;"><strong>Building:</strong> ${escapeHtml(data.roomDetails.buildingName)}</p>
      <p style="margin: 4px 0;"><strong>Floor:</strong> ${escapeHtml(data.roomDetails.floorName || 'N/A')}</p>
      <p style="margin: 4px 0;"><strong>Room:</strong> ${escapeHtml(data.roomDetails.roomNumber)}</p>
    </div>
    ` : ''}
    
    <p style="margin: 16px 0;">
      <a href="${process.env.FRONTEND_URL || 'https://hostel-x.vercel.app'}" style="display: inline-block; background: #007bff; color: white; padding: 8px 16px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500;">Login Now</a>
    </p>
    
    <p style="margin: 16px 0 0 0; font-size: 12px; color: #666;">Change your password after first login.</p>
  </div>
</body>
</html>
`;

// Helper function to escape HTML
const escapeHtml = (text: string): string => {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m] ?? m);
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    let html: string;

    // Simple template routing
    if (options.template === 'student-credentials') {
      html = studentCredentialsTemplate(options.data);
    } else {
      throw new Error(`Template "${options.template}" not found`);
    }

    // Send with minimal options
    await transporter.sendMail({
      from: process.env.GMAIL_EMAIL,
      to: options.to,
      subject: options.subject,
      html,
      headers: {
        'X-Priority': '3',
        'Importance': 'normal',
      },
    });

    console.log(`✓ Email sent to ${options.to}`);
  } catch (error: any) {
    console.error(`✗ Email error: ${error.message}`);
    throw new Error(`Email failed: ${error.message}`);
  }
};