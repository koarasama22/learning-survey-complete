import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "学習時間アンケート",
  description: "学校用 学習時間記録システム",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
