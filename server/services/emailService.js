import nodemailer from 'nodemailer';
import 'dotenv/config';

const WHATSAPP_LINK = process.env.WHATSAPP_GROUP_URL || 'https://chat.whatsapp.com/Iox0gxqKgnSGgMTkYZZXwj';
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || `"GAMBIT'S GLITCH 2026" <${process.env.ADMIN_EMAIL || 'admin@gambitsglitch.tech'}>`;

// Initialize Nodemailer Transporter if SMTP credentials exist
let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    console.log(`✉️ Email Service initialized with SMTP (${SMTP_HOST})`);
  } catch (err) {
    console.warn(`⚠️ Email Service transport initialization error:`, err.message);
  }
} else {
  console.log(`ℹ️ Email Service running in Preview Mode (Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to send live emails).`);
}

/**
 * Send Registration Confirmation Email to Team Leader
 */
export async function sendRegistrationConfirmation(team, members = []) {
  const memberListHtml = members.map(m => `<li><strong>${m.name}</strong> (${m.role || 'Member'}) - ${m.email}</li>`).join('');

  const subject = `[GAMBIT'S GLITCH 2026] Registration Confirmation - Team ${team.team_name} (${team.reg_id})`;

  const html = `
    <div style="background-color: #050505; color: #f4f4f5; font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #C7FF18; border-radius: 8px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333;">
        <h1 style="color: #C7FF18; font-size: 24px; letter-spacing: 2px; margin: 0;">GAMBIT'S GLITCH 2026</h1>
        <p style="color: #a1a1aa; font-size: 14px; margin-top: 5px;">AUTOMATED REGISTRATION INTEL</p>
      </div>

      <div style="padding: 20px 0;">
        <h2 style="color: #ffffff; font-size: 18px;">Registration Successful! 🎉</h2>
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
          Greetings <strong>${team.leader_name}</strong>, your team registration for <strong>GAMBIT'S GLITCH 2026</strong> has been received and indexed.
        </p>

        <div style="background-color: #121212; border-left: 4px solid #C7FF18; padding: 15px; margin: 20px 0;">
          <div style="font-size: 12px; color: #a1a1aa; font-family: monospace;">REGISTRATION ID:</div>
          <div style="font-size: 22px; color: #C7FF18; font-family: monospace; font-weight: bold; letter-spacing: 1px;">${team.reg_id}</div>
          <div style="margin-top: 8px; font-size: 13px;"><strong>Team Name:</strong> ${team.team_name}</div>
          <div style="font-size: 13px;"><strong>Institution:</strong> ${team.college}</div>
        </div>

        <h3 style="color: #ffffff; font-size: 15px;">Team Roster:</h3>
        <ul style="color: #d4d4d8; font-size: 13px; line-height: 1.8;">
          ${memberListHtml}
        </ul>

        <div style="margin-top: 25px; text-align: center;">
          <a href="http://localhost:3000/#payment" style="background-color: #C7FF18; color: #050505; text-decoration: none; font-weight: bold; padding: 12px 24px; font-size: 14px; border-radius: 4px; display: inline-block;">
            SUBMIT PAYMENT PROOF (₹499) →
          </a>
        </div>
      </div>

      <div style="border-top: 1px solid #333; padding-top: 15px; text-align: center; font-size: 12px; color: #71717a;">
        <p>Keep your Registration ID (<strong>${team.reg_id}</strong>) safe for status tracking.</p>
        <p>© 2026 GAMBIT'S GLITCH Engine. All rights reserved.</p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: team.leader_email,
        subject,
        html
      });
      console.log(`✉️ Live Confirmation Email sent to ${team.leader_email}`);
    } catch (err) {
      console.error(`❌ Failed to send registration email to ${team.leader_email}:`, err.message);
    }
  } else {
    console.log(`\n=================== [EMAIL PREVIEW: REGISTRATION] ===================`);
    console.log(`TO: ${team.leader_email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`REGISTRATION ID: ${team.reg_id} | TEAM: ${team.team_name}`);
    console.log(`=======================================================================\n`);
  }
}

