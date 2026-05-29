import { expect } from "chai";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { parseEther } from "viem";

describe("MyToken & ICO", function () {
  async function deployTokenFixture() {
    const context = await network.create();
    const { viem } = context;
    
    const [owner, investor] = await viem.getWalletClients();
    const token = await viem.deployContract("MyToken");
    const publicClient = await viem.getPublicClient();

    return { token, owner, investor, publicClient, context, viem };
  }

  it("Should correctly assign initial pre-mint to owner", async function () {
    const { token, owner } = await deployTokenFixture();

    const ownerBalance = await token.read.balanceOf([owner.account.address]);
    // Owner should hold exactly 50,000 tokens with 18 decimals
    expect(ownerBalance).to.equal(50000n * 10n ** 18n);
  });

  it("Should allow buying tokens through ICO with exact rate", async function () {
    const { token, investor, viem } = await deployTokenFixture();

    // Investor buys tokens by forwarding 1 ETH
    const tokenAsInvestor = await viem.getContractAt("MyToken", token.address, { client: { wallet: investor } });
    await tokenAsInvestor.write.buyTokens({ value: parseEther("1") });

    // 1 ETH = 1000 MET. Verify the investor received the correct token balance
    const investorBalance = await token.read.balanceOf([investor.account.address]);
    expect(investorBalance).to.equal(1000n * 10n ** 18n);
  });

  it("Should revert if purchase exceeds HARDCAP", async function () {
    const { token, investor, viem } = await deployTokenFixture();
    const tokenAsInvestor = await viem.getContractAt("MyToken", token.address, { client: { wallet: investor } });

    // ICO hardcap limit is 100,000 tokens. Attempting to purchase via 101 ETH will fail
    try {
      await tokenAsInvestor.write.buyTokens({ value: parseEther("101") });
      expect.fail("Should have reverted with HardcapReached");
    } catch (error: any) {
      expect(error.message).to.include("HardcapReached");
    }
  });
});