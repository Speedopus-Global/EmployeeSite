const { Resend } = require("resend");
const { wrapEmail, BRAND_BLUE } = require("./emailTemplate");

// --------------------------------------------------
// Resend configuration
// --------------------------------------------------

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not configured");
}

if (!process.env.RESEND_FROM_EMAIL) {
  throw new Error("RESEND_FROM_EMAIL is not configured");
}

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL;


// --------------------------------------------------
// Helper: Send email
// --------------------------------------------------

const sendEmail = async ({ to, subject, html }) => {
  try {
    const result = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    console.log(`Email sent successfully: ${subject}`);

    return result.data;
  } catch (err) {
    console.error(`Failed to send email "${subject}":`, err);
    throw err;
  }
};


// --------------------------------------------------
// Admin: New employee registration
// --------------------------------------------------

const sendAdminNewEmployeeAlert = async (employee) => {
  const body = `
    <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
      A new employee has registered on <strong>SpeedOpus Global</strong>
      and is awaiting your approval.
    </p>

    <table role="presentation" width="100%"
           style="margin: 20px 0; border-collapse: collapse;">

      <tr>
        <td style="padding: 8px 0; font-size: 13px;
                   color: #71717a; width: 100px;">
          Name
        </td>

        <td style="padding: 8px 0; font-size: 13px;
                   color: ${BRAND_BLUE}; font-weight: 500;">
          ${employee.name}
        </td>
      </tr>

      <tr>
        <td style="padding: 8px 0; font-size: 13px;
                   color: #71717a;">
          Email
        </td>

        <td style="padding: 8px 0; font-size: 13px;
                   color: ${BRAND_BLUE}; font-weight: 500;">
          ${employee.email}
        </td>
      </tr>

    </table>

    <a href="${process.env.CLIENT_URL}/admin"
       style="display: inline-block;
              background-color: ${BRAND_BLUE};
              color: #ffffff;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;">
      Review in Admin Dashboard
    </a>
  `;

  return sendEmail({
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: "New Employee Registration Pending Approval",
    html: wrapEmail("New Registration Pending", body),
  });
};


// --------------------------------------------------
// Employee: OTP verification email
// --------------------------------------------------

const sendOtpEmail = async (employee, otp) => {
  const verifyLink =
    `${process.env.CLIENT_URL}/verify-email` +
    `?email=${encodeURIComponent(employee.email)}` +
    `&otp=${otp}`;

  const body = `
    <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
      Hi ${employee.name},
    </p>

    <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
      Your registration on SpeedOpus has been approved.
      Please verify your email address to activate your account.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <div style="display: inline-block;
                  background-color: #fafafa;
                  border: 1px solid #e4e4e7;
                  border-radius: 8px;
                  padding: 16px 32px;">

        <span style="font-size: 13px;
                     color: #71717a;
                     display: block;
                     margin-bottom: 4px;">
          Your verification code
        </span>

        <span style="font-size: 28px;
                     font-weight: 700;
                     color: ${BRAND_BLUE};
                     letter-spacing: 6px;">
          ${otp}
        </span>

      </div>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${verifyLink}"
         style="display: inline-block;
                background-color: ${BRAND_BLUE};
                color: #ffffff;
                text-decoration: none;
                padding: 12px 28px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;">
        Verify Email & Continue
      </a>
    </div>

    <p style="font-size: 13px;
              color: #a1a1aa;
              line-height: 1.6;
              text-align: center;">
      This code expires in 10 minutes.
      If the button doesn't work, enter the code manually
      at the verification page.
    </p>
  `;

  return sendEmail({
    to: employee.email,
    subject: "Verify your SpeedOpus account",
    html: wrapEmail("Verify Your Email", body),
  });
};


// --------------------------------------------------
// Admin: New drawing uploaded
// --------------------------------------------------

const sendAdminNewDrawingAlert = async (drawing, employee) => {
  const body = `
    <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
      <strong>${employee.name}</strong> uploaded a new drawing
      that requires your review.
    </p>

    <table role="presentation" width="100%"
           style="margin: 20px 0; border-collapse: collapse;">

      <tr>
        <td style="padding: 8px 0; font-size: 13px;
                   color: #71717a; width: 120px;">
          Project
        </td>

        <td style="padding: 8px 0; font-size: 13px;
                   color: ${BRAND_BLUE}; font-weight: 500;">
          ${drawing.projectName}
        </td>
      </tr>

      <tr>
        <td style="padding: 8px 0; font-size: 13px;
                   color: #71717a;">
          Drawing No.
        </td>

        <td style="padding: 8px 0; font-size: 13px;
                   color: ${BRAND_BLUE}; font-weight: 500;">
          ${drawing.drawingNumber}
        </td>
      </tr>

    </table>

    <a href="${process.env.CLIENT_URL}/admin"
       style="display: inline-block;
              background-color: ${BRAND_BLUE};
              color: #ffffff;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 500;">
      Review Drawing
    </a>
  `;

  return sendEmail({
    to: process.env.ADMIN_NOTIFY_EMAIL,
    subject: "New Drawing Uploaded — Review Pending",
    html: wrapEmail("New Drawing Uploaded", body),
  });
};


// --------------------------------------------------
// Employee: Password reset email
// --------------------------------------------------

const sendPasswordResetEmail = async (user, resetLink) => {
  const body = `
    <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
      Hi ${user.name},
    </p>

    <p style="font-size: 14px; color: #3f3f46; line-height: 1.6;">
      We received a request to reset your SpeedOpus account password.
      Click the button below to choose a new password.
    </p>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetLink}"
         style="display: inline-block;
                background-color: ${BRAND_BLUE};
                color: #ffffff;
                text-decoration: none;
                padding: 12px 28px;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;">
        Reset Password
      </a>
    </div>

    <p style="font-size: 13px;
              color: #a1a1aa;
              line-height: 1.6;
              text-align: center;">
      This link expires in 30 minutes.
      If you didn't request this, you can safely ignore this email —
      your password will remain unchanged.
    </p>
  `;

  return sendEmail({
    to: user.email,
    subject: "Reset your SpeedOpus password",
    html: wrapEmail("Reset Your Password", body),
  });
};


// --------------------------------------------------
// Exports
// --------------------------------------------------

module.exports = {
  sendAdminNewEmployeeAlert,
  sendOtpEmail,
  sendAdminNewDrawingAlert,
  sendPasswordResetEmail,
};