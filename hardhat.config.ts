import { defineConfig } from "hardhat/config";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  solidity: "0.8.20",
  plugins: [hardhatEthers],
  networks: {
    hardhat: {
      type: "edr-simulated",
      chainType: "l1",
    },
  },
});
