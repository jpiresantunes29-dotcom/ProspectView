import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/sidebar";
import CacheWarmer from "@/components/cache-warmer";
import { ThemeProvider } from "@/lib/theme";
import { ToastContainer } from "@/components/toast";

export const metadata: Metadata = {
  title: "ProspectView",
  description: "Métricas de prospecção de leads",
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('pv-theme')||'dark';var r=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.classList.add(r);var d=localStorage.getItem('pv-density')||'comfortable';document.documentElement.setAttribute('data-density',d);}catch(e){}})();`;

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
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          background: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <ThemeProvider>
          <CacheWarmer />
          <ToastContainer />
          <Sidebar />
          <main className="app-main page-fade">
            <div className="page-wrap">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
