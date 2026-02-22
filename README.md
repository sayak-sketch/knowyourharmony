# KnowYourHarmony 🎵

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)

**KnowYourHarmony** is an AI-powered music intelligence web application that extracts the "sonic DNA" of any song. By combining the Apple iTunes database with Google's Gemini AI, it generates a highly stylized, editorial-grade analysis of a track's genre, mood, lyrical essence, and deeper musical themes.

> **[View Live Demo]** *https://knowyourharmony.vercel.app/*

*<img width="1891" height="881" alt="image" src="https://github.com/user-attachments/assets/c5a8ac3a-c5d3-45cc-907d-159d7b60c291" />
*

## ✨ Key Features

* 🧬 **AI Sonic Analysis:** Extracts accurate genres, sub-categories, and core themes using Gemini 2.5 Flash.
* 🖋️ **The Lyrical Essence:** Generates a poetic, one-sentence summary of the track's emotional core.
* 🎧 **Verified Audio Integration:** Connects to the Apple iTunes Search API for high-resolution album art and playable 30-second audio previews.
* 🎨 **Cinematic UI & Micro-interactions:** Features dynamic background color-breathing, active EQ visualizers synced to playing audio, and scroll-reveal animations built entirely with Tailwind CSS.
* 📸 **Shareable Profiles:** Utilizes `html-to-image` to instantly generate high-res, downloadable PNGs of a user's music DNA for social sharing.
* 💾 **Smart History:** Caches recent discoveries using browser local storage for instant access.

## 🛠️ The Architecture: Overcoming AI Hallucinations

A major challenge in building AI-driven music applications is "hallucination"—where the AI confidently guesses the wrong artist for a niche or indie song. 

To solve this, KnowYourHarmony utilizes a **Reverse-Verification Engine**:
1.  **The Fetch:** The app first pings the Apple iTunes API with the user's query to retrieve the 100% verified track title and official artist name.
2.  **The Prompt:** That verified data is strictly injected into the Gemini prompt. 
3.  **The Result:** The AI is forced to analyze the correct, verified entity, completely eliminating artist misattribution while delivering a seamless user experience.

## 🚀 Getting Started (Local Development)

To run this project on your local machine:

**1. Clone the repository**
\`\`\`bash
git clone  https://github.com/sayak-sketch/knowyourharmony.git
cd knowyourharmony
\`\`\`

**2. Install dependencies**
\`\`\`bash
npm install
\`\`\`

**3. Set up Environment Variables**
Create a `.env.local` file in the root directory and add your Google Gemini API key:
\`\`\`env
GEMINI_API_KEY=your_api_key_here
\`\`\`

**4. Start the development server**
\`\`\`bash
npm run dev
\`\`\`
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 👨‍💻 Author

**Sayak Mukherjee**
* [LinkedIn] www.linkedin.com/in/sayak-mukherjee-3786a9296
* [GitHub] https://github.com/sayak-sketch/


---
*Developed with Next.js, React, and an absolute love for music discovery.*
