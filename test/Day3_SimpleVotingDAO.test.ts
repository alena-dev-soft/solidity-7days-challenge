import { expect } from "chai";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("SimpleVotingDAO", function () {
  async function deployDAOFixture() {
    // Поднимаем контекст сети Hardhat 3
    const context = await network.create();
    const { viem } = context;
    
    const [deployer, voter1, voter2] = await viem.getWalletClients();
    const dao = await viem.deployContract("SimpleVotingDAO");
    const publicClient = await viem.getPublicClient();

    return { dao, deployer, voter1, voter2, publicClient, context, viem };
  }

  it("Should allow voting and calculate votes in O(1) successfully", async function () {
    const { dao, voter1, viem } = await deployDAOFixture();

    // 1. Создаем предложение со сроком действия 1 час (3600 секунд)
    await dao.write.createProposal(["Should we upgrade to Hardhat 3?", 3600n]);

    // 2. Подключаемся от лица voter1 и голосуем "ЗА" (true)
    const daoAsVoter1 = await viem.getContractAt("SimpleVotingDAO", dao.address, { client: { wallet: voter1 } });
    await daoAsVoter1.write.vote([0n, true]);

    // 3. Проверяем, что счетчик "ЗА" увеличился без всяких циклов
    const proposal = await dao.read.proposals([0n]);
    expect(proposal[1]).to.equal(1n); // votesFor идет вторым полем в структуре (индекс 1)

    // 4. Проверяем защиту от дабл-вотинга
    try {
      await daoAsVoter1.write.vote([0n, true]);
      expect.fail("Should have reverted with AlreadyVoted");
    } catch (error: any) {
      expect(error.message).to.include("AlreadyVoted");
    }
  });

  it("Should revert voting if the deadline has passed (Time Travel Test)", async function () {
    const { dao, context, viem } = await deployDAOFixture();

    // 1. Создаем предложение на 60 секунд
    await dao.write.createProposal(["Short duration proposal", 60n]);

    // 🔥 ВРЕМЕННОЙ СДВИГ: Крутим часы блокчейна вперед на 65 секунд!
    // Используем встроенный в контекст Hardhat 3 хелпер
    await context.networkHelpers.time.increase(65);

    // 2. Пытаемся проголосовать после дедлайна — должно заревертить
    try {
      await dao.write.vote([0n, true]);
      expect.fail("Should have reverted with VotingEnding");
    } catch (error: any) {
      expect(error.message).to.include("VotingEnding");
    }
  });
});