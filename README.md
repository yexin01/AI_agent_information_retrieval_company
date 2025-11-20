<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI Company Profile Agent

An advanced AI-powered corporate intelligence platform that uses Google Gemini to research and analyze companies. Features an interactive chatbot with RAG (Retrieval-Augmented Generation) capabilities and model selection.

View your app in AI Studio: https://ai.studio/apps/drive/1dLvnbSxqI_gnhjVgpGNLnmYJkQpO1-ki

## Features

- 🔍 **Company Research**: Automated web research using Gemini 2.5 Flash with Google Search
- 💬 **AI Chatbot**: Interactive assistant with:
  - Model selection (Flash vs Pro)
  - Web Search/RAG toggle for up-to-date information
  - Context-aware responses about researched companies
- 📊 **Rich Visualizations**: Financial charts, metrics, and trend analysis
- 🎨 **Modern UI**: Beautiful, responsive interface with glassmorphism effects

## Run Locally

**Prerequisites:** Node.js (v18 or higher)

1. **Clone the repository** (if not already done)
   ```bash
   git clone <your-repo-url>
   cd AI_agent_information_retrieval_company
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```
   
   Get your API key from: https://aistudio.google.com/apikey

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

## Deploy to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts to link your project.

4. **Set environment variables**
   ```bash
   vercel env add GEMINI_API_KEY
   ```
   
   When prompted, enter your Gemini API key and select all environments (Production, Preview, Development).

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub** (if not already done)

2. **Import project in Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect the framework settings

3. **Add environment variables**
   - In the project settings, go to **Settings → Environment Variables**
   - Add `GEMINI_API_KEY` with your API key
   - Make sure it's enabled for Production, Preview, and Development

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

## Project Structure

```
├── server/              # Express server for API proxy
│   └── index.js        # Proxy endpoints for Gemini API
├── src/
│   ├── components/     # React components
│   │   ├── Chatbot.tsx # AI chatbot with settings
│   │   └── ...
│   ├── services/       # API services
│   │   └── geminiService.ts
│   └── App.tsx         # Main application
├── vercel.json         # Vercel deployment config
└── package.json
```

## Chatbot Features

The integrated chatbot supports:

- **Model Selection**: Choose between Gemini 2.5 Flash (faster) or Pro (deeper reasoning)
- **Web Search (RAG)**: Enable real-time web search for up-to-date information
- **Context Awareness**: Automatically uses the current company profile as context

## Troubleshooting

### API Key Issues

If you see "GEMINI_API_KEY is not configured" errors:

1. **Local development**: Make sure `.env` file exists with `GEMINI_API_KEY=your_key`
2. **Vercel deployment**: Verify the environment variable is set in Vercel dashboard
3. **After adding env vars**: Redeploy the application

### Deployment Issues

- Make sure all dependencies are in `package.json`
- Verify `vercel.json` is properly configured
- Check Vercel deployment logs for specific errors

## License

MIT

## Built With

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Google Gemini](https://ai.google.dev/) - AI model
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

