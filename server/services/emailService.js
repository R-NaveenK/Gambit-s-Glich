import nodemailer from 'nodemailer';
import 'dotenv/config';

const APP_BASE_URL = process.env.APP_BASE_URL || 'https://gambit-s-glich.onrender.com';
const WHATSAPP_LINK = process.env.WHATSAPP_GROUP_URL || 'https://chat.whatsapp.com/Iox0gxqKgnSGgMTkYZZXwj';
const SMTP_HOST = process.env.SMTP_HOST;
let SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
// Force Port 465 (SSL) for Brevo to prevent cloud firewall blocks on Port 587 (Render.com)
if (SMTP_HOST && SMTP_HOST.includes('brevo.com')) {
  SMTP_PORT = 465;
}
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || `"GAMBIT'S GLITCH 2026" <${process.env.ADMIN_EMAIL || 'gambitsglitch@gmail.com'}>`;
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || `"GAMBIT'S GLITCH 2026" <${process.env.ADMIN_EMAIL || 'gambitsglitch@gmail.com'}>`;

// Check for Brevo REST API Key or SMTP credentials
const BREVO_API_KEY = process.env.BREVO_API_KEY || (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('xkeysib-') ? process.env.SMTP_PASS : null);

let transporter = null;
let isTransporterVerified = false;

if (BREVO_API_KEY) {
  console.log(`✉️ Email Service initialized & ready with Brevo REST API v3 (HTTPS Port 443).`);
} else if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  const isSecure = SMTP_PORT === 465;
  try {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: isSecure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      connectionTimeout: 8000,
      greetingTimeout: 5000,
      socketTimeout: 8000,
      tls: {
        rejectUnauthorized: false
      }
    });

    transporter.verify((error) => {
      if (error) {
        isTransporterVerified = false;
        console.warn(`⚠️ SMTP Connection Note (${SMTP_HOST}:${SMTP_PORT}):`, error.message);
      } else {
        isTransporterVerified = true;
        console.log(`✉️ Email Service initialized & verified with SMTP (${SMTP_HOST}:${SMTP_PORT} ${isSecure ? 'SSL' : 'STARTTLS'})`);
      }
    });
  } catch (err) {
    isTransporterVerified = false;
    console.warn(`⚠️ Email Service transport initialization error:`, err.message);
  }
} else {
  console.log(`ℹ️ Email Service running in Preview Mode (Set BREVO_API_KEY in .env to send live emails).`);
}

/**
 * Helper to extract unique valid email addresses for team leader & squad members
 */
function getEmailRecipients(team, members = []) {
  const list = [];
  if (team && team.leader_email) {
    list.push(team.leader_email.trim());
  }
  if (Array.isArray(members)) {
    members.forEach(m => {
      if (m && m.email && typeof m.email === 'string' && m.email.trim()) {
        list.push(m.email.trim());
      }
    });
  }
  const unique = [...new Set(list.filter(e => e.includes('@')))];
  return unique.length > 0 ? unique : [team ? team.leader_email : ''];
}

/**
 * Unified Email Dispatcher (Brevo REST API v3 -> Nodemailer SMTP -> Preview Fallback)
 */
async function sendMailMessage({ recipients, subject, html }) {
  const recipientArray = Array.isArray(recipients) ? recipients : [recipients];
  const validRecipients = [...new Set(recipientArray.filter(e => typeof e === 'string' && e.includes('@')))];

  if (validRecipients.length === 0) {
    return { success: false, error: 'No valid recipient email address provided.' };
  }

  // 1. Try Brevo HTTP API v3 if BREVO_API_KEY or an xkeysib- key is configured
  const apiKey = process.env.BREVO_API_KEY || (process.env.SMTP_PASS && process.env.SMTP_PASS.startsWith('xkeysib-') ? process.env.SMTP_PASS : null);

  if (apiKey) {
    try {
      const senderEmail = (process.env.ADMIN_EMAIL || 'gambitsglitch@gmail.com').trim();
      const replyToEmail = (process.env.ADMIN_EMAIL || 'gambitsglitch@gmail.com').trim();

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          sender: { name: "GAMBIT'S GLITCH 2026", email: senderEmail },
          replyTo: { name: "GAMBIT'S GLITCH 2026", email: replyToEmail },
          to: validRecipients.map(e => ({ email: e })),
          subject,
          htmlContent: html
        })
      });

      const resData = await response.json();
      if (response.ok && resData.messageId) {
        console.log(`✉️ Email dispatched via Brevo REST API v3 to ${validRecipients.join(', ')} (ID: ${resData.messageId})`);
        return { success: true, recipients: validRecipients, messageId: resData.messageId };
      } else {
        console.warn(`⚠️ Brevo API v3 response error (${response.status}):`, resData.message || JSON.stringify(resData));
      }
    } catch (err) {
      console.warn(`⚠️ Brevo API v3 fetch failed:`, err.message);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: EMAIL_FROM,
        replyTo: EMAIL_REPLY_TO,
        to: validRecipients,
        subject,
        html
      });
      console.log(`✉️ Email dispatched via Nodemailer SMTP to ${validRecipients.join(', ')}`);
      return { success: true, recipients: validRecipients, info };
    } catch (err) {
      console.error(`❌ SMTP dispatch failed for ${validRecipients.join(', ')}:`, err.message);
      return { success: false, error: err.message };
    }
  }

  // 3. Fallback to Preview Log Mode
  console.log(`\n=================== [EMAIL PREVIEW MODE] ===================`);
  console.log(`TO: ${validRecipients.join(', ')}`);
  console.log(`SUBJECT: ${subject}`);
  console.log(`============================================================\n`);
  return { success: true, preview: true };
}

