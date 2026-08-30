import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Chatbot from "../components/Chatbot";

const inter = Inter({ subsets: ["latin"] });

import { ChartProvider } from "../components/ChartContext";

export const metadata: Metadata = {
  title: "UC Admissions Dashboard",
  description: "Analyzing socioeconomic status and admission outcomes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ChartProvider>
          {children}
          <Chatbot />
        </ChartProvider>
      </body>
    </html>
  );
}
