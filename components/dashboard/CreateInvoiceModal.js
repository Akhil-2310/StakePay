"use client"

import { useState, useRef, useEffect } from "react"
import { useWallet } from "@/context/WalletContext"

export default function CreateInvoiceModal({ onClose, onCreateInvoice }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi there! I'll help you create an invoice. Please tell me about the work or items you're providing, the amount, and the deadline for payment.",
    },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState(null)
  const [step, setStep] = useState("chat") // chat, review, stake
  const [stakeAmount, setStakeAmount] = useState("")
  const { address } = useWallet()
  const messagesEndRef = useRef(null)

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isProcessing) return

    // Add user message to chat
    const userMessage = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsProcessing(true)

    // Simulate AI processing
    setTimeout(() => {
      // In a real app, this would be an API call to a language model
      processUserInput(userMessage.content)
    }, 1000)
  }

  const processUserInput = (userInput) => {
    // This is a simplified simulation of NLP extraction
    // In a real app, you would use an AI service like OpenAI to extract this information

    let assistantResponse

    if (!extractedData) {
      // Try to extract invoice details from user input
      const extractedInfo = extractInvoiceDetails(userInput)

      if (extractedInfo.isComplete) {
        setExtractedData(extractedInfo)
        assistantResponse = {
          role: "assistant",
          content:
            `Great! I've extracted the following details:\n\n` +
            `- Service: ${extractedInfo.title}\n` +
            `- Description: ${extractedInfo.description}\n` +
            `- Amount: $${extractedInfo.amount}\n` +
            `- Deadline: ${extractedInfo.deadline}\n\n` +
            `Is this correct? If yes, we can proceed to creating the invoice. If not, please provide the correct information.`,
        }

        // Add confirmation buttons message
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "",
              isAction: true,
            },
          ])
        }, 500)
      } else {
        assistantResponse = {
          role: "assistant",
          content:
            "I need a bit more information. Could you please provide:\n\n" +
            (!extractedInfo.title ? "- What service or product are you providing?\n" : "") +
            (!extractedInfo.amount ? "- How much will you charge?\n" : "") +
            (!extractedInfo.deadline ? "- When is the payment deadline?\n" : ""),
        }
      }
    } else if (userInput.toLowerCase().includes("yes") || userInput.toLowerCase().includes("correct")) {
      assistantResponse = {
        role: "assistant",
        content:
          "Perfect! Let's proceed to creating your invoice. You'll need to stake some trbtc as a guarantee that you'll fulfill the work.",
      }
      setStep("review")
    } else {
      // Reset extraction and ask again
      setExtractedData(null)
      assistantResponse = {
        role: "assistant",
        content: "Let's try again. Please provide the service details, amount, and deadline for your invoice.",
      }
    }

    setMessages((prev) => [...prev, assistantResponse])
    setIsProcessing(false)
  }

  const extractInvoiceDetails = (text) => {
    // This is a simplified extraction logic
    // In a real app, you would use a more sophisticated NLP approach

    const amountMatch = text.match(/\$(\d+(\.\d+)?)|(\d+(\.\d+)?) dollars|(\d+) USD/i)
    const deadlineMatch = text.match(/(due by|deadline|by|due on|due) ([A-Za-z]+ \d+|\d+\/\d+\/\d+|\d+-\d+-\d+)/i)

    // Extract title and description
    let title = ""
    let description = ""

    if (text.length > 10) {
      // Simple heuristic: first sentence is title, rest is description
      const sentences = text.split(/[.!?]/)
      if (sentences.length > 0) {
        title = sentences[0].trim()
        description = sentences.slice(1).join(". ").trim()
      }

      // If title is too long, truncate it
      if (title.length > 50) {
        title = title.substring(0, 47) + "..."
      }
    }

    const result = {
      title: title || "",
      description: description || title || "",
      amount: amountMatch ? Number.parseFloat(amountMatch[1] || amountMatch[3] || amountMatch[5]) : null,
      deadline: deadlineMatch ? deadlineMatch[2] : null,
      isComplete: false,
    }

    // Check if we have all required fields
    result.isComplete = Boolean(result.title && result.amount && result.deadline)

    return result
  }

  const handleConfirmDetails = () => {
    setStep("stake")
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content:
          "Please enter the amount of trbtc you want to stake for this invoice. We recommend staking at least 10% of the invoice value.",
      },
    ])
  }

  const handleEditDetails = () => {
    setExtractedData(null)
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "Let's revise the details. Please provide the updated service information, amount, and deadline.",
      },
    ])
  }

  const handleStakeAndCreate = () => {
    if (!stakeAmount || Number.parseFloat(stakeAmount) <= 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Please enter a valid stake amount.",
        },
      ])
      return
    }

    // Create the invoice
    const newInvoice = {
      title: extractedData.title,
      description: extractedData.description,
      amount: extractedData.amount,
      deadline: extractedData.deadline,
      stakeAmount: Number.parseFloat(stakeAmount),
      status: "pending",
      date: new Date().toISOString().split("T")[0],
      buyerAddress: "", // This would be filled later
    }

    // Here you would interact with the blockchain to stake tokens
    // For now, we'll just simulate it
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `Great! I'm creating your invoice and staking ${stakeAmount} trbtc...`,
      },
    ])

    // Simulate blockchain transaction
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Success! Your invoice has been created and added to your dashboard. You can now send it to your client.",
        },
      ])

      // Wait a moment before closing
      setTimeout(() => {
        onCreateInvoice(newInvoice)
      }, 1500)
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 flex flex-col h-[80vh]">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">
              {step === "chat"
                ? "AI Invoice Assistant"
                : step === "review"
                  ? "Review Invoice Details"
                  : "Stake to Create Invoice"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {step === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-[#2E6D9A] text-white" : "bg-gray-100 text-gray-800"
                    } ${message.isAction ? "flex justify-center space-x-2" : ""}`}
                  >
                    {message.isAction ? (
                      <>
                        <button
                          onClick={handleConfirmDetails}
                          className="px-4 py-2 bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={handleEditDetails}
                          className="px-4 py-2 bg-white text-[#2E6D9A] border border-[#2E6D9A] rounded-md hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                      </>
                    ) : (
                      <div className="whitespace-pre-line">{message.content}</div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#2E6D9A] focus:border-[#2E6D9A]"
                  disabled={isProcessing}
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </>
        )}

        {step === "review" && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Invoice Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Service/Product</p>
                  <p className="font-medium">{extractedData.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p>{extractedData.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">${extractedData.amount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p>{extractedData.deadline}</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep("chat")}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep("stake")}
                className="flex-1 py-2 px-4 bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors"
              >
                Continue to Staking
              </button>
            </div>
          </div>
        )}

        {step === "stake" && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                To create this invoice, you need to stake trbtc as a guarantee that you will fulfill the work or supply
                the items.
              </p>

              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Invoice Summary</h3>
                <p className="text-sm text-gray-600 mb-1">Service: {extractedData.title}</p>
                <p className="text-sm text-gray-600 mb-1">Amount: ${extractedData.amount}</p>
                <p className="text-sm text-gray-600">Deadline: {extractedData.deadline}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stake Amount (trbtc)</label>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#2E6D9A] focus:border-[#2E6D9A]"
                  min="0"
                  step="0.001"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: {(extractedData.amount * 0.1).toFixed(3)} trbtc (10% of invoice value)
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep("review")}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleStakeAndCreate}
                className="flex-1 py-2 px-4 bg-[#2E6D9A] text-white rounded-md hover:bg-[#245a81] transition-colors"
              >
                Stake & Create Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
