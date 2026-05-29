import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MyTokenModule = buildModule("MyTokenModule", (m) => {
  // Deploy MyToken contract with an empty constructor argument array
  const token = m.contract("MyToken", []);

  // Return the deployed contract future
  return { token };
});

export default MyTokenModule;