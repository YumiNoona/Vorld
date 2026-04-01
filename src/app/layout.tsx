import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Vorld — Interactive 3D for everyone",
    template: "%s | Vorld",
  },
  description: "Upload your GLB files, configure interactivity, and publish stunning 3D experiences in minutes. No code required.",
  keywords: ["3D", "WebGL", "Interactive", "No-code", "SaaS", "Three.js", "React Three Fiber"],
  authors: [{ name: "Vorld Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vorld.io",
    siteName: "Vorld",
    title: "Vorld — Interactive 3D for everyone",
    description: "The professional platform for interactive 3D web experiences.",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vorld — Interactive 3D for everyone",
    description: "The professional platform for interactive 3D web experiences.",
    creator: "@vorldapp",
    images: ["/og-image.png"],
  },
  metadataBase: new URL("https://vorld.io"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} selection:bg-accent/30 selection:text-accent-foreground`}
    >
      <body className="min-h-screen bg-background font-sans text-text-primary antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster closeButton position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
