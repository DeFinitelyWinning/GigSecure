import "./globals.css";
import localFont from "next/font/local";
import { WalletProvider } from "../components/providers/WalletProvider";

const firaCode = localFont({
  src: "../public/fonts/FiraCode-Regular.ttf",
  weight: "400",
  style: "normal",
  variable: "--font-body",
});

const neueMachina = localFont({
  src: "../public/fonts/NeueMachina-Regular.otf",
  weight: "800",
  style: "normal",
  variable: "--font-heading",
});

export const metadata = {
  title: "GigSecure",
  description: "XRPL micro-escrow for freelancers",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${firaCode.variable} ${neueMachina.variable}`}
    >
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
