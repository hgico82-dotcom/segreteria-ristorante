import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Registro Centrale | Ristorazione", description: "Gestionale operativo della segreteria centrale" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="it"><body>{children}</body></html>;
}
