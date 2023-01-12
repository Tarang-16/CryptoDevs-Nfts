const { ethers, network } = require("hardhat");
const fs = require("fs");

FRONT_END_ABI_FILE = "../frontend/constants/abi.json";
FRONT_END_ADDRESSES_FILE = "../frontend/constants/contractAddresses.json";

module.exports = async function () {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating front end......");
    await updateContractAddresses();
    await updateAbi();
    console.log("front-end updated");
  }
};

async function updateAbi() {
  const cryptoDevs = await ethers.getContract("CryptoDevs");
  fs.writeFileSync(
    FRONT_END_ABI_FILE,
    cryptoDevs.interface.format(ethers.utils.FormatTypes.json)
  );
  console.log("hu");
}

async function updateContractAddresses() {
  const cryptoDevs = await ethers.getContract("CryptoDevs");
  const chainId = network.config.chainId.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(FRONT_END_ADDRESSES_FILE, "utf8")
  );
  if (chainId in currentAddresses) {
    if (!currentAddresses[chainId].includes(cryptoDevs.address)) {
      currentAddresses[chainId].push(cryptoDevs.address);
      console.log("hi");
    }
  }
  {
    currentAddresses[chainId] = [cryptoDevs.address]; // if chainId is not present
  }
  fs.writeFileSync(FRONT_END_ADDRESSES_FILE, JSON.stringify(currentAddresses));
}

module.exports.tags = ["all", "frontend"];
