const hre = require("hardhat");

async function main() {
  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
  const contract = await CarbonCredit.deploy();

  await contract.deployed();

  console.log("Contract deployed at:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});