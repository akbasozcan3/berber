import { formatIsoDateTr, formatPhoneDisplay } from "@/lib/utils/format";
import type { AppointmentConfirmedEmailData } from "@/lib/email/appointment-confirmed";

export type AppointmentReceivedEmailData = AppointmentConfirmedEmailData;

export function buildAppointmentReceivedSubject(data: AppointmentReceivedEmailData): string {
  return `Randevu Talebiniz Alındı — ${data.businessName}`;
}

function resolveLogoUrl(logoUrl: string | undefined, siteUrl: string | undefined): string {
  const raw = logoUrl?.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = siteUrl?.replace(/\/$/, "") || "";
  return base ? `${base}${raw.startsWith("/") ? raw : `/${raw}`}` : raw;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildLogoHeader(data: AppointmentReceivedEmailData): string {
  const logoSrc = resolveLogoUrl(data.logoUrl, data.siteUrl);
  if (logoSrc) {
    return `<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(data.businessName)}" width="180" height="auto" style="display:block;margin:0 auto;max-width:180px;height:auto;border:0;" />`;
  }
  return `<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;letter-spacing:0.04em;color:#111111;line-height:1.2;">${escapeHtml(data.businessName)}</p>`;
}

export function buildAppointmentReceivedHtml(data: AppointmentReceivedEmailData): string {
  const firstName = data.customerName.trim().split(" ")[0] || data.customerName;
  const dateLabel = formatIsoDateTr(data.date);
  const phoneLine = data.phone ? formatPhoneDisplay(data.phone) : "";
  const bookingUrl = data.siteUrl ? `${data.siteUrl.replace(/\/$/, "")}/randevu` : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Randevu Talebiniz Alındı</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;color:#1F2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #F3F4F6;">
              ${buildLogoHeader(data)}
              <p style="margin:16px 0 0;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#B8941F;font-weight:700;">Randevu Talebi</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <span style="display:inline-block;padding:8px 18px;background:#FFFBEB;border:1px solid #FDE68A;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#B45309;">
                Onay Bekleniyor
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#111827;">
                Merhaba ${escapeHtml(firstName)},
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#6B7280;">
                Randevu talebiniz başarıyla alındı. Salon ekibimiz kısa süre içinde talebinizi inceleyecek;
                <strong style="color:#111827;">onaylandığında</strong> size ayrı bir onay e-postası gönderilecektir.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAFAFA;border:1px solid #E5E7EB;border-radius:14px;">
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #E5E7EB;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Hizmet</span>
                    <span style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(data.serviceName)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #E5E7EB;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Berber</span>
                    <span style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(data.barberName)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;border-bottom:1px solid #E5E7EB;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Tarih</span>
                    <span style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(dateLabel)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Saat</span>
                    <span style="font-size:18px;color:#B8941F;font-weight:700;">${escapeHtml(data.time)}</span>
                    <span style="font-size:12px;color:#9CA3AF;margin-left:6px;">(${data.duration} dk)</span>
                  </td>
                </tr>
              </table>
              ${data.address || phoneLine ? `<div style="margin-top:20px;padding:16px 20px;border:1px solid #E5E7EB;border-radius:14px;">
                <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;">Salon</p>
                ${data.address ? `<p style="margin:0 0 6px;font-size:14px;color:#4B5563;">${escapeHtml(data.address)}</p>` : ""}
                ${phoneLine ? `<p style="margin:0;font-size:14px;color:#4B5563;">${escapeHtml(phoneLine)}</p>` : ""}
              </div>` : ""}
              <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#9CA3AF;">
                Bu bir otomatik bilgilendirme e-postasıdır. Değişiklik için salonumuzla iletişime geçebilirsiniz.
              </p>
              ${bookingUrl ? `<p style="margin:20px 0 0;">
                <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;padding:14px 24px;background:#111827;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border-radius:999px;">Yeni Randevu</a>
              </p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;background:#FAFAFA;border-top:1px solid #F3F4F6;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;">Bu e-posta ${escapeHtml(data.businessName)} tarafından otomatik gönderilmiştir.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildAppointmentReceivedText(data: AppointmentReceivedEmailData): string {
  const firstName = data.customerName.trim().split(" ")[0] || data.customerName;
  return `Merhaba ${firstName},

Randevu talebiniz alındı. Salon onayladığında ayrı bir onay e-postası gönderilecektir.

Hizmet: ${data.serviceName}
Berber: ${data.barberName}
Tarih: ${formatIsoDateTr(data.date)}
Saat: ${data.time}

${data.businessName}`;
}
