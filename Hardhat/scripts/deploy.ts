import { ethers } from "hardhat";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  // Get configuration from environment variables
  const usdc = process.env.USDC;
  const feeRecipient = process.env.FEE_RECIPIENT;
  const feeBps = parseInt(process.env.FEE_BPS || "100");
  const gelatoOperator = process.env.GELATO_OPERATOR;
  const royaltyReceiver = process.env.ROYALTY_RECEIVER || deployer.address;
  const royaltyBps = parseInt(process.env.ROYALTY_BPS || "250"); // 2.5% default

  // Validate required environment variables
  if (!usdc || !feeRecipient || !gelatoOperator) {
    throw new Error(
      "Missing required environment variables. Please check your .env file."
    );
  }

  // Deploy RwaAssetNFT first
  console.log("Deploying RwaAssetNFT...");
  const RwaAssetNFT = await ethers.getContractFactory("RwaAssetNFT");
  const rwaAssetNFT = await RwaAssetNFT.deploy(
    "Rafflemint RWA Asset NFT", // name
    "RMNFT", // symbol
    deployer.address, // initialMinter (deployer)
    royaltyReceiver, // initialRoyaltyReceiver
    royaltyBps // initialRoyaltyBps
  );
  await rwaAssetNFT.waitForDeployment();
  const rwaAssetNFTAddress = await rwaAssetNFT.getAddress();
  console.log("RwaAssetNFT deployed to:", rwaAssetNFTAddress);

  // Deploy NFTRaffleVRF
  console.log("Deploying NFTRaffleVRF...");
  const NFTRaffleVRF = await ethers.getContractFactory("NFTRaffleVRF");
  const nftRaffleVRF = await NFTRaffleVRF.deploy(
    usdc,
    feeRecipient,
    feeBps,
    gelatoOperator
  );
  await nftRaffleVRF.waitForDeployment();
  const nftRaffleVRFAddress = await nftRaffleVRF.getAddress();
  console.log("NFTRaffleVRF deployed to:", nftRaffleVRFAddress);

  // Log deployment summary
  console.log("\n=== Deployment Summary ===");
  console.log(`RwaAssetNFT: ${rwaAssetNFTAddress}`);
  console.log(`NFTRaffleVRF: ${nftRaffleVRFAddress}`);
  console.log(`Deployer: ${deployer.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
