const { network } = require("hardhat");
const {dev_chains,networkConfig,LOCK_TIME} = require("../help.hardhat.config")

//声明并导出一个匿名异步函数, 可以被其他js  require() 引用
module.exports = async ({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts();
    const {deploy} = deployments;
    console.log(`the first account address is ${firstAccount}`)


    let dataFeedAddr;
    let confirmations;
    if(dev_chains.includes(network.name)){
        //如果是本地网络，则获取mock合约对象
        const mockDataFeedContract = await deployments.get("MockV3Aggregator");
        dataFeedAddr = mockDataFeedContract.address;
        confirmations = 0;
        console.log("mock contract address is " + mockDataFeedContract.address)
    }else{
        //sepolia 测试网络
        dataFeedAddr = networkConfig[network.config.chainId].ethUsdDataFeed;
        confirmations = 5;
    }
 
    //部署FundMe 合约
    const fundMe = await deploy("FundMe",{
        from: firstAccount,
        args: [LOCK_TIME,dataFeedAddr],
        log: true,
        waitConfirmations:confirmations//等待多少个区块
    })

    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        //程序自动验证合约并上传合约代码到 etherscan sepoliya 网络中
        await hre.run("verify:verify", {
            address: fundMe.address,
            constructorArguments: [LOCK_TIME,dataFeedAddr],
        });
    }else{
        console.log("Network is not sepolia,verifycation skiped!")
    }
}

//增加tag
module.exports.tags = ["fundme"]