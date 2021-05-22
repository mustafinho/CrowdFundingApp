const Utils = artifacts.require('./Utils.sol')
const CrowdFunding = artifacts.require('./CrowdFunding.sol')
const TestCrowdFunding = artifacts.require('./TestCrowdFunding.sol')


module.exports = async (deployer) => {
        await deployer.deploy(Utils);
        deployer.link(Utils, CrowdFunding);
        deployer.link(Utils, TestCrowdFunding);
      };

