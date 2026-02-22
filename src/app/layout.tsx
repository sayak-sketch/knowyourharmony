import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

// Updated SEO Metadata using the spaced "Know Your Harmony"
export const metadata: Metadata = {
  title: "Know Your Harmony | Decode Your Music DNA",
  description: "Discover the sonic DNA, mood, and deeper meaning of your favorite tracks with Know Your Harmony. Get AI-powered music recommendations and analysis.",
  keywords: ["Know Your Harmony", "Music DNA", "AI Music Analysis", "Song Recommender", "Music Discovery"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-[#111119] text-white`}>
        {children}
      </body>
    </html>
  );
}