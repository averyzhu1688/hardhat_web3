const {task} = require("hardhat/config");

//自定义任务-deploy-fundme 部署合约并验证合约
task("deploy-fundme","deploy and verify fundme contract").setAction(async(taskArgs,hre) => {
    //create factory
    const fundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("contract deploying")
    // deploy contract from factory
    const fundMe = await fundMeFactory.deploy(300)
    await fundMe.waitForDeployment()
    console.log(`contract has been deployed successfully, contract address is ${fundMe.target}`);


    //等待合约部署到区块链上，等待5个区块后，再执行后面的操作,可能需要点时间
    // await fundMe.deploymentTransaction.wait(5);
    //console.log("Waiting for 5 confirmations")
    //验证合约并将合约代码上传至 etherscan 区块链网络
    // await verifyFunMe(fundMe.target,[10]);
    
    if(hre.network.config.chainId == 11155111 && process.env.ETHERSCAN_API_KEY){
        //如果配置的 chainId 是 11155111 并且 etherscan api key 已配置并存在，则执行sepolia 测试网络验证合约
        console.log("Waiting for 5 confirmations")
        await fundMe.deploymentTransaction().wait(5) 
        await verifyFundMe(fundMe.target, [300])
    }else{
        console.log("verifycation skiped.....")
    }
})

async function verifyFundMe(fundMeAdds,args){
    //程序自动验证合约并上传合约代码到 etherscan sepoliya 网络中
    await hre.run("verify:verify", {
        address: fundMeAdds,
        constructorArguments: args,
      });
}

//导出
module.exports = {}