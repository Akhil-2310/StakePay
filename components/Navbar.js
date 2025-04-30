"use client"

import { useState } from "react"
import Link from "next/link"
import { useWallet } from "@/context/WalletContext"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { address, connectWallet, disconnectWallet } = useWallet()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleCreateInvoice = () => {
    if (!address) {
      alert("Please connect your wallet first")
      return
    }
    router.push("/dashboard")
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#2E6D9A]">StakePay</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {address ? (
              <>
                <button
                  className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={disconnectWallet}
                >
                  {address.slice(0, 6)}...{address.slice(-4)}
                </button>
                <button
                  className="px-4 py-2 text-sm bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors"
                  onClick={handleCreateInvoice}
                >
                  Create Invoice
                </button>
              </>
            ) : (
              <button
                className="px-4 py-2 text-sm bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3">
            {address ? (
              <>
                <button
                  className="block w-full px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  onClick={disconnectWallet}
                >
                  {address.slice(0, 6)}...{address.slice(-4)}
                </button>
                <button
                  className="block w-full px-4 py-2 text-sm bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors"
                  onClick={handleCreateInvoice}
                >
                  Create Invoice
                </button>
              </>
            ) : (
              <button
                className="block w-full px-4 py-2 text-sm bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
