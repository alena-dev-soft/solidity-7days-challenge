import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

const SimpleEscrowModule = buildModule("SimpleEscrowModule", (m) => {
  // 1. Access the default accounts of the local node
  // m.getAccount(0) — is the buyer (the deployer)
  const seller = m.getAccount(1);
  const arbiter = m.getAccount(2);

  // 2. Set a fixed amount for the escrow (for example, 1 ETH)
  const escrowAmount = parseEther("1");

  // 3. Deploy the contract, passing arguments strictly in the order of the Solidity constructor
  const escrow = m.contract("SimpleEscrow", [seller, arbiter, escrowAmount]);

  return { escrow };
});

// 🔥 CRITICALLY IMPORTANT: Ignition requires a default export of the module!
export default SimpleEscrowModule;