/**
 * Common HTML Head and Styling for Swiss Editorial Emails
 */
const getEmailHeader = (title, category = 'AUTOMATED INTEL TRANSMISSION') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;600;700&display=swap');
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F2F0E9; color: #10100E; font-family: 'Space Grotesk', Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="background-color: #F2F0E9; padding: 40px 15px;">
    <div style="max-width: 620px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #C5BBA7; box-shadow: 0 4px 20px rgba(16, 16, 14, 0.05);">
      
      <!-- Brand Header Bar -->
      <div style="padding: 28px 32px 20px 32px; border-bottom: 1px solid #C5BBA7; background-color: #F8F7F2; text-align: left;">
        <div style="font-size: 11px; font-weight: 700; color: #D79218; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px;">
          06 // GAMBIT'S GLITCH 2026 — ${category}
        </div>
        <h1 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 32px; font-weight: normal; color: #10100E; margin: 0; line-height: 1.1;">
          ${title}
        </h1>
      </div>
      <div style="padding: 32px;">
`;

const getEmailFooter = () => `
      </div>
      <!-- Brand Footer -->
      <div style="background-color: #F8F7F2; border-top: 1px solid #C5BBA7; padding: 20px 32px; text-align: center; font-size: 12px; color: #77756F; font-family: 'Space Grotesk', Arial, sans-serif;">
        <p style="margin: 0 0 6px 0;">Keep your Registration ID safe for status tracking on the portal.</p>
        <p style="margin: 0; font-weight: 600; color: #10100E;">© 2026 GAMBIT'S GLITCH. All rights reserved. // Swiss Editorial Infrastructure</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * STAGE 1: Initial Registration & Deck Received Email
 */
