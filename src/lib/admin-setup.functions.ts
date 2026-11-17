import { createServerFn } from "@tanstack/react-start";

const ADMIN_EMAIL = "ahmadbarazan1203@gmail.com";

// One-time setup: creates the single admin account only if it does not exist yet.
export const setupAdminAccount = createServerFn({ method: "POST" })
  .inputValidator((d: { email: string; password: string }) => {
    if (typeof d?.email !== "string" || typeof d?.password !== "string") throw new Error("Invalid");
    if (d.password.length < 8 || d.password.length > 72) throw new Error("Password must be 8-72 characters");
    return { email: d.email.trim().toLowerCase(), password: d.password };
  })
  .handler(async ({ data }) => {
    if (data.email !== ADMIN_EMAIL) throw new Error("Not allowed");
    const supabaseAdmin = (await import("@/lib/db-middleware")).dbAdmin();
    const { data: list, error: le } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (le) throw new Error(le.message);
    if (list.users.some((u) => u.email?.toLowerCase() === ADMIN_EMAIL)) throw new Error("Account already exists");
    const { error } = await supabaseAdmin.auth.admin.createUser({ email: data.email, password: data.password, email_confirm: true });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
