
const hre = require("hardhat");

async function main() {
  console.log("Deploying ICXRegistry contract to Polygon Amoy testnet...");

  // Get the contract factory
  const ICXRegistry = await hre.ethers.getContractFactory("ICXRegistry");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

  // Deploy the contract
  const icxRegistry = await ICXRegistry.deploy(deployer.address);
  await icxRegistry.waitForDeployment();

  const contractAddress = await icxRegistry.getAddress();
  console.log("ICXRegistry deployed to:", contractAddress);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  console.log("Deployment completed successfully!");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);

  // Verify contract on Polygonscan (if not on hardhat network)
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await icxRegistry.deploymentTransaction().wait(5);

    console.log("Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [deployer.address],
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Contract verification failed:", error.message);
    }
  }

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
