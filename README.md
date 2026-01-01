# GodCast: AI Philosophical Debates

## Project Overview

GodCast is an innovative web application that generates and plays philosophical debates between historical and fictional characters, brought to life using AI voices. The application is built with a modern web stack and leverages Supabase Edge Functions for serverless AI processing.

The core functionality involves:
1.  **Conversation Generation**: Using a large language model (LLM) via the Lovable AI Gateway to create a structured debate script based on a topic and selected participants.
2.  **Text-to-Speech (TTS)**: Converting the generated dialogue into audio using the ElevenLabs API, with specific voices assigned to each character.
3.  **Playback**: A custom audio player handles the sequential playback of the debate turns, including pre-loading the next turn's audio for a seamless listening experience.

## Technology Stack

This project is built using the following technologies:

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [Vite](https://vitejs.dev/), [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/) | Fast development environment and component-based UI. |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/) | Utility-first CSS framework and accessible UI components. |
| **Backend/Serverless** | [Supabase](https://supabase.com/) | Database, Authentication, and Edge Functions (Deno runtime). |
| **AI Services** | [Lovable AI Gateway](https://lovable.dev/) | LLM access for debate generation (`generate-debate` Edge Function). |
| **Audio Services** | [ElevenLabs](https://elevenlabs.io/) | High-quality Text-to-Speech generation (`elevenlabs-tts` Edge Function). |

## Local Development Setup

To run this project locally, you will need to set up your environment and configure Supabase.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18+) and npm/pnpm/yarn
*   [Supabase CLI](https://supabase.com/docs/guides/cli)
*   API Keys for **Lovable AI Gateway** and **ElevenLabs**

### 1. Clone the Repository

```bash
git clone https://github.com/DevGruGold/divinitypodcast.git
cd divinitypodcast
```

### 2. Install Dependencies

```bash
npm install
# or pnpm install
# or yarn install
```

### 3. Configure Supabase

This project relies on two Supabase Edge Functions: `generate-debate` and `elevenlabs-tts`.

**A. Link to Your Supabase Project**

If you have an existing Supabase project, link it:
```bash
supabase link --project-ref <YOUR_PROJECT_REF>
```
Otherwise, initialize a new local project:
```bash
supabase init
```

**B. Set Environment Variables**

The Edge Functions require the following secrets. Create a file named `.env.local` in the root directory and add your keys:

```
# Supabase Project URL and Public Key (found in your Supabase project settings)
VITE_SUPABASE_URL="<YOUR_SUPABASE_URL>"
VITE_SUPABASE_PUBLISHABLE_KEY="<YOUR_SUPABASE_PUBLIC_KEY>"

# API Keys for Edge Functions
LOVABLE_API_KEY="<YOUR_LOVABLE_AI_GATEWAY_KEY>"
ELEVENLABS_API_KEY="<YOUR_ELEVENLABS_API_KEY>"
```

You must also set these secrets for the Supabase Edge Functions.

```bash
# Set secrets for the local Supabase environment
supabase secrets set --env-file .env.local

# For deployment, set secrets on your remote Supabase project
# supabase secrets set --env-file .env.local --project-ref <YOUR_PROJECT_REF>
```

**C. Start Supabase Services**

Start the local Supabase stack, including the database and Edge Functions:
```bash
supabase start
```

### 4. Run the Frontend

Start the Vite development server:
```bash
npm run dev
```
The application should now be running at `http://localhost:5173` (or similar).

## Customization

### Adding New Episodes

Episode data is stored in `src/data/episodes.ts`. To add a new episode, append a new object to the `episodes` array:

```typescript
// src/data/episodes.ts
{
  id: "new-topic-slug",
  title: "A New Philosophical Topic",
  description: "A brief summary of the debate.",
  topic: "The core question to be debated by the LLM.",
  participants: ["character-id-1", "character-id-2", "character-id-3"], // Must match IDs in characters.ts
  duration: "XX min",
  createdAt: new Date().toISOString().split('T')[0],
  isFeatured: false, // or true
},
```

### Adding New Characters

Character data is stored in `src/data/characters.ts`. You must add an entry to both the `characterVoices` map and the `characters` array.

1.  **Voice Configuration (`characterVoices`)**: Map a unique character ID to an ElevenLabs Voice ID.
    ```typescript
    // src/data/characters.ts
    export const characterVoices: Record<string, string> = {
      // ... existing voices
      "new-character-id": "<ELEVENLABS_VOICE_ID>", 
    };
    ```

2.  **Character Details (`characters`)**: Define the character's profile. The `speakingStyle` and `famousQuote` are crucial as they are used in the LLM prompt to guide the debate generation.
    ```typescript
    // src/data/characters.ts
    export const characters: Character[] = [
      // ... existing characters
      {
        id: "new-character-id",
        name: "New Character Name",
        era: "Time and place of origin",
        description: "A short bio.",
        famousQuote: "A quote that captures their essence.",
        speakingStyle: "Describe their expected speaking style for the AI.",
        avatarInitials: "NC",
        color: "hsl(100, 50%, 50%)", // A unique color for their avatar
      },
    ];
    ```

## Deployment

The application is designed for deployment on platforms that support a modern React/Vite build and a Supabase backend.

1.  **Supabase Deployment**: Deploy your Edge Functions and database schema using the Supabase CLI.
    ```bash
    supabase functions deploy generate-debate
    supabase functions deploy elevenlabs-tts
    ```
2.  **Frontend Deployment**: Build the static assets and deploy them to a hosting service like Vercel, Netlify, or Lovable.
    ```bash
    npm run build
    ```
    The build output will be in the `dist` directory.

## Bug Fixes and Enhancements (v1.1)

This update includes the following fixes:

*   **Fixed Audio Playback Bug**: Resolved an issue where the audio player would not automatically start playing the first turn of a debate after a new episode was selected. The `useAudioPlayback` hook was updated to correctly trigger the `play` function upon conversation generation completion.
*   **'Go Live' Button Functionality**: The non-functional 'Go Live' button in the header now displays a "Coming Soon" toast notification, providing a better user experience instead of a silent failure.
*   **Updated Documentation**: Replaced the generic Lovable-generated `README.md` with this comprehensive documentation covering the project stack, local setup, customization, and deployment.
