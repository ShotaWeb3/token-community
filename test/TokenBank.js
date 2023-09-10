const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenBankコントラクト", () => {
  let TokenBank;
  let tokenBank;
  const name = "Token";
  const symbol = "Tbk";
  let owner;
  let addr1;
  let addr2;
  let addr3;
  const zeroAddress = "0x0000000000000000000000000000000000000000";

  beforeEach(async () => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();
    TokenBank = await ethers.getContractFactory("TokenBank");
    tokenBank = await TokenBank.deploy(name, symbol);
    await tokenBank.deployed(); 
  });
  describe("デプロイ", () => {
    it("トークンの名前とシンボルがセットされるべき", async () => {
      expect(await tokenBank.name()).to.equal(name);
      expect(await tokenBank.symbol()).to.equal(symbol);
    });
    it("デプロイアドレスがownerに設定されるべき", async () => {
      expect(await tokenBank.owner()).to.equal(owner.address);
    });
    it("ownerに総額が割り当てられるべき", async () => {
      const ownerBalance = await tokenBank.balanceOf(owner.address);
      expect(await tokenBank.totalSupply()).to.equal(ownerBalance);
    });
    it("TokenBankが預かっている総額がゼロであるべき", async () => {
      expect(await tokenBank.bankTotalDeposit()).to.equal(0)
    })
  });
  describe("アドレス間トランザクション", () => {
    beforeEach(async () => {
      await tokenBank.transfer(addr1.address, 500);
    });
    it("トークン移転がされるべき", async () => {
      const startAddr1Balance = await tokenBank.balanceOf(addr1.address);
      const startAddr2Balance = await tokenBank.balanceOf(addr2.address);

      await tokenBank.connect(addr1).transfer(addr2.address, 100);

      const endAddr1Balance = await tokenBank.balanceOf(addr1.address);
      const endAddr2Balance = await tokenBank.balanceOf(addr2.address);

      expect(endAddr1Balance).to.equal(startAddr1Balance.sub(100));
      expect(endAddr2Balance).to.equal(startAddr2Balance.add(100));
    });
    it("ゼロアドレスの移転は失敗するべき", async () => {
      await expect(tokenBank.transfer(zeroAddress, 100))
      .to.be.revertedWith("Zero address cannot specified for 'to'");
    });
    it("残高不足の場合は移転に失敗するべき", async () => {
      await expect(tokenBank.connect(addr1).transfer(addr2.address, 510))
      .to.be.revertedWith("Insufficient balance!");
    });
    it("移転後は'TokenTransfer'イベントが発行されるべき", async () => {
      expect(await tokenBank.connect(addr1).transfer(addr2.address, 100))
      .emit(tokenBank, "TokenTransfer").withArgs(addr1.address, addr2.address, 100);
    });
  });
  describe("Bankトランザクション", () => {
    beforeEach(async () => {
      await tokenBank.transfer(addr1.address, 500);
      await tokenBank.transfer(addr2.address, 200);
      await tokenBank.transfer(addr3.address, 100);
      await tokenBank.connect(addr1).deposit(100);
      await tokenBank.connect(addr2).deposit(200);
    });
    it("トークン預入れが実行できるべき", async () => {
      const addr1Balance = await tokenBank.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(400);
      const add1BankBalance = await tokenBank.bankBalanceOf(addr1.address);
      expect(add1BankBalance).to.equal(100);
    });
    it("預入後にもトークンを移転できるべき", async () => {
      const startAddr1Balance = await tokenBank.balanceOf(addr1.address);
      const startAddr2Balance = await tokenBank.balanceOf(addr2.address);

      await tokenBank.connect(addr1).transfer(addr2.address, 100);

      const endAddr1Balance = await tokenBank.balanceOf(addr1.address);
      const endAddr2Balance = await tokenBank.balanceOf(addr2.address);

      expect(endAddr1Balance).to.equal(startAddr1Balance.sub(100));
      expect(endAddr2Balance).to.equal(startAddr2Balance.add(100));
    });
    it("預入後は'TokenDeposit'イベントが発行されるべき", async () => {
      expect(await tokenBank.connect(addr1).deposit(100))
      .emit(tokenBank, "TokenDeposit").withArgs(addr1.address, 100);
    });
  });
});
