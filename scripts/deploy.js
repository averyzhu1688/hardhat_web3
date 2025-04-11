//js 代码部署合约 FundMe.sol

//import ethers.js
//create main function
//execute main function

const { ethers } = require("hardhat") 

//async 非同步函数
async function main(){
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


    //使用js代码的方式调用合约函数实现转账交易
    //初始化两个账户:
    const [firstAccount,secondAccount] = await ethers.getSigners();

    //第一个账户调用fund
    const fundTx = await fundMe.connect(firstAccount).fund({value:ethers.parseEther("0.1")});
    await fundTx.wait();//等待交易成功

    //查看合约balance
    const balanceOfContract  = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of contract is ${balanceOfContract}`);

    //第二个账户调用fund
    const fundTxWithSecond = await fundMe.connect(secondAccount).fund({value:ethers.parseEther("0.1")});
    await fundTxWithSecond.wait();//等待交易成功

    //再次查看合约balance
    const balanceOfContractAfterSecend  = await ethers.provider.getBalance(fundMe.target)
    console.log(`Balance of contract is ${balanceOfContractAfterSecend}`);

    //查看合约fundersToAmount maping 数据情况
    const firstAcountBalanceInFundMe = await fundMe.fundersToAmount(firstAccount.address);
    const secendAcountBalanceInFundMe = await fundMe.fundersToAmount(secondAccount.address)
    console.log(`Balance of first account ${firstAccount.address} ${firstAcountBalanceInFundMe}`);
    console.log(`Balance of secend account ${secondAccount.address} ${secendAcountBalanceInFundMe}`);
}

async function verifyFundMe(fundMeAdds,args){
    //程序自动验证合约并上传合约代码到 etherscan sepoliya 网络中
    await hre.run("verify:verify", {
        address: fundMeAdds,
        constructorArguments: args,
      });
}

//执行main 函数
main().then().catch((error)=>{
    console.error(error)
    process.exit(1)
})