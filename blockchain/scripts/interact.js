const hre = require("hardhat");
const ethers = hre.ethers;
const { keccak256, toUtf8Bytes } = require("ethers");

async function main() {
  const contractAddress = "0x658c483FF3413A06ed269cDd9BACFB5193cfE960";
  const HoneytokenRegistry = await ethers.getContractAt("HoneytokenRegistry", contractAddress);

  const hashInput = "honeypot-001";
  const sampleHash = keccak256(toUtf8Bytes(hashInput));
  const metadata = "Test token trap for attacker ID 001";

  const tx = await HoneytokenRegistry.registerHoneytoken(sampleHash, metadata);
  await tx.wait();

  console.log("✅ Honeytoken registered for:", hashInput);

  const result = await HoneytokenRegistry.isRegistered(sampleHash);
  console.log("🔍 Is honeytoken registered?", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
