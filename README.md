# Drmoshtv

DRMOSH TV — Complete Streaming Platform Development



Build a complete, production-ready AI entertainment and streaming platform called DRMOSH TV.



This is a platform dedicated to AI-generated television series, original fictional stories, cinematic productions, and AI-powered entertainment.



The platform must look and operate like a premium international streaming service.



Do not build a landing page prototype. Build a complete functional platform with frontend, backend, database, authentication, content management, and a secure administration system.



1. Brand Identity & Design



Brand name: DRMOSH TV



Industry: AI Entertainment & Streaming.



Design direction:



- Premium cinematic interface.

- Dark black background.

- Deep purple surfaces.

- Electric violet highlights.

- Elegant white typography.

- Smooth transitions and subtle animations.

- Modern, minimal, professional layout.



Create a consistent design system across the entire website.



Use the official DRMOSH TV logo provided as an uploaded asset. Do not invent another logo.



The platform must be fully responsive on mobile, tablet, and desktop.



2. Homepage



Build a complete streaming homepage containing:



- Premium hero section featuring a highlighted series.

- Large cinematic background artwork.

- Featured series title and description.

- Watch Now button.

- Latest releases.

- Trending series.

- Most popular productions.

- Recently added episodes.

- Recommended content.

- Original DRMOSH TV productions.

- Genre categories.

- Search functionality.



Each content card must display its poster, title, release year, genre, and availability status.



3. Series Pages



Every series must have its own dedicated page.



Include:



- Series poster.

- Cover image.

- Official title.

- Synopsis.

- Genres.

- Release year.

- Production status.

- Number of seasons.

- Number of episodes.

- Cast and characters where applicable.

- Trailer.

- Episode list.

- Related series.



Create a professional episode navigation system.



4. Video Player



Build a professional video playback page.



Features:



- Responsive video player.

- Play and pause.

- Fullscreen.

- Volume control.

- Playback progress.

- Video quality selection when supported by the hosting provider.

- Next episode button.

- Previous episode button.

- Episode information.

- Related episodes.



Support secure external video hosting URLs and compatible embedded players.



Do not store large video files directly in the main application database.



Only allow content that DRMOSH TV owns or has permission to distribute.



5. Search & Discovery



Create a functional search system.



Users should be able to search by:



- Series name.

- Episode name.

- Genre.

- Production.

- Keywords.



Include genre filters and sorting options.



6. User Experience



Create optional user accounts with:



- Secure registration.

- Login and logout.

- User profiles.

- Watchlist.

- Continue watching.

- Viewing history.

- Password recovery.



Users must never have access to administrative permissions through normal account registration.



7. Hidden Administration Panel



Build a completely separate administration dashboard.



Create a non-obvious, configurable private admin URL.



Do not expose the admin route in:



- Homepage navigation.

- Footer.

- Public menus.

- Search results.

- Sitemap.

- Public API responses.



Important: A hidden URL is not a security system. Protect the dashboard with real authentication and server-side authorization.



Only an authorized administrator with the admin role can access it.



Create the initial administrator account using this email:



ahmadbarazan1203@gmail.com



Create the account through a secure authentication setup process. Do not hardcode passwords in frontend code, database seeds, or public configuration files.



Use secure password hashing and protected sessions.



8. Admin Dashboard Features



Build a professional dashboard with:



Overview



- Total series.

- Total episodes.

- Total users.

- Total views.

- Recently added content.

- Platform activity.



Series Management



- Add new series.

- Edit series.

- Delete series.

- Upload posters.

- Upload cover images.

- Add descriptions.

- Set genres.

- Set release dates.

- Manage publication status.



Episode Management



- Add episodes.

- Edit episodes.

- Delete episodes.

- Assign episodes to seasons.

- Add episode numbers.

- Add episode thumbnails.

- Add video hosting URLs.

- Schedule publication.

- Publish or unpublish episodes.



Homepage Management



- Change featured series.

- Reorder content sections.

- Select trending series.

- Manage latest releases.



User Management



- View registered users.

- View account information.

- Suspend accounts when necessary.

- Manage user roles securely.



Analytics



- Total views.

- Most watched series.

- Most watched episodes.

- Daily and monthly activity.



Platform Settings



- Change platform name and description.

- Manage SEO settings.

- Manage social media links.

- Configure contact information.

- Configure announcements.



9. Database & Backend



Use Supabase for:



- PostgreSQL database.

- Authentication.

- Secure user sessions.

- Storage for posters and thumbnails.

- Database relationships.

- Row Level Security (RLS).



Design a properly normalized database with tables for:



- profiles

- user_roles

- series

- seasons

- episodes

- genres

- series_genres

- watchlists

- watch_history

- featured_content

- platform_settings

- announcements



Create proper relationships and indexes.



Enable Row Level Security on all sensitive tables.



Never expose Supabase service-role keys in frontend code.



All administrative operations must be verified on the server.



10. Content Management Rules



The administrator must be able to manage all platform content without editing source code.



Changes made in the dashboard must immediately appear on the public website when published.



Add confirmation dialogs before destructive actions.



Display clear success and error notifications.



Never allow buttons to appear functional when their actions are not implemented.



11. SEO & Performance



Implement:



- Unique page titles.

- Meta descriptions.

- Open Graph images.

- Dynamic SEO for series and episode pages.

- Sitemap.

- Robots.txt.

- Optimized images.

- Lazy loading.

- Fast navigation.

- Accessible components.



12. Security Requirements



Security is a priority.



Implement:



- Protected admin routes.

- Server-side role verification.

- Secure authentication.

- Rate limiting for authentication endpoints.

- Input validation.

- Protection against unauthorized database operations.

- RLS policies.

- Secure environment variables.

- Safe file upload validation.



Never rely on hiding buttons or hiding URLs as the only security measure.



13. Final Requirements



Build the entire DRMOSH TV platform, not just a visual demonstration.



Before considering the project complete:



1. Test user registration and login.

2. Test administrator login.

3. Test adding and editing series.

4. Test adding and editing episodes.

5. Test video playback.

6. Test homepage content management.

7. Test database permissions.

8. Test unauthorized access to admin routes.

9. Test mobile responsiveness.

10. Fix all errors.



Do not use fake statistics or placeholder functionality in the finished product.



If a feature requires external configuration, explain exactly what must be connected.



Final objective: Deliver a fully functional, secure, premium AI streaming platform under the DRMOSH TV brand, with a private administrator dashboard controlled exclusively by the authorized owner.

خلي اسم الموقع بل عربي ولغه الموقع بل عربي وحط تغيري لغات ووقت حذا يغير لغه لغه الموقع كامل تتغيو ةل شي تتغيو لغتو للغه المختاره

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://drmoshtv.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0c7fb7bb-f69d-4fe9-8a5f-844093b0c5dd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
