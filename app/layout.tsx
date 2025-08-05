import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

// Update title and description
export const metadata: Metadata = {
    title: "Polygon Temperature Visualizer",
    description: "Visualize temperature data across polygons using Open-Meteo API",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {/* Title section */}
                <div className="w-full text-center text-slate-50 bg-slate-900 text-3xl font-bold px-2 py-2">
                    Polygon Climate Visualizer
                </div>
                {/* Page content */}
                {children}
            </body>
        </html>
    );
}
