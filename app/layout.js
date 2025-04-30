import { WalletProvider } from "@/context/WalletContext"
import "./globals.css"

export const metadata = {
  title: "StakePay - Blockchain Invoice Management",
  description: "Create, manage, and secure your invoices with blockchain technology",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  )
}
