const BRAND_BLUE = "#2400FF";
const LOGO_URL = "https://res.cloudinary.com/dj86nz4oc/image/upload/v1783771654/Screenshot_2026-07-11_173717_xzc7lv.png"; // e.g. https://res.cloudinary.com/.../speedopus-logo.png

const wrapEmail = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>SpeedOpus</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f1f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f1f4; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

          <!-- Logo header -->
          <tr>
            <td style="padding: 36px 40px 24px; text-align: center;">
              <img src="${LOGO_URL}" alt="SpeedOpus" width="44" height="44" style="display: inline-block; border-radius: 10px;" />
            </td>
          </tr>

          <!-- Accent divider -->
          <tr>
            <td style="padding: 0 40px;">
              <div style="height: 3px; width: 40px; background-color: ${BRAND_BLUE}; border-radius: 2px; margin: 0 auto 32px;"></div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 0 40px 8px;">
              <h1 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #18181b; text-align: center;">
                ${title}
              </h1>
              ${bodyHtml}
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 40px;"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; border-top: 1px solid #ececef;">
              <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #3f3f46;">
                SpeedOpus
              </p>
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; line-height: 1.6;">
                This is an automated notification from the SpeedOpus Global.<br/>
                Please do not reply directly to this email — for support, contact your administrator.
              </p>
              <p style="margin: 16px 0 0; font-size: 11px; color: #d4d4d8;">
                &copy; ${new Date().getFullYear()} SpeedOpus. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

module.exports = { wrapEmail, BRAND_BLUE };