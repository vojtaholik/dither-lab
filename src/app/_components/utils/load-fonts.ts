import localFont from "next/font/local";

export const departureMono = localFont({
  preload: true,
  display: "block",
  variable: "--font-departure-mono",
  src: [
    {
      path: "../../fonts/DepartureMono-Regular.woff2",
      weight: "300",
      style: "normal",
    },
  ],
});
