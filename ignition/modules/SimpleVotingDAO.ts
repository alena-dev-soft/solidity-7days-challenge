import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SimpleVotingDAOModule = buildModule("SimpleVotingDAOModule", (m) => {
  // Deploy the contract without constructor parameters
  const dao = m.contract("SimpleVotingDAO");

  // Return the contract future
  return { dao };
});
// 🔥 Strictly adhere to default export for Ignition!
export default SimpleVotingDAOModule;