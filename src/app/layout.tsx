import type { Metadata } from "next";
import { Anton, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magma Service Desk",
  description: "Operación clara para resolver, registrar y mantener el control.",
  icons: { icon: "/magma-favicon.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${anton.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col items-center bg-background text-foreground" suppressHydrationWarning>
        <main className="flex-1 w-full flex flex-col items-center">
          {children}
        </main>
      </body>
    </html>
  );
}