export async function sendRegistrationConfirmation(team, members = [], ppt = null) {
  const memberListHtml = members.map((m, i) => `
    <tr style="border-bottom: 1px solid #EAE6DF;">
      <td style="padding: 8px 12px; font-size: 13px; color: #10100E;"><strong>0${i + 1}. ${m.name}</strong></td>
      <td style="padding: 8px 12px; font-size: 13px; color: #77756F;">${m.role || 'Member'}</td>
      <td style="padding: 8px 12px; font-size: 13px; color: #10100E; text-align: right;">${m.email}</td>
    </tr>
  `).join('');

  const pptTitle = ppt ? ppt.project_title : 'Presentation Pitch Deck';
  const pptFile = ppt ? ppt.original_filename : 'Attached File';

  const subject = `[GAMBIT'S GLITCH 2026] Registration Received - Team ${team.team_name} (${team.reg_id})`;

  const html = `
    ${getEmailHeader('Registration & Deck Received', 'ENTRY INDEXED FOR JURY REVIEW')}

    <p style="font-size: 15px; color: #10100E; line-height: 1.6; margin-top: 0;">
      Greetings <strong>${team.leader_name}</strong>,
    </p>
    <p style="font-size: 14px; color: #44433F; line-height: 1.6;">
      Your team registration and pitch deck presentation for <strong>GAMBIT'S GLITCH 2026</strong> have been received and successfully indexed. Our jury panel is evaluating all submitted pitch decks.
    </p>

    <!-- REGISTRATION KEY DATA -->
    <div style="background-color: #F8F7F2; border-left: 4px solid #D79218; border-top: 1px solid #C5BBA7; border-right: 1px solid #C5BBA7; border-bottom: 1px solid #C5BBA7; padding: 18px 20px; margin: 24px 0;">
      <div style="font-size: 11px; font-weight: 700; color: #77756F; letter-spacing: 1px;">REGISTRATION IDENTIFIER</div>
      <div style="font-size: 26px; font-family: monospace; font-weight: 700; color: #D79218; letter-spacing: 2px; margin: 4px 0;">${team.reg_id}</div>
      <div style="font-size: 13px; color: #10100E; margin-top: 6px;"><strong>Team Name:</strong> ${team.team_name}</div>
      <div style="font-size: 13px; color: #10100E;"><strong>Institution:</strong> ${team.college}</div>
      <div style="font-size: 13px; color: #10100E;"><strong>Track:</strong> ${team.theme_id}</div>
    </div>

    <!-- PPT DECK SUBMISSION CONFIRMATION -->
    <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 24px; font-weight: normal; color: #10100E; margin: 24px 0 12px 0;">
      Submitted Pitch Deck Details
    </h2>

    <div style="border: 1px solid #C5BBA7; background-color: #FFFFFF; padding: 16px; margin-bottom: 24px;">
      <div style="font-size: 13px; color: #10100E;"><strong>Project Title:</strong> ${pptTitle}</div>
      <div style="font-size: 13px; color: #10100E; margin-top: 4px;"><strong>Presentation File:</strong> ${pptFile}</div>
      <div style="font-size: 12px; color: #D79218; font-weight: bold; margin-top: 8px;">⏳ Status: UNDER JURY EVALUATION</div>
    </div>

    <!-- NEXT STEPS -->
    <div style="background-color: #F8F7F2; border: 1px solid #C5BBA7; padding: 16px; margin-bottom: 28px; font-size: 13px; color: #44433F; line-height: 1.6;">
      <strong style="color: #10100E;">📋 What Happens Next?</strong>
      <ol style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>Our technical jury will evaluate your presentation pitch deck.</li>
        <li>If your team is <strong>SHORTLISTED</strong>, you will receive a shortlist notification email containing your <strong>Fee Payment Link</strong>.</li>
        <li>After fee payment approval, your official <strong>Payment Invoice & Scannable Attendance QR Pass</strong> will be generated and dispatched to your email.</li>
      </ol>
    </div>

    <!-- SQUAD ROSTER -->
    <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 22px; font-weight: normal; color: #10100E; margin: 24px 0 12px 0;">
      Registered Squad Roster (${members.length} Members)
    </h2>
    <table style="width: 100%; border-collapse: collapse; border: 1px solid #C5BBA7; margin-bottom: 28px;">
      ${memberListHtml}
    </table>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${APP_BASE_URL}/#status" style="background-color: #10100E; color: #F2F0E9; text-decoration: none; font-weight: 700; padding: 14px 28px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; display: inline-block; border: 1px solid #10100E;">
        CHECK PIPELINE STATUS TRACKER →
      </a>
    </div>

    ${getEmailFooter()}
  `;

  const recipients = getEmailRecipients(team, members);
  return sendMailMessage({ recipients, subject, html });
}

/**
 * STAGE 2: Shortlisted Team Email with Payment Link & WhatsApp Link
 */
