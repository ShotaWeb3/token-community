const fx = require("fs");
const memberNFTAddress = require("../memberNFTContract");

const main = async () => {
  const addr1 = "0x3d8C5B94b9564D3b0fE34C4dFe835Ffc64590bC6";
  const addr2 = "0xBfe218Dc04Ea875191F9284bFF9A4AC3157d1470";
  const addr3 = "0x1D298f5152e3687b8fF5E484E1dd1CBAa45a1bE7";
  const addr4 = "0x6965AE4e9600316f5898C873Bf439c33CB52113e";

  // デプロイ
  const TokenBank = await ethers.getContractFactory("TokenBank");
  const tokenBank = await TokenBank.deploy("TokenBank", "TBK", memberNFTAddress);
  await tokenBank.deployed();
  console.log(`Contract deployed to: https://sepolia.etherscan.io/address/${tokenBank.address}`);

  // トークンを移転する
  let tx = await tokenBank.transfer(addr2, 300);
  await tx.wait();
  console.log("transferred to addr2");
  tx = await tokenBank.transfer(addr3, 200);
  await tx.wait();
  console.log("transferred to addr3");
  tx = await tokenBank.transfer(addr4, 100);
  await tx.wait();
  console.log("transferred to addr4");

  // Verifyで読み込むargument.jsを生成
  fx.writeFileSync("./argument.js", 
  `
  module.exports = [
    "TokenBank",
    "TBK",
    "${memberNFTAddress}"
  ]
  `
  );

  //　フロントエンドアプリが読み込むcontract.jsを生成
  fx.writeFileSync("./contract.js", 
  `
  export const memberNFTAddress = "${memberNFTAddress}" 
  export const tokenBankAddress = "${tokenBank.address}" 
  `
  );

}

const tokenBankDeploy = async () => {
  try {
    await main();
    process.exit(0);
  } catch(err) {
    console.log(err);
    process.exit(1);
  }
}
tokenBankDeploy();
