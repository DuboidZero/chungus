# Setup Instructions

Welcome to the MIT Portfolio System. Follow these steps to get the project running locally.

## Prerequisites
- Node.js (v18 or higher recommended)
- npm

## Installation & Setup

1. **Navigate to the frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   *(This will install React, TailwindCSS, Lucide React, Recharts, React Router, and other necessary packages).*

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open your browser and navigate to the local URL provided in your terminal (typically `http://localhost:5173`).

## Environment Variables

Vite automatically looks for different `.env` files depending on what command you run:

- **`.env.development`**: Vite loads this automatically when you run `npm run dev`. It sets `VITE_USE_MOCK=true`, meaning you can develop on your local machine instantly without needing a real database or backend server running.
- **`.env.production`**: Vite loads this automatically when you run `npm run build` (which creates the finalized files for deployment). It forces `VITE_USE_MOCK=false`, ensuring the deployed app never tries to use the fake in-memory mock data.
