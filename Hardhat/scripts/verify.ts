import { ethers } from "hardhat";
import hre from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

// Compiler settings matching hardhat.config.ts (0.8.28, optimizer, no viaIR)
function getCompilerSettings() {
  return {
    version: "0.8.28",
    optimizationEnabled: true,
    optimizationRuns: 200,
    viaIR: false,
  };
}

function getExplorerUrl(networkName: string, address: string): string {
  const urls: Record<string, string> = {
    baseSepolia: "https://sepolia.basescan.org",
    base: "https://basescan.org",
    arbitrum: "https://arbiscan.io",
    arbitrumSepolia: "https://sepolia.arbiscan.io",
    optimism: "https://optimistic.etherscan.io",
    optimismSepolia: "https://sepolia-optimism.etherscan.io",
    polygon: "https://polygonscan.com",
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    monadTestnet: "https://testnet.monadscan.com",
    monadMainnet: "https://monadscan.com",
  };
  const base = urls[networkName] || "https://etherscan.io";
  return `${base}/address/${address}`;
}

function checksumAddress(address: string): string {
  try {
    return ethers.getAddress(address.toLowerCase());
  } catch (error) {
    throw new Error(`Invalid address format: ${address}. Error: ${error}`);
  }
}

async function verifyContract(
  name: string,
  address: string,
  constructorArgs: any[] = [],
  log: (msg: string) => void = console.log
): Promise<boolean> {
  try {
    log(`\n🚀 Verifying ${name}...`);
    await hre.run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    log(`✅ ${name} verified successfully!`);
    log(`🔗 ${getExplorerUrl(hre.network.name, address)}`);
    return true;
  } catch (error: any) {
    if (error.message?.includes("Already Verified")) {
      log(`✅ ${name} is already verified!`);
      log(`🔗 ${getExplorerUrl(hre.network.name, address)}`);
      return true;
    }
    log(`❌ ${name} verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("\n=== 🔍 Contract Verification (matches deploy script) ===\n");

  const networkName = hre.network.name;
  console.log(`Network: ${networkName}`);

  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("❌ ETHERSCAN_API_KEY not found in .env");
    console.error("Get your API key from: https://etherscan.io/apis");
    process.exit(1);
  }

  const deploymentsDir = path.join(__dirname, "..", "deployments", networkName);
  if (!fs.existsSync(deploymentsDir)) {
    console.error(`❌ No deployments found for ${networkName}`);
    console.error("Run: npx hardhat deploy --network " + networkName);
    process.exit(1);
  }

  function readArtifact(contractName: string): { address: string; data: any } | null {
    const p = path.join(deploymentsDir, `${contractName}.json`);
    if (!fs.existsSync(p)) return null;
    try {
      const data = JSON.parse(fs.readFileSync(p, "utf8"));
      return { address: data.address, data };
    } catch {
      return null;
    }
  }

  // --- VWAPDemo (no constructor args) ---
  const vwapDemo = readArtifact("VWAPDemo");
  if (vwapDemo) {
    await verifyContract("VWAPDemo", vwapDemo.address, []);
  } else {
    console.log("\n⏭️  Skipping VWAPDemo (no deployment artifact)");
  }

  // --- AgentTreasury (no constructor args) ---
  const agentTreasury = readArtifact("AgentTreasury");
  if (agentTreasury) {
    await verifyContract("AgentTreasury", agentTreasury.address, []);
  } else {
    console.log("\n⏭️  Skipping AgentTreasury (no deployment artifact)");
  }

  // --- ReputationRegistry (no constructor args) ---
  const reputationRegistry = readArtifact("ReputationRegistry");
  if (reputationRegistry) {
    await verifyContract("ReputationRegistry", reputationRegistry.address, []);
  } else {
    console.log("\n⏭️  Skipping ReputationRegistry (no deployment artifact)");
  }

  // --- GridBank (usdc, oracle) ---
  const gridBank = readArtifact("GridBank");
  if (gridBank) {
    let args = gridBank.data.args;
    if (!args || args.length === 0) {
      const usdcRaw = process.env.USDC;
      const gridOracleRaw = process.env.GRID_ORACLE;
      if (!usdcRaw) {
        console.error("\n❌ USDC required in .env to verify GridBank (no args in artifact)");
      } else {
        const usdc = checksumAddress(usdcRaw);
        const oracle = gridOracleRaw ? checksumAddress(gridOracleRaw) : (await hre.getNamedAccounts()).deployer;
        args = [usdc, oracle];
        await verifyContract("GridBank", gridBank.address, args);
      }
    } else {
      await verifyContract("GridBank", gridBank.address, args);
    }
  } else {
    console.log("\n⏭️  Skipping GridBank (no deployment artifact)");
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Verification run completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
