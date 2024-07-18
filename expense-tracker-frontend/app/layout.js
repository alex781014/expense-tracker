import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Expense Tracker",
  description: "Track your expenses easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
