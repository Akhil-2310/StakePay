// components/dashboard/InvoiceList.js
"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { getEscrowContract } from "@/lib/getEscrowContract"

export default function InvoiceList({ invoices, onUpdateInvoice }) {
  const [loadingId, setLoadingId] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "staked":
        return "bg-purple-100 text-purple-800"
      case "completed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }


  const handleAccept = async (invoice) => {
    setLoadingId(invoice.id)
    try {
      const { contract, provider } = await getEscrowContract()
  
      // ✅ Get on-chain timestamp
      const currentBlock = await provider.getBlock("latest")
      const nowTs = currentBlock.timestamp
  
      // ✅ Get on-chain deadline
      const onChainInv = await contract.invoices(invoice.id)
      const onChainDeadline = Number(onChainInv.deadline)
  
      console.log("🧾 invoice.id:", invoice.id)
      console.log("🕓 block.timestamp:", nowTs, new Date(nowTs * 1000).toISOString())
      console.log("⛓️ inv.deadline:", onChainDeadline, new Date(onChainDeadline * 1000).toISOString())
  
      if (nowTs > onChainDeadline) {
        alert("Cannot accept: deadline has passed on-chain.")
        return
      }
  
      // ✅ Calculate total (stake + amount)
      const total = invoice.stakeAmount + invoice.amount
      const value = ethers.parseEther(total.toString())
  
      const tx = await contract.acceptInvoice(invoice.id, { value })
      await tx.wait()
  
      onUpdateInvoice(invoice.id, "in-progress")
    } catch (err) {
      console.error("acceptInvoice failed:", err)
      alert("Accept failed: " + err.message)
    } finally {
      setLoadingId(null)
    }
  }
  
  

  

  const handleComplete = async (invoice) => {
    setLoadingId(invoice.id)
    try {
      const {contract} = await getEscrowContract()
      const tx = await contract.markCompleted(invoice.id)
      await tx.wait()
      onUpdateInvoice(invoice.id, "completed")
    } catch (err) {
      console.error("markCompleted failed:", err)
      alert("Complete failed: " + err.message)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div>
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Total Invoices</p>
          <p className="text-2xl font-bold">{invoices.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold">{invoices.filter((i) => i.status === "pending").length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Staked</p>
          <p className="text-2xl font-bold">{invoices.filter((i) => i.status === "staked").length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-bold">{invoices.filter((i) => i.status === "completed").length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.length > 0 ? (
                invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.title}</div>
                      <div className="text-sm text-gray-500">#{invoice.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.amount.toFixed(2)} TRBTC</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(invoice.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.deadline}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="text-[#2E6D9A] hover:text-[#245a81] mr-3">View</button>
                      {invoice.status === "staked" && (
                        <button
                          onClick={() => handleAccept(invoice)}
                          disabled={loadingId === invoice.id}
                          className="text-[#2E6D9A] hover:text-[#245a81] mr-3"
                        >
                          {loadingId === invoice.id ? "Accepting…" : "Accept"}
                        </button>
                      )}
                      {invoice.status === "in-progress" && (
                        <button
                          onClick={() => handleComplete(invoice)}
                          disabled={loadingId === invoice.id}
                          className="text-[#2E6D9A] hover:text-[#245a81] mr-3"
                        >
                          {loadingId === invoice.id ? "Completing…" : "Complete"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No invoices found. Create your first invoice!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
