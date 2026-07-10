import { formatIsoDateTr, formatPhoneDisplay } from "@/lib/utils/format";

export interface AppointmentConfirmedEmailData {
  customerName: string;
  serviceName: string;
  barberName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  businessName: string;
  logoUrl?: string;
  address?: string;
  phone?: string;
  siteUrl?: string;
}

export function buildAppointmentConfirmedSubject(data: AppointmentConfirmedEmailData): string {
  return `Randevunuz Onaylandı — ${data.businessName}`;
}

function resolveLogoUrl(logoUrl: string | undefined, siteUrl: string | undefined): string {
  const raw = logoUrl?.trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = siteUrl?.replace(/\/$/, "") || "";
  return base ? `${base}${raw.startsWith("/") ? raw : `/${raw}`}` : raw;
}

function buildLogoHeader(data: AppointmentConfirmedEmailData): string {
  const logoSrc = resolveLogoUrl(data.logoUrl, data.siteUrl);
  if (logoSrc) {
    return `<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(data.businessName)}" width="180" height="auto" style="display:block;margin:0 auto;max-width:180px;height:auto;border:0;" />`;
  }
  return `<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;letter-spacing:0.04em;color:#111111;line-height:1.2;">${escapeHtml(data.businessName)}</p>`;
}

export function buildAppointmentConfirmedHtml(data: AppointmentConfirmedEmailData): string {
  const firstName = data.customerName.trim().split(" ")[0] || data.customerName;
  const dateLabel = formatIsoDateTr(data.date);
  const phoneLine = data.phone ? formatPhoneDisplay(data.phone) : "";
  const bookingUrl = data.siteUrl ? `${data.siteUrl.replace(/\/$/, "")}/randevu` : "";
  const siteLink = data.siteUrl?.replace(/\/$/, "") || "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>Randevunuz Onaylandı</title>
</head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,Helvetica,sans-serif;color:#1F2937;-webkit-text-size-adjust:100%;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding:36px 40px 28px;background:#FFFFFF;border-bottom:1px solid #F3F4F6;text-align:center;">
              ${buildLogoHeader(data)}
              <p style="margin:16px 0 0;font-size:10px;letter-spacing:0.32em;text-transform:uppercase;color:#B8941F;font-weight:700;">Randevu Onayı</p>
            </td>
          </tr>

          <!-- Status badge -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <span style="display:inline-block;padding:8px 18px;background:#ECFDF5;border:1px solid #A7F3D0;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#047857;">
                ✓ Onaylandı
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 40px 32px;">
              <p style="margin:0 0 12px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;line-height:1.4;color:#111827;">
                Merhaba ${escapeHtml(firstName)},
              </p>
              <p style="margin:0 0 28px;font-size:15px;line-height:1.75;color:#6B7280;">
                Randevunuz başarıyla onaylandı. Sizi aşağıdaki tarih ve saatte ağırlamaktan mutluluk duyarız.
              </p>

              <!-- Details card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FAFAFA;border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;">
                <tr>
                  <td style="padding:18px 22px;border-bottom:1px solid #E5E7EB;width:38%;vertical-align:top;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Hizmet</span>
                    <span style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(data.serviceName)}</span>
                  </td>
                  <td style="padding:18px 22px;border-bottom:1px solid #E5E7EB;vertical-align:top;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Berber</span>
                    <span style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(data.barberName)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 22px;border-bottom:1px solid #E5E7EB;vertical-align:top;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Tarih</span>
                    <span style="font-size:15px;color:#111827;font-weight:600;">${escapeHtml(dateLabel)}</span>
                  </td>
                  <td style="padding:18px 22px;border-bottom:1px solid #E5E7EB;vertical-align:top;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Saat</span>
                    <span style="font-size:20px;color:#B8941F;font-weight:700;">${escapeHtml(data.time)}</span>
                    <span style="font-size:12px;color:#9CA3AF;margin-left:6px;">(${data.duration} dk)</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:18px 22px;vertical-align:top;">
                    <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;margin-bottom:6px;">Ücret</span>
                    <span style="font-size:18px;color:#111827;font-weight:700;">₺${data.price.toLocaleString("tr-TR")}</span>
                  </td>
                </tr>
              </table>

              ${data.address || phoneLine ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;background:#FFFFFF;border:1px solid #E5E7EB;border-radius:14px;">
                <tr>
                  <td style="padding:18px 22px;">
                    <p style="margin:0 0 10px;font-size:10px;text-transform:uppercase;letter-spacing:0.16em;color:#9CA3AF;font-weight:700;">Salon Bilgileri</p>
                    ${data.address ? `<p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#4B5563;">📍 ${escapeHtml(data.address)}</p>` : ""}
                    ${phoneLine ? `<p style="margin:0;font-size:14px;line-height:1.6;color:#4B5563;">📞 ${escapeHtml(phoneLine)}</p>` : ""}
                  </td>
                </tr>
              </table>` : ""}

              <p style="margin:28px 0 0;font-size:13px;line-height:1.7;color:#9CA3AF;">
                Randevunuza zamanında gelmenizi rica ederiz. Değişiklik veya iptal için salonumuzla iletişime geçebilirsiniz.
              </p>

              ${bookingUrl ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin-top:24px;">
                <tr>
                  <td>
                    <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;padding:14px 28px;background:#111827;color:#FFFFFF;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;border-radius:999px;">Yeni Randevu Al</a>
                  </td>
                </tr>
              </table>` : ""}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;background:#FAFAFA;border-top:1px solid #F3F4F6;text-align:center;">
              <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#111827;">${escapeHtml(data.businessName)}</p>
              ${siteLink ? `<p style="margin:0 0 12px;font-size:12px;"><a href="${escapeHtml(siteLink)}" style="color:#B8941F;text-decoration:none;">${escapeHtml(siteLink.replace(/^https?:\/\//, ""))}</a></p>` : ""}
              <p style="margin:0;font-size:11px;color:#9CA3AF;line-height:1.6;">Bu e-posta ${escapeHtml(data.businessName)} tarafından otomatik olarak gönderilmiştir.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildAppointmentConfirmedText(data: AppointmentConfirmedEmailData): string {
  const firstName = data.customerName.trim().split(" ")[0] || data.customerName;
  return `Merhaba ${firstName},

Randevunuz onaylandı.

Hizmet: ${data.serviceName}
Berber: ${data.barberName}
Tarih: ${formatIsoDateTr(data.date)}
Saat: ${data.time} (${data.duration} dk)
Ücret: ₺${data.price.toLocaleString("tr-TR")}

${data.address ? `Adres: ${data.address}\n` : ""}${data.phone ? `Telefon: ${formatPhoneDisplay(data.phone)}\n` : ""}
Randevunuza zamanında gelmenizi rica ederiz.

${data.businessName}${data.siteUrl ? `\n${data.siteUrl}` : ""}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
