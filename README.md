<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/376f938d-29db-456b-949d-630bd8ef2f69

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` and Supabase variables in `.env`
3. Run the app:
   `npm run dev`

## First-Time Setup (Supabase)

To set up the first administrator account:
1. Sign up through the normal Magic Link flow on the login page.
2. Go to the Supabase Dashboard SQL Editor (or connect via CLI) and run:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE id = '<your-user-uuid>';
   ```
3. Refresh the application to access the `/admin` features.