/**
 * Send Shortlisted Team Email with WhatsApp Group Link
 */
export async function sendShortlistedEmail(team) {
  const subject = `[GAMBIT'S GLITCH 2026] Congratulations! Team ${team.team_name} is SHORTLISTED 🎉`;

  const html = `
    <div style="background-color: #050505; color: #f4f4f5; font-family: Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; border: 1px solid #C7FF18; border-radius: 8px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333;">
        <h1 style="color: #C7FF18; font-size: 24px; letter-spacing: 2px; margin: 0;">GAMBIT'S GLITCH 2026</h1>
        <p style="color: #25D366; font-size: 14px; margin-top: 5px; font-weight: bold;">OFFICIAL SHORTLIST ANNOUNCEMENT</p>
      </div>

      <div style="padding: 20px 0;">
        <h2 style="color: #ffffff; font-size: 20px;">CONGRATULATIONS TEAM ${team.team_name.toUpperCase()}! 🚀</h2>
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
          Dear <strong>${team.leader_name}</strong> and Team Members,
        </p>
        <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
          We are thrilled to inform you that your team (Registration ID: <strong style="color: #C7FF18;">${team.reg_id}</strong>) has been officialy <strong>SHORTLISTED</strong> for the finals of <strong>GAMBIT'S GLITCH 2026</strong>!
        </p>

        <!-- WhatsApp Group Callout Box -->
        <div style="background-color: #0d2818; border: 2px solid #25D366; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
          <h3 style="color: #25D366; margin-top: 0; font-size: 18px;">📱 JOIN OFFICIAL SHORTLISTED WHATSAPP GROUP</h3>
          <p style="color: #e4e4e7; font-size: 13px; margin-bottom: 18px;">
            It is mandatory for all shortlisted team leaders to join the official WhatsApp communications channel for live schedule updates, mentorship coordination, and venue guidelines.
          </p>
          <a href="${WHATSAPP_LINK}" target="_blank" style="background-color: #25D366; color: #000000; text-decoration: none; font-weight: bold; padding: 14px 28px; font-size: 15px; border-radius: 6px; display: inline-block;">
            👉 JOIN WHATSAPP GROUP NOW
          </a>
          <div style="margin-top: 12px; font-size: 11px; color: #a1a1aa; word-break: break-all;">
            Direct Link: <a href="${WHATSAPP_LINK}" style="color: #25D366;">${WHATSAPP_LINK}</a>
          </div>
        </div>

        <h3 style="color: #ffffff; font-size: 15px;">Next Immediate Steps:</h3>
        <ol style="color: #d4d4d8; font-size: 13px; line-height: 1.8;">
          <li>Join the official WhatsApp group above immediately.</li>
          <li>Ensure your presentation deck is uploaded on the <a href="http://localhost:3000/#submit-ppt" style="color: #C7FF18;">Submit PPT Page</a>.</li>
          <li>Review hackathon rules & timeline on the portal.</li>
        </ol>
      </div>

      <div style="border-top: 1px solid #333; padding-top: 15px; text-align: center; font-size: 12px; color: #71717a;">
        <p>Questions? Reach out via the official WhatsApp group or reply to this email.</p>
        <p>© 2026 GAMBIT'S GLITCH Organising Committee.</p>
      </div>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: EMAIL_FROM,
        to: team.leader_email,
        subject,
        html
      });
      console.log(`✉️ Live Shortlist Email sent to ${team.leader_email} with WhatsApp link!`);
    } catch (err) {
      console.error(`❌ Failed to send shortlist email to ${team.leader_email}:`, err.message);
    }
  } else {
    console.log(`\n=================== [EMAIL PREVIEW: SHORTLISTED] ===================`);
    console.log(`TO: ${team.leader_email}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`REGISTRATION ID: ${team.reg_id} | TEAM: ${team.team_name}`);
    console.log(`WHATSAPP LINK: ${WHATSAPP_LINK}`);
    console.log(`=======================================================================\n`);
  }
}
