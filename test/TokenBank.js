const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenBankコントラクト", () => {
  let TokenBank;
  let tokenBank;
  const name = "Token";
  const symbol = "Tbk";
  let owner;

  beforeEach(async () => {
    [owner] = await ethers.getSigners();
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
  });
});
