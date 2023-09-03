const fx = require("fs");

const main = async () => {
  const addr1 = "0x3d8C5B94b9564D3b0fE34C4dFe835Ffc64590bC6";
  const addr2 = "0xBfe218Dc04Ea875191F9284bFF9A4AC3157d1470";
  const addr3 = "0x1D298f5152e3687b8fF5E484E1dd1CBAa45a1bE7";

  const tokenURI1 = "ipfs://bafybeigyod7ldrnytkzrw45gw2tjksdct6qaxnsc7jdihegpnk2kskpt7a/metadata1.json";
  const tokenURI2 = "ipfs://bafybeigyod7ldrnytkzrw45gw2tjksdct6qaxnsc7jdihegpnk2kskpt7a/metadata2.json";
  const tokenURI3 = "ipfs://bafybeigyod7ldrnytkzrw45gw2tjksdct6qaxnsc7jdihegpnk2kskpt7a/metadata3.json";
  const tokenURI4 = "ipfs://bafybeigyod7ldrnytkzrw45gw2tjksdct6qaxnsc7jdihegpnk2kskpt7a/metadata4.json";
  const tokenURI5 = "ipfs://bafybeigyod7ldrnytkzrw45gw2tjksdct6qaxnsc7jdihegpnk2kskpt7a/metadata5.json";

  // デプロイ
  const MemberNFT = await ethers.getContractFactory("MemberNFT");
  const memberNFT = await MemberNFT.deploy();
  await memberNFT.deployed();

  console.log(`Contract deployed to: https://sepolia.etherscan.io/address/${memberNFT.address}`);

  // NFTをMintする
  let tx = await memberNFT.nftMint(addr1, tokenURI1);
  await tx.wait();
  console.log("NFT#1 minted...");

  tx = await memberNFT.nftMint(addr1, tokenURI2);
  await tx.wait();
  console.log("NFT#2 minted...");

  tx = await memberNFT.nftMint(addr2, tokenURI3);
  await tx.wait();
  console.log("NFT#3 minted...");

  tx = await memberNFT.nftMint(addr2, tokenURI4);
  await tx.wait();
  console.log("NFT#4 minted...");

  //コントラクトアドレスの書き出し
  fx.writeFileSync("./memberNFTContract.js", 
  `
  module.exports = "${memberNFT.address}" 
  `
  )
}

const memberNFTDeploy = async () => {
  try {
    await main();
    process.exit(0);
  } catch(err) {
    console.log(err);
    process.exit(1);
  }
}

memberNFTDeploy();
