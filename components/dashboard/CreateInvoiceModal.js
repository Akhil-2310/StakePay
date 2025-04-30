/*
  File: components/CreateInvoiceModal.js
  Fully implemented AI invoice assistant with on-chain invoice creation.
*/

"use client"

import { useState, useRef, useEffect } from "react"
import { ethers } from "ethers"
import { getEscrowContract } from "@/lib/getEscrowContract"

export default function CreateInvoiceModal({ onClose, onCreateInvoice }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi there! I'll help you create an invoice. Please describe the work, the amount in TRBTC, and the deadline (YYYY-MM-DD).",
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [step, setStep] = useState("chat") // chat, review, stake
  const [stakeAmount, setStakeAmount] = useState("")

  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    setIsProcessing(true)
    setMessages((m) => [...m, { role: "user", content: input }])
    setInput("")

    try {
      const resp = await fetch("/api/extract-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      })

      if (!resp.ok) {
        const text = await resp.text()
        console.error("API error:", resp.status, text)
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Server error (${resp.status})` },
        ])
        return
      }

      const payload = await resp.json()
      if (!payload.extracted) {
        console.error("Missing payload.extracted:", payload)
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Couldn't extract invoice data.` },
        ])
        return
      }

      const ext = payload.extracted
      setExtractedData(ext)
      setStep("review")
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            `Got it! I extracted:\n` +
            `• Service: ${ext.title}\n` +
            `• Amount: ${ext.amount} TRBTC\n` +
            `• Deadline: ${ext.deadline}\n\n` +
            `Please confirm or edit.`,
          isAction: true,
        },
      ])
    } catch (err) {
      console.error("handleSendMessage failed:", err)
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Oops, something went wrong.` },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  const handleConfirmDetails = () => {
    setStep("stake")
    setMessages((m) => [
      ...m,
      {
        role: "assistant",
        content: "Great! How much TRBTC would you like to stake as collateral?",
      },
    ])
  }

  const handleEditDetails = () => {
    setExtractedData(null)
    setStep("chat")
    setMessages((m) => [
      ...m,
      { role: "assistant", content: "Sure—please provide the updated details." },
    ])
  }

  const handleStakeAndCreate = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Enter a valid stake amount first." },
      ])
      return
    }

    setIsProcessing(true)
    setMessages((m) => [
      ...m,
      { role: "assistant", content: `Staking ${stakeAmount} TRBTC and creating invoice…` },
    ])

    try {
      const escrow = await getEscrowContract()
      const amountWei = ethers.parseEther(extractedData.amount.toString())
      const deadlineTs = Math.floor(new Date(extractedData.deadline).getTime() / 1000)
      const stakeWei = ethers.parseEther(stakeAmount)

      const tx = await escrow.createInvoice(
        extractedData.title,
        extractedData.description || extractedData.title,
        amountWei,
        deadlineTs,
        { value: stakeWei }
      )
      await tx.wait()

      setMessages((m) => [
        ...m,
        { role: "assistant", content: "✅ Invoice created on-chain!" },
      ])

      onCreateInvoice({
        id: Date.now().toString(),
        title: extractedData.title,
        description: extractedData.description,
        amount: extractedData.amount,
        deadline: extractedData.deadline,
        stakeAmount: parseFloat(stakeAmount),
        status: "staked",
        date: new Date().toISOString().split("T")[0],
      })
      onClose()
    } catch (err) {
      console.error(err)
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Transaction failed: ${err.message}` },
      ])
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 flex flex-col h-[80vh]">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {step === "chat"
              ? "AI Invoice Assistant"
              : step === "review"
              ? "Review Invoice"
              : "Stake & Create"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Content */}
        {step === "chat" && (
          <form onSubmit={handleSendMessage} className="flex flex-col flex-1">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] p-3 rounded-lg ${
                      msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t flex space-x-2">
              <input
                className="flex-1 border rounded px-3 py-2"
                placeholder="Describe your invoice..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isProcessing}
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={isProcessing}
              >
                Send
              </button>
            </div>
          </form>
        )}

        {step === "review" && (
          <div className="p-4 flex-1 flex flex-col">
            <div className="mb-4">
              <h3 className="font-medium">Invoice Summary</h3>
              <p>Service: {extractedData.title}</p>
              <p>Amount: {extractedData.amount} TRBTC</p>
              <p>Deadline: {extractedData.deadline}</p>
            </div>
            <div className="mt-auto flex space-x-2">
              <button
                onClick={handleEditDetails}
                className="flex-1 border px-4 py-2 rounded"
              >
                Edit
              </button>
              <button
                onClick={handleConfirmDetails}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        )}

        {step === "stake" && (
          <div className="p-4 flex-1 flex flex-col">
            <label className="mb-2">Stake Amount (TRBTC):</label>
            <input
              type="number"
              min="0"
              step="0.001"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              className="border rounded px-3 py-2 mb-4"
            />
            <button
              onClick={handleStakeAndCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-auto"
            >
              Stake & Create Invoice
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

