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
  address?: string;
  phone?: string;
  siteUrl?: string;
}

export function buildAppointmentConfirmedSubject(data: AppointmentConfirmedEmailData): string {
  return `Randevunuz Onaylandı — ${data.businessName}`;
}

export function buildAppointmentConfirmedHtml(data: AppointmentConfirmedEmailData): string {
  const firstName = data.customerName.trim().split(" ")[0] || data.customerName;
  const dateLabel = formatIsoDateTr(data.date);
  const phoneLine = data.phone ? formatPhoneDisplay(data.phone) : "";
  const bookingUrl = data.siteUrl ? `${data.siteUrl.replace(/\/$/, "")}/randevu` : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Randevunuz Onaylandı</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Georgia,'Times New Roman',serif;color:#F8F8F8;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0A0A0A;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#121212;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;border-bottom:1px solid rgba(212,175,55,0.25);">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#D4AF37;font-family:Arial,sans-serif;">Randevu Onayı</p>
              <h1 style="margin:0;font-size:26px;font-weight:400;line-height:1.3;color:#FFFFFF;">${escapeHtml(data.businessName)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#E4E4E7;">Merhaba <strong style="color:#FFFFFF;">${escapeHtml(firstName)}</strong>,</p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#A1A1AA;font-family:Arial,sans-serif;">
                Randevunuz başarıyla <strong style="color:#4ade80;">onaylandı</strong>. Sizi aşağıdaki tarih ve saatte bekliyoruz.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#0A0A0A;border:1px solid rgba(255,255,255,0.06);border-radius:12px;">
                <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-family:Arial,sans-serif;">
                  <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#71717A;margin-bottom:4px;">Hizmet</span>
                  <span style="font-size:15px;color:#FFFFFF;">${escapeHtml(data.serviceName)}</span>
                </td></tr>
                <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-family:Arial,sans-serif;">
                  <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#71717A;margin-bottom:4px;">Berber</span>
                  <span style="font-size:15px;color:#FFFFFF;">${escapeHtml(data.barberName)}</span>
                </td></tr>
                <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-family:Arial,sans-serif;">
                  <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#71717A;margin-bottom:4px;">Tarih</span>
                  <span style="font-size:15px;color:#FFFFFF;">${escapeHtml(dateLabel)}</span>
                </td></tr>
                <tr><td style="padding:16px 20px;border-bottom:1px solid rgba(255,255,255,0.06);font-family:Arial,sans-serif;">
                  <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#71717A;margin-bottom:4px;">Saat</span>
                  <span style="font-size:18px;color:#D4AF37;font-weight:600;">${escapeHtml(data.time)}</span>
                  <span style="font-size:12px;color:#71717A;margin-left:8px;">(${data.duration} dk)</span>
                </td></tr>
                <tr><td style="padding:16px 20px;font-family:Arial,sans-serif;">
                  <span style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#71717A;margin-bottom:4px;">Ücret</span>
                  <span style="font-size:15px;color:#FFFFFF;">₺${data.price.toLocaleString("tr-TR")}</span>
                </td></tr>
              </table>
              ${data.address || phoneLine ? `<div style="margin-top:24px;padding:16px 20px;border-radius:12px;background:rgba(255,255,255,0.03);font-family:Arial,sans-serif;">
                <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.15em;color:#71717A;">Salon Bilgileri</p>
                ${data.address ? `<p style="margin:0 0 6px;font-size:14px;color:#A1A1AA;">${escapeHtml(data.address)}</p>` : ""}
                ${phoneLine ? `<p style="margin:0;font-size:14px;color:#A1A1AA;">${escapeHtml(phoneLine)}</p>` : ""}
              </div>` : ""}
              <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#71717A;font-family:Arial,sans-serif;">
                Randevunuza zamanında gelmenizi rica ederiz. Değişiklik için salonumuzla iletişime geçebilirsiniz.
              </p>
              ${bookingUrl ? `<p style="margin:20px 0 0;font-family:Arial,sans-serif;">
                <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;padding:12px 24px;background:#D4AF37;color:#0A0A0A;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;border-radius:999px;">Yeni Randevu</a>
              </p>` : ""}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;border-top:1px solid rgba(255,255,255,0.06);font-family:Arial,sans-serif;">
              <p style="margin:0;font-size:11px;color:#52525B;line-height:1.5;">Bu e-posta ${escapeHtml(data.businessName)} tarafından otomatik gönderilmiştir.</p>
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
Saat: ${data.time}
Ücret: ₺${data.price.toLocaleString("tr-TR")}

${data.address ? `Adres: ${data.address}\n` : ""}${data.phone ? `Telefon: ${formatPhoneDisplay(data.phone)}\n` : ""}
${data.businessName}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
