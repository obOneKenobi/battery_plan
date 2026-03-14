# Battery Plan

A tool for planning utility-scale battery storage sites. Select devices, configure quantities, and arrange them on a visual canvas to design your site layout.

**Live site: [battery-plan.vercel.app](https://battery-plan.vercel.app/)**

## Features

- Choose from Tesla energy storage devices — Megapack XL, Megapack 2, Megapack, Powerpack, and Transformer
- Drag and drop devices onto a resizable site canvas
- Rotate individual devices and snap them to valid positions
- Toggle between a labeled view and device images
- See the minimum land dimensions required for your layout in real time
- Tracks total budget and net energy capacity
- Validates transformer requirements (1 transformer per 2 batteries)
- Save and load plans (requires sign-in with Google or GitHub)
- Plans are auto-saved to local storage when not signed in

## Running locally

**Prerequisites:** Node.js, a MongoDB instance, and OAuth credentials for Google and/or GitHub.

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the project root with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string

AUTH_SECRET=a_random_secret_string

AUTH_GOOGLE_ID=your_google_oauth_client_id
AUTH_GOOGLE_SECRET=your_google_oauth_client_secret

AUTH_GITHUB_ID=your_github_oauth_app_id
AUTH_GITHUB_SECRET=your_github_oauth_app_secret
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:8000](http://localhost:8000) in your browser.

## Testing

```bash
npm test          # watch mode — reruns on file changes
npm run test:run  # single run
```

Tests are written with [Vitest](https://vitest.dev/) and [React Testing Library](https://testing-library.com/).
