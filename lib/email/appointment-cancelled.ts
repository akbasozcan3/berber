import { formatIsoDateTr, formatPhoneDisplay, toWhatsAppHref } from "@/lib/utils/format";

export interface AppointmentCancelledEmailData {
  customerName: string;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  businessName: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  siteUrl?: string;
}

export function buildAppointmentCancelledSubject(data: AppointmentCancelledEmailData): string {
  return `Randevunuz İptal Edildi — ${data.businessName}`;
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

function buildLogoHeader(data: AppointmentCancelledEmailData): string {
  const logoSrc = resolveLogoUrl(data.logoUrl, data.siteUrl);
  if (logoSrc) {
    return `<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(data.businessName)}" width="180" height="auto" style="display:block;margin:0 auto;max-width:180px;height:auto;border:0;" />`;
  }
  return `<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;letter-spacing:0.04em;color:#111111;line-height:1.2;">${escapeHtml(data.businessName)}</p>`;
}

export function buildAppointmentCancelledHtml(data: AppointmentCancelledEmailData): string {
  const firstName = data.customerName.trim().split(" ")[0] || data.customerName;
  const dateLabel = formatIsoDateTr(data.date);
  const phoneLine = data.phone ? formatPhoneDisplay(data.phone) : "";
  const bookingUrl = data.siteUrl ? `${data.siteUrl.replace(/\/$/, "")}/randevu` : "";
  const whatsappUrl = data.phone
    ? toWhatsAppHref(
        data.phone,
        `Merhaba, ${dateLabel} ${data.time} randevum hakkında bilgi almak istiyorum.`
      )
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>Randevunuz İptal Edildi</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;color:#1F2937;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:36px 40px 28px;background:#FFFFFF;border-bottom:1px solid #F3F4F6;text-align:center;">
              ${buildLogoHeader(data)}
              <p style="margin:16px 0 0;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#B8941F;font-weight:700;">Randevu İptali</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <span style="display:inline-block;padding:8px 18px;background:#FEF2F2;border:1px solid #FECACA;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#B91C1C;">
                İptal Edildi
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;color:#111827;">
                Merhaba ${escapeHtml(firstName)},
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#6B7280;">
                Aşağıdaki randevunuz <strong style="color:#B91C1C;">iptal edilmiştir</strong>. İlgili saat tekrar müsait hale getirilmiştir.
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
                    <span style="font-size:18px;color:#111827;font-weight:700;">${escapeHtml(data.time)}</span>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#9CA3AF;">
                Yeni randevu almak veya sorularınız için bizimle iletişime geçebilirsiniz.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:20px;">
                <tr>
                  <td style="padding-right:10px;">
                    ${bookingUrl ? `<a href="${escapeHtml(bookingUrl)}" style="display:inline-block;padding:14px 24px;background:#111827;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border-radius:999px;">Yeni Randevu</a>` : ""}
                  </td>
                  <td>
                    ${whatsappUrl ? `<a href="${escapeHtml(whatsappUrl)}" style="display:inline-block;padding:14px 24px;background:#25D366;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border-radius:999px;">WhatsApp</a>` : ""}
                  </td>
                </tr>
              </table>
              ${data.address || phoneLine ? `<div style="margin-top:24px;padding:16px 20px;border:1px solid #E5E7EB;border-radius:14px;">
                <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;">İletişim</p>
                ${data.address ? `<p style="margin:0 0 6px;font-size:14px;color:#4B5563;">${escapeHtml(data.address)}</p>` : ""}
                ${phoneLine ? `<p style="margin:0;font-size:14px;color:#4B5563;">${escapeHtml(phoneLine)}</p>` : ""}
              </div>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px 32px;background:#FAFAFA;border-top:1px solid #F3F4F6;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.6;">Bu e-posta ${escapeHtml(data.businessName)} tarafından otomatik gönderilmiştir.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildAppointmentCancelledText(data: AppointmentCancelledEmailData): string {
  const firstName = data.customerName.trim().split(" ")[0] || data.customerName;
  return `Merhaba ${firstName},

Randevunuz iptal edilmiştir.

Hizmet: ${data.serviceName}
Berber: ${data.barberName}
Tarih: ${formatIsoDateTr(data.date)}
Saat: ${data.time}

Yeni randevu almak için bizimle iletişime geçebilirsiniz.

${data.businessName}${data.phone ? `\nTelefon: ${formatPhoneDisplay(data.phone)}` : ""}`;
}
