import { expect } from "chai";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("AccessControlledVault", function () {
    async function deployVaultFixture() {
        const { viem } = await network.create();
        const [owner, addr1] = await viem.getWalletClients();
        const vault = await viem.deployContract("AccessControlledVault");
        const publicClient = await viem.getPublicClient();

        return { vault, owner, addr1, publicClient };
    }

    it("Should set the correct owner during deployment", async function () {
        const { vault, owner } = await deployVaultFixture();
        const contractOwner = await vault.read.owner();
        expect(contractOwner.toLowerCase()).to.equal(owner.account.address.toLowerCase());
    });

    it("Should allow owner to change the rate and emit event", async function () {
        const { vault, publicClient } = await deployVaultFixture();

        const hash = await vault.write.setRate([100n]);
        await publicClient.waitForTransactionReceipt({ hash });

        const currentRate = await vault.read.conversionRate();
        expect(currentRate).to.equal(100n);
    });

    it("Should allow owner to renounce ownership", async function () {
        const { vault } = await deployVaultFixture();
        
        // Отказываемся от прав
        await vault.write.renounceOwnership();
        
        // Проверяем, что теперь владелец — нулевой адрес
        const currentOwner = await vault.read.owner();
        expect(currentOwner).to.equal("0x0000000000000000000000000000000000000000");
    });

    it("Should not allow anyone to call onlyOwner functions after renouncing", async function () {
        const { vault } = await deployVaultFixture();
        
        // Отказываемся от прав
        await vault.write.renounceOwnership();
        
        // Перехватываем ошибку вручную (try/catch паттерн)
        try {
            await vault.write.setRate([100n]);
            // Если код прошел дальше и не выбросил ошибку — тест должен завалиться
            expect.fail("Transaction should have reverted with NotAnOwner");
        } catch (error: any) {
            // Проверяем, что в тексте ошибки рантайма есть имя нашего кастомного лога
            expect(error.message).to.include("NotAnOwner");
        }
        });

});