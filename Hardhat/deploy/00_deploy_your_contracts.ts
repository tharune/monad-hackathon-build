import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;
  const { ethers } = hre;

  const provider = ethers.provider;
  const feeData = await provider.getFeeData();
  const currentGasPrice = feeData.gasPrice || BigInt("1000000000");
  const gasPriceWithBuffer =
    (currentGasPrice * BigInt(120)) / BigInt(100);
  log(
    `Using gas price: ${gasPriceWithBuffer.toString()} wei (${(
      Number(gasPriceWithBuffer) / 1e9
    ).toFixed(2)} gwei) with 20% buffer`
  );

  // Deploy MockERC20 (test token pair)
  log("Deploying MockERC20...");
  const mockERC20 = await deploy("MockERC20", {
    from: deployer,
    args: ["Mock USDC", "mUSDC"],
    gasPrice: gasPriceWithBuffer.toString(),
    log: true,
    waitConfirmations: 2,
  });
  log(`MockERC20 deployed at ${mockERC20.address}`);

  // Deploy SimpleAMM (DEX for price discovery)
  log("Deploying SimpleAMM...");
  const simpleAMM = await deploy("SimpleAMM", {
    from: deployer,
    args: [],
    gasPrice: gasPriceWithBuffer.toString(),
    log: true,
    waitConfirmations: 2,
  });
  log(`SimpleAMM deployed at ${simpleAMM.address}`);

  // Deploy VWAPDemo (proof-of-concept slicing)
  log("Deploying VWAPDemo...");
  const vwapDemo = await deploy("VWAPDemo", {
    from: deployer,
    args: [],
    gasPrice: gasPriceWithBuffer.toString(),
    log: true,
    waitConfirmations: 2,
  });
  log(`VWAPDemo deployed at ${vwapDemo.address}`);

  // Deploy VWAPEngine (production engine with DEX integration)
  log("Deploying VWAPEngine...");
  const vwapEngine = await deploy("VWAPEngine", {
    from: deployer,
    args: [],
    gasPrice: gasPriceWithBuffer.toString(),
    log: true,
    waitConfirmations: 2,
  });
  log(`VWAPEngine deployed at ${vwapEngine.address}`);

  log("=== Deployment Summary ===");
  log(`MockERC20:   ${mockERC20.address}`);
  log(`SimpleAMM:   ${simpleAMM.address}`);
  log(`VWAPDemo:    ${vwapDemo.address}`);
  log(`VWAPEngine:  ${vwapEngine.address}`);
  log("=========================");
};

export default deployContracts;
deployContracts.tags = ["MockERC20", "SimpleAMM", "VWAPDemo", "VWAPEngine"];
