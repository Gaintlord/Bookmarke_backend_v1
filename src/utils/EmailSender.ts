import * as nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: "monserrat22@ethereal.email",
    pass: "xnQbdQ95Kp2sQ3EUg1",
  },
});

export const emailSender = async (otp: string, email: string) => {
  try {
    const mailDetail = await transporter.sendMail({
      from: "monserrat22@ethereal.email",
      to: email,
      subject: "OTP verification for BokMarke",
      text: `your One Time Password Is ${otp}\n\n\n\n
      http://localhost:8081/api/v1/email-verify?userEmail=${email}&otp=${otp}`,
      html: emailHTML(otp, email),
    });
    console.log("mail delivered");
  } catch (err) {
    console.log("following error had occured", err);
  }
};

const emailHTML = (otp: string, email: string): string => {
  return `<div style="font-family: Arial, sans-serif; line-height: 1.5; width: 100%; text-align: center; padding: 15px 0;">
  <h2 style="margin-bottom: 50px; font-size: 32px; color: #333;">
    Your Freezebee Verification Code :
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
    <a href="http://localhost:8081/api/v1/email-verify?userEmail=${email}&otp=${otp}"
      
      style="display:inline-block; padding:12px 20px; background:#00b4d8; color:#fff;
              text-decoration:none; font-size:22px; border-radius:6px;box-shadow: 0px 4px 12px rgba(0,0,0,0.2);">
      Verify My Account
    </a>
  </div>
</div>`;
};

