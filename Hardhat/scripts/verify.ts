import hre from "hardhat";
import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

function getExplorerUrl(networkName: string, address: string): string {
  const urls: Record<string, string> = {
    baseSepolia: "https://sepolia.basescan.org",
    base: "https://basescan.org",
    monadTestnet: "https://testnet.monadscan.com",
    monadMainnet: "https://monadscan.com",
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
  };
  const base = urls[networkName] || "https://etherscan.io";
  return `${base}/address/${address}`;
}

async function verifyContract(
  name: string,
  address: string,
  constructorArgs: any[] = [],
): Promise<boolean> {
  try {
    console.log(`\nVerifying ${name}...`);
    await hre.run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log(`${name} verified: ${getExplorerUrl(hre.network.name, address)}`);
    return true;
  } catch (error: any) {
    if (error.message?.includes("Already Verified")) {
      console.log(`${name} already verified: ${getExplorerUrl(hre.network.name, address)}`);
      return true;
    }
    console.log(`${name} verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("\n=== Contract Verification ===\n");
  console.log(`Network: ${hre.network.name}`);

  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("ETHERSCAN_API_KEY not found in .env");
    process.exit(1);
  }

  const deploymentsDir = path.join(__dirname, "..", "deployments", hre.network.name);
  if (!fs.existsSync(deploymentsDir)) {
    console.error(`No deployments found for ${hre.network.name}`);
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

  const contracts = ["VWAPDemo", "VWAPEngine", "SimpleAMM", "MockERC20"];

  for (const name of contracts) {
    const artifact = readArtifact(name);
    if (artifact) {
      const args = artifact.data.args || [];
      await verifyContract(name, artifact.address, args);
    } else {
      console.log(`\nSkipping ${name} (no deployment artifact)`);
    }
  }

  console.log("\nVerification complete.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
