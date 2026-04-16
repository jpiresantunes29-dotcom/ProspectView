import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "ProspectView",
  description: "Métricas de prospecção de leads",
};

// Roda antes de qualquer paint — evita flash de tema errado
const themeInitScript = `(function(){try{var t=localStorage.getItem('pv-theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.add(r);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body style={{ minHeight: "100vh", background: "var(--background)", color: "var(--foreground)" }}>
        <ThemeProvider>
          <Navbar />
          <main style={{ maxWidth: "76rem", margin: "0 auto", padding: "2.5rem 2rem" }}>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
