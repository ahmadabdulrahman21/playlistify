
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Analytics />
        {children}
      </body>
    </html>
  );
}
