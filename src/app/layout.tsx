import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "给我讲个故事",
  description: "一场温柔的网页叙事写作游戏"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
