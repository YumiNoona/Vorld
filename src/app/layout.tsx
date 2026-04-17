import type { Metadata, Viewport } from "next";
import { Geist, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0c0c" },
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
      className={`${geist.variable} ${inter.variable} dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-screen bg-[--bg] font-body text-[--text-1] antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster closeButton position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
