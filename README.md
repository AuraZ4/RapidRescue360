<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/187dfa14-710f-4c6d-b31f-81177ce65c3c

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Set `VITE_GOOGLE_MAPS_API_KEY` in `.env.local` to a key with the Google Maps JavaScript API enabled. Restrict the key by HTTP referrer and API in Google Cloud Console.
4. Run the app:
   `npm run dev`