export async function sendShortlistedEmail(team, members = []) {
  const subject = `[GAMBIT'S GLITCH 2026] Congratulations! Team ${team.team_name} is SHORTLISTED 🎉`;
  const paymentUrl = `${APP_BASE_URL}/#payment?reg_id=${team.reg_id}`;

  const html = `
    ${getEmailHeader('Pipeline Status Tracker', 'OFFICIAL SHORTLIST ANNOUNCEMENT')}

    <div style="background-color: #F8F7F2; border-left: 4px solid #D79218; border: 1px solid #C5BBA7; padding: 20px; margin-bottom: 24px; text-align: center;">
      <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 28px; font-weight: normal; color: #10100E; margin: 0 0 6px 0;">
        Pipeline Status: SHORTLISTED FOR FINALS
      </h2>
      <div style="font-size: 13px; color: #D79218; font-weight: 700; letter-spacing: 1px;">
        CONGRATULATIONS TEAM ${team.team_name.toUpperCase()} (ID: ${team.reg_id})
      </div>
    </div>

    <p style="font-size: 15px; color: #10100E; line-height: 1.6;">
      Dear <strong>${team.leader_name}</strong> and Squad Members,
    </p>
    <p style="font-size: 14px; color: #44433F; line-height: 1.6;">
      We are thrilled to announce that after evaluating your pitch presentation, your team has been officially <strong>SHORTLISTED</strong> for the grand finals of <strong>GAMBIT'S GLITCH 2026</strong>!
    </p>

    <!-- ACTION ITEM 1: FEE PAYMENT LINK -->
    <div style="background-color: #FFFFFF; border: 2px solid #10100E; padding: 24px; margin: 28px 0; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #D79218; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
        MANDATORY FINAL STEP TO CONFIRM SEAT
      </div>
      <h3 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 24px; margin: 4px 0 12px 0; color: #10100E;">
        Submit Participant Registration Fee (₹300 / person)
      </h3>
      <p style="font-size: 13px; color: #44433F; margin-bottom: 18px; line-height: 1.5;">
        To lock your finalist team slot, please complete the registration fee payment for your team (${team.member_count || 1} members × ₹300 = ₹${(team.member_count || 1) * 300}) and submit your 12-digit UTR payment proof.
      </p>
      <a href="${paymentUrl}" target="_blank" style="background-color: #10100E; color: #F2F0E9; text-decoration: none; font-weight: 700; padding: 14px 28px; font-size: 13px; display: inline-block; letter-spacing: 1px; text-transform: uppercase; border: 1px solid #10100E;">
        👉 PAY FEE & SUBMIT PAYMENT PROOF →
      </a>
      <div style="margin-top: 10px; font-size: 11px; color: #77756F;">
        Upon payment approval, your official Payment Invoice & Scannable Attendance QR Pass will be dispatched.
      </div>
    </div>

    <!-- ACTION ITEM 2: WHATSAPP CALLOUT -->
    <div style="background-color: #FFFFFF; border: 2px solid #D79218; padding: 20px; margin: 24px 0; text-align: center;">
      <h3 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 22px; margin-top: 0; color: #10100E;">
        Join Shortlisted Teams WhatsApp Group
      </h3>
      <p style="color: #44433F; font-size: 13px; margin-bottom: 16px;">
        Join our official shortlisted communications channel for live schedule updates, mentorship allocation, and venue guidelines.
      </p>
      <a href="${WHATSAPP_LINK}" target="_blank" style="background-color: #D79218; color: #10100E; text-decoration: none; font-weight: 700; padding: 12px 24px; font-size: 13px; display: inline-block; letter-spacing: 1px; text-transform: uppercase;">
        👉 JOIN SHORTLISTED WHATSAPP GROUP NOW
      </a>
      <div style="margin-top: 12px; font-size: 11px; color: #77756F; word-break: break-all;">
        Direct Link: <a href="${WHATSAPP_LINK}" style="color: #D79218;">${WHATSAPP_LINK}</a>
      </div>
    </div>

    ${getEmailFooter()}
  `;

  const recipients = getEmailRecipients(team, members);
  return sendMailMessage({ recipients, subject, html });
}

/**
 * STAGE 3: Official Payment Invoice & Attendance QR Pass Email (Triggered AFTER Payment Approval)
 */
