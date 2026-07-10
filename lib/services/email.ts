import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { getSetting } from "./booking";
import {
  buildAppointmentConfirmedHtml,
  buildAppointmentConfirmedSubject,
  buildAppointmentConfirmedText,
  type AppointmentConfirmedEmailData,
} from "@/lib/email/appointment-confirmed";

export interface EmailResult {
  sent: boolean;
  skipped?: boolean;
  reason?: string;
  error?: string;
}

let transporter: Transporter | null = null;

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim()?.replace(/\s+/g, "");
  const from = process.env.SMTP_FROM?.trim() || user;

  if (!user || !pass) {
    return null;
  }

  return { host, port, user, pass, from };
}

function getTransporter(): Transporter | null {
  const config = getSmtpConfig();
  if (!config) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  return transporter;
}

async function isEmailEnabled(): Promise<boolean> {
  const flag = await getSetting("notifications_email");
  return flag !== "false";
}

export async function sendAppointmentConfirmedEmail(
  to: string,
  data: AppointmentConfirmedEmailData
): Promise<EmailResult> {
  if (!(await isEmailEnabled())) {
    return { sent: false, skipped: true, reason: "E-posta bildirimleri kapalı" };
  }

  const recipient = to.trim().toLowerCase();
  if (!recipient || !recipient.includes("@")) {
    return { sent: false, skipped: true, reason: "Müşteri e-postası yok" };
  }

  const mailer = getTransporter();
  const config = getSmtpConfig();
  if (!mailer || !config?.from) {
    return { sent: false, skipped: true, reason: "SMTP yapılandırması eksik" };
  }

  const businessName = data.businessName || "Salon";
  const fromName = `${businessName}`;

  try {
    await mailer.sendMail({
      from: `"${fromName}" <${config.from}>`,
      to: recipient,
      subject: buildAppointmentConfirmedSubject(data),
      text: buildAppointmentConfirmedText(data),
      html: buildAppointmentConfirmedHtml(data),
    });
    return { sent: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : "E-posta gönderilemedi";
    console.error("[Email] Appointment confirmed failed:", error);
    return { sent: false, error };
  }
}

export async function getEmailStatus(): Promise<{
  configured: boolean;
  enabled: boolean;
}> {
  return {
    configured: Boolean(getSmtpConfig()),
    enabled: await isEmailEnabled(),
  };
}
