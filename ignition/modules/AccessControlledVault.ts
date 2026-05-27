import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AccessControlledVaultModule = buildModule("AccessControlledVaultModule", (m) => {
    const vault = m.contract("AccessControlledVault");

  return { vault };
});

export default AccessControlledVaultModule;