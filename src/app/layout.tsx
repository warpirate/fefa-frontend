import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Dancing_Script } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { DataProvider } from "@/contexts/DataContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import "@/styles/base/index.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "fefa",
  description: "Premium handcrafted jewelry for fashion-conscious women",
  keywords: ["jewelry", "handcrafted", "premium", "women", "fashion", "accessories"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo1.png", sizes: "32x32", type: "image/png" },
      { url: "/logo1.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo1.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo1.png" type="image/png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/logo1.png" />
      </head>
      <body
        className={`${poppins.variable} ${dancingScript.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider attribute="class" defaultTheme="light">
          <DataProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <SearchProvider>
                    {children}
                  </SearchProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}