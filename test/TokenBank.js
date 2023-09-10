const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenBankコントラクト", () => {
  let MemberNFT;
  let memberNFT;
  const tokenURI1 = "hoge1";
  const tokenURI2 = "hoge2";
  const tokenURI3 = "hoge3";
  const tokenURI4 = "hoge4";
  const tokenURI5 = "hoge5";

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
    MemberNFT = await ethers.getContractFactory("MemberNFT");
    memberNFT = await MemberNFT.deploy();
    await memberNFT.deployed();
    await memberNFT.nftMint(owner.address, tokenURI1);
    await memberNFT.nftMint(addr1.address, tokenURI2);
    await memberNFT.nftMint(addr1.address, tokenURI3);
    await memberNFT.nftMint(addr2.address, tokenURI4);

    TokenBank = await ethers.getContractFactory("TokenBank");
    tokenBank = await TokenBank.deploy(name, symbol, memberNFT.address);
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
    it("トークン引出しが実行できるべき", async () => {
      const startBankBalance = await tokenBank.connect(addr1).bankBalanceOf(addr1.address);
      const startTotalBankBalance = await tokenBank.connect(addr1).bankTotalDeposit();

      await tokenBank.connect(addr1).withdraw(100);

      const endBankBalance = await tokenBank.connect(addr1).bankBalanceOf(addr1.address);
      const endTotalBankBalance = await tokenBank.connect(addr1).bankTotalDeposit();
      expect(endBankBalance).to.equal(startBankBalance.sub(100));
      expect(endTotalBankBalance).to.equal(startTotalBankBalance.sub(100));

    });
    it("預入トークンが不足していた場合、引出し後には失敗するべき", async () => {
      await expect(tokenBank.connect(addr1).withdraw(101))
      .to.be.revertedWith("An amount greater than your tokenBank balance!");
    });
    it("引出し後には'TokenWithDraw'イベントが発行されるべき", async () => {
      expect(await tokenBank.connect(addr1).withdraw(100))
      .emit(tokenBank, "TokenWithdraw").withArgs(addr1.address, 100);
    });
    it("オーナーによる預入は失敗すべき", async () => {
      await expect(tokenBank.deposit(1))
      .to.be.revertedWith("Owner cannot execute");
    });
    it("オーナーによる引出しは失敗すべき", async () => {
      await expect(tokenBank.withdraw(1))
      .to.be.revertedWith("Owner cannot execute");
    });
    it("トータル預入トークン数より大きな数はオーナーであっても移転に失敗すべき", async () => {
      await expect(tokenBank.transfer(addr1.address, 201))
      .to.be.revertedWith("Amounts gretter than the total supply cannot be transferred");
    });
    it("NFTメンバー以外の移転は失敗すべき", async () => {
      await expect(tokenBank.connect(addr3).transfer(addr1.address, 100))
      .to.be.revertedWith("not NFT member");
    });
    it("NFTメンバー以外の預入は失敗すべき", async () => {
      await expect(tokenBank.connect(addr3).deposit(1))
      .to.be.revertedWith("not NFT member");
    });
    it("NFTメンバー以外の引出しは失敗すべき", async () => {
      await expect(tokenBank.connect(addr3).withdraw(1))
      .to.be.revertedWith("not NFT member");
    });
  });
});
