# Nebula Mail App

A sleek, modern email client powered by **CopilotKit** and the **Google Gemini AI**. It integrates directly with your real Gmail account to let you read, search, compose, and reply to emails, all while being assisted by an intelligent AI assistant.

![Nebula Mail](https://img.shields.io/badge/Status-Completed-success)

## Features

* **Real Gmail Integration:** Securely login via Google OAuth 2.0 to access your actual inbox.
* **AI Mail Assistant:** A CopilotKit-powered assistant that can filter your inbox, read emails, and draft replies based on natural language commands.
* **Human-in-the-Loop:** The AI will confidently draft emails for you, but will never send them without your explicit manual confirmation.
* **Stunning Glassmorphism UI:** A custom-built, vibrant dark mode interface with dynamic animations and sleek transparent components.
* **Rich UI AI Chat:** The assistant doesn't just respond with text; it renders dynamic React UI components directly inside the chat window for an enhanced visual experience.
* **Real-time Sync:** The app silently polls the Gmail API in the background to automatically pull in new emails without requiring a page refresh.

## Tech Stack

**Frontend:**
* React (Vite)
* CopilotKit (`@copilotkit/react-ui`, `@copilotkit/react-core`)
* Lucide React (Icons)
* Vanilla CSS (for maximum design flexibility and custom animations)

**Backend:**
* Python (FastAPI)
* Google API Python Client
* Authlib (for Google OAuth)
* Uvicorn

**AI:**
* Node.js (CopilotKit AI Runtime Server)
* Google Gemini (`gemini-3.5-flash` model)

## Setup & Installation

To run this application locally, you need three separate terminals running simultaneously.

### 1. Prerequisites
You must have a Google Cloud Console project configured with:
* The **Gmail API** enabled.
* An **OAuth Consent Screen** configured (Testing Mode).
* **OAuth 2.0 Client IDs** generated for a Web Application with `http://localhost:8000/auth/google/callback` as the authorized redirect URI.
* A Google AI Studio API key for Gemini.

### 2. Backend Setup (FastAPI)
Open Terminal 1:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
```
Create a `.env` file in the `backend` folder:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SECRET_KEY=a_random_secure_string_for_sessions
GEMINI_API_KEY=your_gemini_api_key
```
Start the server:
```bash
uvicorn main:app
```

### 3. Frontend Setup (React)
Open Terminal 2:
```bash
cd frontend
npm install
```
Start the Vite dev server:
```bash
npm run dev
```

### 4. AI Runtime Setup (CopilotKit)
Open Terminal 3:
```bash
cd frontend
node server.js
```

Once all three servers are running, navigate to `http://localhost:5173` in your browser.

## Architecture & Trade-offs

* **Custom CSS vs Tailwind:** We opted for Vanilla CSS to achieve highly customized, complex glassmorphism effects and animated background blobs that are often cumbersome to write cleanly in Tailwind utility classes.
* **Polling vs Webhooks:** For real-time email syncing, we utilized a background polling mechanism `setInterval` tied to the Gmail `historyId`. While Google Pub/Sub push notifications are more efficient for production at scale, polling was chosen to eliminate the need for exposing local `ngrok` tunnels during development.
* **AI Model Selection:** `gemini-3.5-flash` was selected as the CopilotKit adapter model due to its high speed and generous rate limits during intensive UI development testing.
* **Stateless Frontend Filtering:** The inbox uses URL search parameters to maintain filter states. This ensures that when navigating back from an email detail view, the user's complex AI-driven filters remain perfectly preserved.
