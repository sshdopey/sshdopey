import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ClientLayout } from "@/components/client-layout";
import { Magic } from "@/components/magic";
import { WebSiteJsonLd } from "@/components/json-ld";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://sshdopey.com"),
  title: {
    default: "Dopey — Software Engineer",
    template: "%s — Dopey",
  },
  description:
    "Building AI systems and high-performance tools. Python for the models. Rust for everything else.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Dopey",
    title: "Dopey — Software Engineer",
    description:
      "Building AI systems and high-performance tools. Python for the models. Rust for everything else.",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@sshdopey",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: [
              `@media(min-width:769px){`,
              `html,body,*,*::before,*::after{cursor:none!important}`,
              `a,button,select,label,[role="button"],input,.cursor-pointer{cursor:none!important}`,
              `}`,
            ].join(""),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem('theme')==='light')document.documentElement.classList.add('light')}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} noise antialiased`}
      >
        <WebSiteJsonLd />
        <ClientLayout>
          <Magic />
          <Navigation />
          <main className="pt-14 min-h-screen">{children}</main>
          <Footer />
        </ClientLayout>
      </body>
    </html>
  );
}
