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
  const dateLabel = formatIsoDateTr(data.date);
  return `${data.businessName}: Randevu onayı ${dateLabel} ${data.time}`;
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

function buildLogoHeader(data: AppointmentConfirmedEmailData): string {
  const logoSrc = resolveLogoUrl(data.logoUrl, data.siteUrl);
  // Uzak logo spam skorunu bozmasın diye metin marka her zaman var; logo opsiyonel.
  const brand = `<p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;color:#111111;line-height:1.3;">${escapeHtml(data.businessName)}</p>`;
  if (!logoSrc) return brand;
  return `${brand}<img src="${escapeHtml(logoSrc)}" alt="${escapeHtml(data.businessName)}" width="140" style="display:block;margin:14px auto 0;max-width:140px;height:auto;border:0;" />`;
}

export function buildAppointmentConfirmedHtml(data: AppointmentConfirmedEmailData): string {
  const firstName = data.customerName.trim().split(" ")[0] || data.customerName;
  const dateLabel = formatIsoDateTr(data.date);
  const phoneLine = data.phone ? formatPhoneDisplay(data.phone) : "";
  const siteLink = data.siteUrl?.replace(/\/$/, "") || "";
  const siteHost = siteLink.replace(/^https?:\/\//, "");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>Randevu onayı</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;color:#1F2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Randevu bilginiz: ${escapeHtml(dateLabel)} saat ${escapeHtml(data.time)} — ${escapeHtml(data.serviceName)}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F5F5F5;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#FFFFFF;border:1px solid #E5E7EB;">
          <tr>
            <td style="padding:28px 28px 20px;text-align:center;border-bottom:1px solid #EEEEEE;">
              ${buildLogoHeader(data)}
              <p style="margin:12px 0 0;font-size:12px;color:#6B7280;">Randevu onayı</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:#111827;">
                Merhaba ${escapeHtml(firstName)},
              </p>
              <p style="margin:0 0 22px;font-size:14px;line-height:1.7;color:#4B5563;">
                Randevunuz onaylandı. Aşağıdaki bilgilerle sizi bekliyoruz.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #E5E7EB;">
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;color:#6B7280;width:34%;">Hizmet</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#111827;">${escapeHtml(data.serviceName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;color:#6B7280;">Berber</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#111827;">${escapeHtml(data.barberName)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;color:#6B7280;">Tarih</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#111827;">${escapeHtml(dateLabel)}</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;border-bottom:1px solid #E5E7EB;font-size:13px;color:#6B7280;">Saat</td>
                  <td style="padding:12px 14px;border-bottom:1px solid #E5E7EB;font-size:14px;color:#111827;">${escapeHtml(data.time)} (${data.duration} dk)</td>
                </tr>
                <tr>
                  <td style="padding:12px 14px;font-size:13px;color:#6B7280;">Ücret</td>
                  <td style="padding:12px 14px;font-size:14px;color:#111827;">₺${data.price.toLocaleString("tr-TR")}</td>
                </tr>
              </table>
              ${data.address || phoneLine ? `<p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#4B5563;">
                ${data.address ? `<strong>Adres:</strong> ${escapeHtml(data.address)}<br />` : ""}
                ${phoneLine ? `<strong>Telefon:</strong> ${escapeHtml(phoneLine)}` : ""}
              </p>` : ""}
              <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#6B7280;">
                Değişiklik için lütfen salonumuzla iletişime geçin.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid #EEEEEE;background:#FAFAFA;">
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6B7280;">
                ${escapeHtml(data.businessName)}
                ${data.address ? `<br />${escapeHtml(data.address)}` : ""}
                ${phoneLine ? `<br />${escapeHtml(phoneLine)}` : ""}
                ${siteHost ? `<br />${escapeHtml(siteHost)}` : ""}
              </p>
              <p style="margin:10px 0 0;font-size:11px;color:#9CA3AF;">
                Bu bilgilendirme e-postası randevu onayınız için otomatik gönderilmiştir.
              </p>
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
  const lines = [
    `Merhaba ${firstName},`,
    "",
    "Randevunuz onaylandı. Detaylar:",
    "",
    `Hizmet: ${data.serviceName}`,
    `Berber: ${data.barberName}`,
    `Tarih: ${formatIsoDateTr(data.date)}`,
    `Saat: ${data.time} (${data.duration} dk)`,
    `Ücret: ₺${data.price.toLocaleString("tr-TR")}`,
  ];
  if (data.address) lines.push(`Adres: ${data.address}`);
  if (data.phone) lines.push(`Telefon: ${formatPhoneDisplay(data.phone)}`);
  lines.push("", "Değişiklik için salonumuzla iletişime geçebilirsiniz.", "", data.businessName);
  if (data.siteUrl) lines.push(data.siteUrl.replace(/\/$/, ""));
  return lines.join("\n");
}
