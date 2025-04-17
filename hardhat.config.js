require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("@nomicfoundation/hardhat-verify");
require("./tasks")

require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy");
require("hardhat-deploy-ethers");


const SEPOLIYA_URL = process.env.SEPOLIA_URL;
const PRIVATE_KEY_01 = process.env.PRIVATE_KEY_01;
const PRIVATE_KEY_02 = process.env.PRIVATE_KEY_02;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "hardhat",
  mocha:{
    timeout: 300000
  },
  networks:{
    sepolia:{
      //Alchemy,Infura,QuickNode
      url:SEPOLIYA_URL,
      accounts: [PRIVATE_KEY_01,PRIVATE_KEY_02],
      chainId: 11155111
    }
  },
  etherscan:{
    apiKey: {
      sepolia: ETHERSCAN_API_KEY
    }
  },
  //通过名字的方式获取sepolia.accounts[PRIVATE_KEY_01,PRIVATE_KEY_02] 索引下标的值
  namedAccounts:{
    firstAccount:{
      default:0
    },
    secendAccount:{
      default:1
    }
  }
};
