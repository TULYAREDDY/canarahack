import { ethers } from "ethers";

export const CONTRACT_ADDRESS = "0x658c483FF3413A06ed269cDd9BACFB5193cfE960";
export const ABI = [
  "function isRegistered(bytes32) view returns (bool)",
  "function registerHoneytoken(bytes32,string)"
];
export const readProvider = new ethers.providers.JsonRpcProvider(
  "https://polygon-amoy.g.alchemy.com/v2/WFGXvnho95mScYkgqx65Y"
);
export const contractRead = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  readProvider
); 