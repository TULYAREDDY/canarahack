const hre = require("hardhat");

async function main() {
  const Registry = await hre.ethers.getContractFactory("HoneytokenRegistry");

  // send the tx
  const registry = await Registry.deploy();

  // wait until it’s mined (v6 helper)
  await registry.waitForDeployment();

  // in ethers v6 use getAddress() (or .target in newer minor versions)
  const address = await registry.getAddress();

  console.log("✅  HoneytokenRegistry deployed to:", address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
