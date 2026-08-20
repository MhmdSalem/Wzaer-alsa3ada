import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";

const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex",
});

const kufi = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kufi",
});

export const metadata: Metadata = {
  title: {
    default: "وزير السعادة | عروض سوبر ماركت فاقوس",
    template: "%s | وزير السعادة",
  },
  description:
    "سوبر ماركت وزير السعادة في فاقوس، الشرقية. عروض يومية مع تايمر وسعر قبل وبعد. حلاوته زيادة.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${plex.variable} ${kufi.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-bg font-sans text-text">
        {children}
      </body>
    </html>
  );
}
