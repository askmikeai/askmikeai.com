# AskMikeAI

AI consulting and services website built with Next.js 14, featuring an interactive AI chatbot.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **React**: 18.2

## Features

- Interactive AI chat interface with streaming responses
- Services showcase (AI Strategy, Custom Solutions, Training)
- Blog with dynamic routing
- About and Contact pages
- Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure your environment variables.

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── api/chat/       # Chat API endpoint
│   ├── about/          # About page
│   ├── blog/           # Blog pages
│   ├── contact/        # Contact page
│   ├── services/       # Services page
│   └── page.tsx        # Homepage with chat
├── components/
│   ├── Header.tsx
│   └── Footer.tsx
└── data/
    └── blog-posts.ts   # Blog content
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
