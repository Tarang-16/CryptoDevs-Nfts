module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deployer } = await getNamedAccounts();
  const { log, deploy } = deployments;
  let cryptoDevs;
  const METADATA_URL = process.env.METADATA_URL;
  const WHITELIST_CONTRACT_ADDRESS = process.env.WHITELIST_CONTRACT_ADDRESS;

  args = [METADATA_URL, WHITELIST_CONTRACT_ADDRESS];

  cryptoDevs = await deploy("CryptoDevs", {
    from: deployer,
    log: true,
    args: args,
  });

  log(`CryptoDev deployed at ${cryptoDevs.address}`);
  log("-------------------------");
};

module.exports.tags = ["all", "main"];