export async function sendPaymentInvoiceEmail(team, payment = null, ppt = null, members = []) {
  const totalFee = payment ? payment.amount : (team.member_count || 1) * 300;
  const utrNum = payment ? payment.utr_number : 'N/A';
  const payerName = payment ? payment.payer_name : team.leader_name;
  const paymentStatus = payment ? payment.status : 'PENDING';
  const invoiceId = `INV-${team.reg_id}`;
  const issueDate = payment && payment.payment_date ? payment.payment_date : new Date().toISOString().split('T')[0];

  const isApproved = paymentStatus === 'APPROVED';
  const statusBadgeColor = isApproved ? '#465A32' : '#D79218';
  const statusBadgeText = isApproved ? 'OFFICIAL INVOICE PAID & VERIFIED' : 'INVOICE ISSUED (VERIFICATION PENDING)';

  const memberNamesStr = members.length ? members.map(m => m.name).join(', ') : team.leader_name;

  // Generate Scannable Attendance QR Code AFTER Payment
  const qrTextData = `GAMBIT'S GLITCH 2026 ATTENDANCE PASS\n-----------------------------------\nReg ID: ${team.reg_id}\nTeam: ${team.team_name}\nLeader: ${team.leader_name} (${team.leader_phone})\nCollege: ${team.college}\nTrack: ${team.theme_id}\nMembers: ${memberNamesStr}\nPayment Status: PAID & VERIFIED (${invoiceId})`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrTextData)}&color=10100E&bgcolor=F8F7F2`;

  // Build Full Squad Member List HTML Table for Invoice
  const memberListRows = members.length ? members.map((m, i) => `
    <tr style="border-bottom: 1px solid #EAE6DF;">
      <td style="padding: 10px 12px; font-size: 13px; color: #10100E;"><strong>0${i + 1}. ${m.name}</strong></td>
      <td style="padding: 10px 12px; font-size: 13px; color: #77756F;">${m.role || 'Member'}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #10100E;">${m.phone || 'N/A'}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #10100E; text-align: right;">${m.email}</td>
    </tr>
  `).join('') : `
    <tr style="border-bottom: 1px solid #EAE6DF;">
      <td style="padding: 10px 12px; font-size: 13px; color: #10100E;"><strong>01. ${team.leader_name}</strong></td>
      <td style="padding: 10px 12px; font-size: 13px; color: #77756F;">Team Leader</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #10100E;">${team.leader_phone}</td>
      <td style="padding: 10px 12px; font-size: 13px; color: #10100E; text-align: right;">${team.leader_email}</td>
    </tr>
  `;

  const subject = `[GAMBIT'S GLITCH 2026] Payment Invoice & Attendance QR Pass ${invoiceId} - ${team.team_name}`;

  const html = `
    ${getEmailHeader('Payment Invoice & Attendance Pass', 'TAX & RECEIPT DOCUMENT')}

    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
      <div>
        <div style="font-size: 11px; color: #77756F; text-transform: uppercase;">INVOICE NUMBER</div>
        <div style="font-size: 20px; font-weight: bold; font-family: monospace; color: #10100E;">${invoiceId}</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 11px; color: #77756F; text-transform: uppercase;">DATE OF ISSUE</div>
        <div style="font-size: 14px; font-weight: 600; color: #10100E;">${issueDate}</div>
      </div>
    </div>

    <!-- STATUS BANNER -->
    <div style="background-color: #F8F7F2; border-left: 4px solid ${statusBadgeColor}; border-top: 1px solid #C5BBA7; border-right: 1px solid #C5BBA7; border-bottom: 1px solid #C5BBA7; padding: 14px; margin-bottom: 24px; text-align: center;">
      <span style="font-size: 12px; font-weight: bold; color: ${statusBadgeColor}; letter-spacing: 1px;">
        ${statusBadgeText}
      </span>
    </div>

    <!-- SCANNABLE ATTENDANCE QR CODE PASS (DISPATCHED AFTER PAYMENT) -->
    <div style="background-color: #F8F7F2; border: 1px solid #C5BBA7; padding: 24px; margin: 28px 0; text-align: center;">
      <div style="font-size: 11px; font-weight: 700; color: #D79218; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">
        OFFICIAL VENUE ATTENDANCE PASS
      </div>
      <h3 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 24px; margin: 0 0 16px 0; color: #10100E;">
        Scannable Entry QR Pass
      </h3>
      
      <div style="display: inline-block; padding: 12px; background-color: #FFFFFF; border: 1px solid #C5BBA7; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
        <img src="${qrCodeUrl}" alt="Attendance QR Code" style="width: 180px; height: 180px; display: block;" />
      </div>

      <div style="font-size: 12px; color: #10100E; font-weight: bold; margin-top: 12px;">
        REG ID: ${team.reg_id} // ${team.team_name}
      </div>
      <p style="font-size: 12px; color: #77756F; margin: 6px 0 0 0; line-height: 1.4;">
        📷 Show this QR code at the hackathon venue entrance. Scanning displays full team details, verified payment status, leader contacts, and squad members.
      </p>
    </div>

    <!-- BILLING DETAILS -->
    <div style="background-color: #FFFFFF; border: 1px solid #C5BBA7; padding: 18px; margin-bottom: 24px; font-size: 13px;">
      <div style="border-bottom: 1px solid #EAE6DF; padding-bottom: 8px; margin-bottom: 8px;">
        <strong>Billed To:</strong> ${team.leader_name} (${team.team_name})
      </div>
      <div style="border-bottom: 1px solid #EAE6DF; padding-bottom: 8px; margin-bottom: 8px;">
        <strong>Institution / College:</strong> ${team.college} (${team.department}, ${team.year})
      </div>
      <div style="border-bottom: 1px solid #EAE6DF; padding-bottom: 8px; margin-bottom: 8px;">
        <strong>Payer Account Name:</strong> ${payerName}
      </div>
      <div>
        <strong>UTR / Transaction Reference:</strong> <span style="font-family: monospace; font-weight: bold; color: #D79218;">${utrNum}</span>
      </div>
    </div>

    <!-- FULL SQUAD MEMBER LIST IN INVOICE -->
    <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 24px; font-weight: normal; color: #10100E; margin: 24px 0 12px 0;">
      Squad Member Details (${team.member_count || 1} Participants)
    </h2>

    <table style="width: 100%; border-collapse: collapse; border: 1px solid #C5BBA7; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #F8F7F2; border-bottom: 1px solid #C5BBA7; text-align: left; font-size: 12px;">
          <th style="padding: 8px 12px; color: #10100E;">Member Name</th>
          <th style="padding: 8px 12px; color: #10100E;">Role</th>
          <th style="padding: 8px 12px; color: #10100E;">Phone</th>
          <th style="padding: 8px 12px; color: #10100E; text-align: right;">Email</th>
        </tr>
      </thead>
      <tbody>
        ${memberListRows}
      </tbody>
    </table>

    <!-- ITEMIZED BREAKDOWN -->
    <h2 style="font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 24px; font-weight: normal; color: #10100E; margin: 24px 0 12px 0;">
      Itemized Fee Breakdown
    </h2>

    <table style="width: 100%; border-collapse: collapse; border: 1px solid #C5BBA7; margin-bottom: 24px; font-size: 13px;">
      <thead>
        <tr style="background-color: #F8F7F2; border-bottom: 1px solid #C5BBA7; text-align: left;">
          <th style="padding: 10px 12px; font-weight: 700; color: #10100E;">Item Description</th>
          <th style="padding: 10px 12px; font-weight: 700; color: #10100E; text-align: center;">Participants</th>
          <th style="padding: 10px 12px; font-weight: 700; color: #10100E; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom: 1px solid #EAE6DF;">
          <td style="padding: 10px 12px; color: #10100E;">
            <strong>Hackathon Participant Registration Fee</strong><br>
            <span style="font-size: 11px; color: #77756F;">Includes 10-Hour Access, Meals, Mentorship & Official Merch Kit</span>
          </td>
          <td style="padding: 10px 12px; color: #10100E; text-align: center;">${team.member_count || 1}</td>
          <td style="padding: 10px 12px; color: #10100E; text-align: right;">₹${totalFee}.00</td>
        </tr>
        <tr style="background-color: #F8F7F2;">
          <td colspan="2" style="padding: 12px; font-weight: 700; color: #10100E; text-align: right;">TOTAL PAID & VERIFIED:</td>
          <td style="padding: 12px; font-weight: 700; color: #D79218; font-size: 16px; text-align: right;">₹${totalFee}.00</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${APP_BASE_URL}/#status" style="background-color: #10100E; color: #F2F0E9; text-decoration: none; font-weight: 700; padding: 14px 28px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; display: inline-block; border: 1px solid #10100E;">
        VIEW OFFICIAL RECEIPT ON PORTAL →
      </a>
    </div>

    ${getEmailFooter()}
  `;

  const recipients = getEmailRecipients(team, members);
  return sendMailMessage({ recipients, subject, html });
}

