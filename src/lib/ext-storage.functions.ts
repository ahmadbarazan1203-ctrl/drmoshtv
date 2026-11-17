import { createServerFn } from "@tanstack/react-start";
import { requireDbAuth } from "@/lib/db-auth.server";

const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const MAX = 5 * 1024 * 1024;

// Admin-only: uploads an image to the owner's external storage project (public "media" bucket).
export const uploadImage = createServerFn({ method: "POST" })
  .middleware([requireDbAuth])
  .inputValidator((d: { folder: string; type: string; base64: string }) => {
    if (!/^[a-z0-9_-]{1,40}$/.test(d?.folder ?? "")) throw new Error("Invalid folder");
    if (!ALLOWED[d?.type]) throw new Error("JPG / PNG / WEBP");
    if (typeof d.base64 !== "string" || d.base64.length > MAX * 1.4) throw new Error("Max 5MB");
    return d;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const url = process.env["EXT_STORAGE_URL"]?.replace(/\/+$/, "");
    const key = process.env["EXT_STORAGE_SERVICE_KEY"];
    if (!url || !key) throw new Error("Storage not configured");
    const bin = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bin.byteLength > MAX) throw new Error("Max 5MB");
    const path = `${data.folder}/${crypto.randomUUID()}.${ALLOWED[data.type]}`;
    const headers: Record<string, string> = { apikey: key, "content-type": data.type, "cache-control": "31536000" };
    if (key.startsWith("eyJ")) headers["Authorization"] = `Bearer ${key}`;
    const res = await fetch(`${url}/storage/v1/object/media/${path}`, { method: "POST", headers, body: bin });
    if (!res.ok) throw new Error(`Upload failed (${res.status})`);
    return { url: `${url}/storage/v1/object/public/media/${path}` };
  });
