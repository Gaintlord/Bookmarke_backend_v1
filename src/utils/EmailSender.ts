import * as nodemailer from "nodemailer";

const requiredSmtpVars = [
  "SMTP_HOST",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
] as const;

const createTransporter = (): nodemailer.Transporter => {
  const missing = requiredSmtpVars.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(`Missing SMTP config: ${missing.join(", ")}`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const buildVerifyLink = (otp: string, email: string): string => {
  const apiBaseUrl = (process.env.API_BASE_URL || "").replace(/\/+$/, "");

  return `${apiBaseUrl}/api/v1/verify-email?userEmail=${encodeURIComponent(
    email,
  )}&otp=${encodeURIComponent(otp)}`;
};

export const emailSender = async (otp: string, email: string) => {
  console.log({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
    hasPassword: !!process.env.SMTP_PASS,
  });
  try {
    const transporter = createTransporter();
    const verifyLink = buildVerifyLink(otp, email);
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "OTP verification for BokMarke",
      text: `your One Time Password Is ${otp}\n\n\n\n
      ${verifyLink}`,
      html: emailHTML(otp, email, verifyLink),
    });
    console.log("mail delivered");
  } catch (err) {
    console.log("following error had occured", err);
  }
};

const emailHTML = (otp: string, email: string, verifyLink: string): string => {
  const htmlVerifyLink = verifyLink.replace(/&/g, "&amp;");
  return `<div style="font-family: Arial, sans-serif; line-height: 1.5; width: 100%; text-align: center; padding: 15px 0;">
  <h2 style="margin-bottom: 50px; font-size: 32px; color: #333;">
    Your Bokmarke Verification Code 
  </h2>
  
  
  <div style="
    display: inline-block;
    background: #caf0f8;
    padding: 8px 20px;
    border-radius: 16px;
    font-size: 55px;
    font-weight: bold;
    color: #1b263b;
    box-shadow: 0px 4px 12px rgba(0,0,0,0.15);
    letter-spacing: 12px;
  ">
    ${otp}
  </div>

  
  <div style="margin-top: 90px; font-size: 22px; color: #444;font-style:italic">
    Or click on this link to verify
  </div>

  
  <div style="margin-top: 20px;">
    <a href="${htmlVerifyLink}"
      
      style="display:inline-block; padding:12px 20px; background:#00b4d8; color:#fff;
              text-decoration:none; font-size:22px; border-radius:6px;box-shadow: 0px 4px 12px rgba(0,0,0,0.2);">
      Verify My Account
    </a>
  </div>
   <div style ="margin-top:48px; font-size:11px">
  Crafted by Gaintlord
  </div>
</div>`;
};
