import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "AI Chatbot - Trợ lý thông minh",
  description: "Nền tảng chatbot AI thông minh với khả năng tùy biến cao, hỗ trợ Custom Chatbot, RAG và nhiều tính năng mạnh mẽ.",
  keywords: "chatbot, AI, langchain, custom chatbot, RAG",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-sans antialiased">{children}</body>
    </html>
  );
}
