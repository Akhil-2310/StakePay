import { ethers } from "ethers";
import { ESCROW_ABI, ESCROW_ADDRESS } from "./contract";

export async function getEscrowContract() {
  if (!window.ethereum) throw new Error("No Web3 wallet found");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer   = await provider.getSigner();
  const contract = new ethers.Contract(ESCROW_ADDRESS, ESCROW_ABI, signer);
  return { contract, provider };
}
