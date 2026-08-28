import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sara's Classroom Daily Log & Parent Reports",
  description: "Daily reporting system for special education students with 1-click email dispatches",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-sky-200">
        {children}
      </body>
    </html>
  );
}
