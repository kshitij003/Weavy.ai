import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
    title: "Weavy | AI-Powered Design Workflows, Built for Creative Pros",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en" data-wf-domain="www.weavy.ai" data-wf-page="681b040781d5b5e278a6999f" data-wf-site="681b040781d5b5e278a69989" suppressHydrationWarning>
                <head>
                    {/* Webflow Touch Class Script */}
                    <Script id="webflow-touch" strategy="beforeInteractive">
                        {`
            !function(o,c){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);
          `}
                    </Script>

                    {/* Webflow CSS */}
                    <link
                        href="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/css/weavy-ai.webflow.shared.4177f1ac9.css"
                        rel="stylesheet"
                        type="text/css"
                        integrity="sha384-QXfxrJwJZsoq28EStZW945YIe7YK8KY5/pVxXA0iwbzjxi159EEIqBRH2LkgsHNl"
                        crossOrigin="anonymous"
                    />

                    {/* FirstPromoter */}
                    <Script id="firstpromoter" strategy="afterInteractive">
                        {`
            (function(w){w.fpr=w.fpr||function(){w.fpr.q=w.fpr.q||[];w.fpr.q[arguments[0]=='set'?'unshift':'push'](arguments);};})(window);
            fpr("init", {cid:"vzajpas8"});
            fpr("click");
          `}
                    </Script>
                    <Script src="https://cdn.firstpromoter.com/fpr.js" async />

                    {/* Model Viewer loads dynamically in page.tsx to prevent duplicate registration */}

                    {/* Splide CSS for sliders */}
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@splidejs/splide@3.2.2/dist/css/splide-core.min.css" />

                    {/* Finsweet Components */}
                    <Script
                        src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989%2F6544eda5f000985a163a8687%2F6830de8fbc3ef49c91c3f557%2Ffinsweetcomponentsconfig-1.0.0.js"
                        type="module"
                        async
                    />
                </head>
                <body>{children}</body>
            </html>
        </ClerkProvider>
    );
}
