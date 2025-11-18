import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// Email templates
const emailTemplates: Record<string, (data: Record<string, any>) => string> = {
  "student-credentials": (data) => `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
          <h2 style="color: #2c3e50;">Welcome to Hostel Management System</h2>
          
          <p>Hello <strong>${data.studentName}</strong>,</p>
          
          <p>Your hostel account has been created successfully. Here are your login credentials:</p>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Temporary Password:</strong> <code style="background-color: #e9ecef; padding: 5px 10px; border-radius: 3px;">${data.tempPassword}</code></p>
          </div>

          ${data.roomDetails ? `
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <h3 style="color: #2c3e50; margin-top: 0;">Your Room Allocation</h3>
            <p><strong>Building:</strong> ${data.roomDetails.buildingName}</p>
            <p><strong>Floor:</strong> ${data.roomDetails.floorName}</p>
            <p><strong>Room Number:</strong> ${data.roomDetails.roomNumber}</p>
            <p><strong>Room Type:</strong> ${data.roomDetails.roomType || 'N/A'}</p>
            <p><strong>Capacity:</strong> ${data.roomDetails.capacity || 'N/A'}</p>
          </div>
          ` : ''}
          
          <p>
            <a href="${data.loginUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to Your Account</a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong> Please change your password after your first login.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't expect this email, please contact your hostel administrator.
          </p>
        </div>
      </body>
    </html>
  `,
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Get template
    const htmlTemplate = emailTemplates[options.template];
    if (!htmlTemplate) {
      throw new Error(`Email template "${options.template}" not found`);
    }

    // Generate HTML
    const html = htmlTemplate(options.data);

    // Send email
    await transporter.sendMail({
      from: `"Hostel Management" <${process.env.GMAIL_EMAIL}>`,
      to: options.to,
      subject: options.subject,
      html,
    });

    console.log(`Email sent to ${options.to}`);
  } catch (error: any) {
    console.error("Error sending email:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Optional: Test email function
export const testEmail = async (testEmail: string): Promise<void> => {
  await sendEmail({
    to: testEmail,
    subject: "Test Email",
    template: "student-credentials",
    data: {
      studentName: "Test Student",
      email: testEmail,
      tempPassword: "TempPass123!",
      loginUrl: process.env.FRONTEND_URL,
    },
  });
};