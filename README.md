# JeevanRoute

🚀 **Live Demo**: [https://jeevanroute.vercel.app](https://jeevanroute.vercel.app)

AI-powered routing for ambulances across India. Connecting patients with the nearest available hospitals in real-time.

## Features

- 🚑 **Ambulance Dashboard**: Real-time navigation and patient management
- 🏥 **Hospital Dashboard**: View incoming patients and manage bed availability
- 🤖 **AI Triage**: Analyze patient symptoms and urgency
- 📍 **Real-time Routing**: Get fastest routes with live traffic data
- 💎 **Gemini-Powered**: We use Gemini for intelligent hospital suggestions

## Tech Stack

- **Next.js 16** - Modern React framework
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Authentication and database
- **Google Maps API** - Mapping and routing
- **Gemini** - AI-powered hospital suggestions

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Make sure to add all environment variables in your Vercel project settings before deploying.
