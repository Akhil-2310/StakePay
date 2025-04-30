"use client"

import { createContext, useContext, useState, useEffect } from "react"

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null)
  const [balance, setBalance] = useState(null)

  // Mock wallet connection
  const connectWallet = async () => {
    try {
      // In a real app, this would connect to MetaMask or another wallet
      // For demo purposes, we'll just set a mock address
      const mockAddress =
        "0x" +
        Array(40)
          .fill(0)
          .map(() => Math.floor(Math.random() * 16).toString(16))
          .join("")

      setAddress(mockAddress)
      setBalance("10.0") // Mock balance

      return mockAddress
    } catch (error) {
      console.error("Error connecting wallet:", error)
      return null
    }
  }

  const disconnectWallet = () => {
    setAddress(null)
    setBalance(null)
  }

  // Check if wallet was previously connected
  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress")
    if (savedAddress) {
      setAddress(savedAddress)
      setBalance("10.0") // Mock balance
    }
  }, [])

  // Save wallet address to localStorage when connected
  useEffect(() => {
    if (address) {
      localStorage.setItem("walletAddress", address)
    } else {
      localStorage.removeItem("walletAddress")
    }
  }, [address])

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}
