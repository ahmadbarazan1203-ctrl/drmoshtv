<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- UI strings live in src/lib/i18n.tsx (4 languages); never hardcode visible text. Why: every page must switch language.
- Admin access is enforced by the `admin` role in user_roles via RLS/has_role; the private URL (src/lib/admin-path.ts + route file name) is only obscurity.
- Database, auth and storage use the owner's own Supabase project via src/lib/db.ts (client), src/lib/db-auth.ts + src/lib/db-middleware.ts (server auth, service client from EXT_STORAGE_SERVICE_KEY); never import @/integrations/supabase/client or Cloud middleware. Schema changes must also be applied to that project. Why: owner moved everything off Lovable Cloud.
- Images upload via the admin-checked server function in src/lib/ext-storage.functions.ts to the public `media` bucket. Why: workspace rule kept files in owner storage.
- Shared admin image fields also accept validated HTTPS URLs without uploading or copying the image; episode videos use direct HTTPS files or the existing YouTube/Vimeo embeds. Why: external hosting must remain an alternative to owner storage.
