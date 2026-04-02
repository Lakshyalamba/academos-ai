import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Academos | Student Academic Assistant",
  description:
    "Academos turns student academic records into clear summaries, tasks, and insights.",
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
