import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Citezy — Don't just cite it. Check it.", description: "An AI research workspace that shows the evidence behind each claim." };
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return <html lang="en"><body><a href="#main" className="skip-link">Skip to content</a>{children}</body></html>;
}
