export async function uploadImage(file: File, folder = "general"): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const response = await fetch("/api/v1/admin/upload", {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    throw new Error(data.error || "Görsel yüklenemedi.");
  }
  return data.url;
}