/**
 * DIAGNOSTIC: Send manual test email for admin SMTP verification
 */
export async function sendTestEmail(targetEmail) {
  const subject = `[GAMBIT'S GLITCH 2026] SMTP Diagnostic & Test Email`;
  const html = `
    ${getEmailHeader('SMTP Service Verification', 'SYSTEM DIAGNOSTIC TEST')}
    <p style="font-size: 15px; color: #10100E;">
      This is an automated test email from <strong>GAMBIT'S GLITCH 2026</strong>.
    </p>
    <div style="background-color: #F8F7F2; border: 1px solid #C5BBA7; padding: 16px; margin: 20px 0; font-family: monospace; font-size: 13px;">
      <div><strong>Status:</strong> SMTP Transmission Operational ✅</div>
      <div><strong>Target Email:</strong> ${targetEmail}</div>
      <div><strong>SMTP Host:</strong> ${SMTP_HOST || 'N/A'}</div>
      <div><strong>Sender Address:</strong> ${EMAIL_FROM}</div>
      <div><strong>Timestamp:</strong> ${new Date().toISOString()}</div>
    </div>
    <p style="font-size: 13px; color: #77756F;">
      If you are receiving this message, your Nodemailer & SMTP credentials are functioning properly.
    </p>
    ${getEmailFooter()}
  `;

  return sendMailMessage({ recipients: targetEmail, subject, html });
}
