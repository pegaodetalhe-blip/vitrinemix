import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VitrineMix — Compre, venda, renove",
  description: "Achados, usados e desapegos em Campos dos Goytacazes e região."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
