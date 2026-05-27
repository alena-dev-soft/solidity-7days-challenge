import { expect } from "chai";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("SimpleEscrow", function () {
  async function deployEscrowFixture() {
    const { viem } = await network.create();
    const [buyer, seller, arbiter] = await viem.getWalletClients();
    
    const escrowAmount = parseEther("1"); // 1 ETH

    // Deploy the contract on behalf of the buyer
    const escrow = await viem.deployContract("SimpleEscrow", [
      seller.account.address,
      arbiter.account.address,
      escrowAmount
    ]);

    const publicClient = await viem.getPublicClient();

    return { escrow, buyer, seller, arbiter, escrowAmount, publicClient, viem };
  }

  it("Should handle successful escrow flow (Happy Path)", async function () {
    const { escrow, buyer, seller, arbiter, escrowAmount, viem } = await deployEscrowFixture();

    // 1. Buyer makes a deposit
    await (escrow.write as any).deposit([], { value: escrowAmount });

    // 2. Arbiter calls release from their account
    const escrowAsArbiter = await viem.getContractAt("SimpleEscrow", escrow.address, { client: { wallet: arbiter } });
    await escrowAsArbiter.write.release();

    // Check that the seller's balance is recorded in the contract
    const sellerBalanceInEscrow = await escrow.read.balanceOf([seller.account.address]);
    expect(sellerBalanceInEscrow).to.equal(escrowAmount);

    // 3. Seller withdraws the funds (Pull)
    const escrowAsSeller = await viem.getContractAt("SimpleEscrow", escrow.address, { client: { wallet: seller } });
    await escrowAsSeller.write.withdraw();

    // Verify that the balance is zeroed
    const finalBalance = await escrow.read.balanceOf([seller.account.address]);
    expect(finalBalance).to.equal(0n);
  });

  it("Should revert if non-arbiter tries to release", async function () {
    const { escrow, buyer, escrowAmount } = await deployEscrowFixture();

    await (escrow.write as any).deposit([], { value: escrowAmount });
    
    // Buyer attempts to call release themselves — should revert with OnlyArbiter
    try {
      await escrow.write.release();
      expect.fail("Should have reverted");
    } catch (error: any) {
      expect(error.message).to.include("OnlyArbiter");
    }
  });
});