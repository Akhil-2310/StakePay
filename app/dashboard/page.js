"use client"

import { useState, useEffect } from "react"
import { ethers } from "ethers"
import Navbar from "@/components/Navbar"
import InvoiceList from "@/components/dashboard/InvoiceList"
import CreateInvoiceModal from "@/components/dashboard/CreateInvoiceModal"
import Footer from "@/components/Footer"
import { getEscrowContract } from "@/lib/getEscrowContract"

export default function Dashboard() {
  const [invoices, setInvoices] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const { contract } = await getEscrowContract()
        const nextId = await contract.nextId()
        const items = []

        for (let i = 0; i < nextId; i++) {
          const inv = await contract.invoices(i)
          if (inv.supplier !== ethers.ZeroAddress) {
            const statusMap = ["staked", "in-progress", "completed", "cancelled"]

            items.push({
              id: i.toString(),
              title: inv.title,
              description: inv.description,
              amount: Number(ethers.formatEther(inv.amount)),
              stakeAmount: Number(ethers.formatEther(inv.supplierStake)),
              deadline: new Date(Number(inv.deadline) * 1000).toISOString().split("T")[0],
              date: new Date().toISOString().split("T")[0],
              status: statusMap[inv.status] || "unknown"
            })
          }
        }

        setInvoices(items)
      } catch (err) {
        console.error("Failed to fetch invoices:", err)
      }
    }

    fetchInvoices()
  }, [])

  const handleCreateInvoice = (newInvoice) => {
    setInvoices(prev => [
      {
        ...newInvoice,
        date: new Date().toISOString().split("T")[0],
      },
      ...prev,
    ])
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

        {
          <InvoiceList invoices={invoices} onUpdateInvoice={(id, status) =>
            setInvoices(prev =>
              prev.map(inv =>
                inv.id === id ? { ...inv, status } : inv
              )
            )
          } />
        }
      </div>

      {isModalOpen && (
        <CreateInvoiceModal onClose={() => setIsModalOpen(false)} onCreateInvoice={handleCreateInvoice} />
      )}

      <Footer />
    </div>
  )
}
