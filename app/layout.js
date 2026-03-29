import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Academos",
  description: "A simple Next.js App Router starter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
