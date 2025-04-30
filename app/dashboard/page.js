"use client"

import { useState, useEffect } from "react"
import Navbar from "@/components/Navbar"
import InvoiceList from "@/components/dashboard/InvoiceList"
import CreateInvoiceModal from "@/components/dashboard/CreateInvoiceModal"
import { useWallet } from "@/context/WalletContext"
import Footer from "@/components/Footer" // Import Footer

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { address } = useWallet()

  useEffect(() => {
    // Fetch invoices from API or local storage
    const fetchInvoices = async () => {
      // Mock data for now
      const mockInvoices = [
        { id: "1", title: "Website Development", amount: 2500, status: "pending", date: "2025-04-25" },
        { id: "2", title: "Logo Design", amount: 500, status: "in-progress", date: "2025-04-28" },
        { id: "3", title: "SEO Services", amount: 1200, status: "staked", date: "2025-04-30" },
        { id: "4", title: "Content Writing", amount: 800, status: "completed", date: "2025-04-15" },
      ]
      setInvoices(mockInvoices)
    }

    fetchInvoices()
  }, [])

  const handleCreateInvoice = (newInvoice) => {
    setInvoices([...invoices, { ...newInvoice, id: Date.now().toString() }])
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Invoice Dashboard</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors"
          >
            Create Invoice
          </button>
        </div>

        {!address ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">Please connect your wallet to view invoices</p>
          </div>
        ) : (
          <InvoiceList invoices={invoices} />
        )}
      </div>

      {isModalOpen && (
        <CreateInvoiceModal onClose={() => setIsModalOpen(false)} onCreateInvoice={handleCreateInvoice} />
      )}

      <Footer />
    </div>
  )
}
