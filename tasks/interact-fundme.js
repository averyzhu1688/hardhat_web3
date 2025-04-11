//const { ethers } = require("hardhat");
const {task} = require("hardhat/config");

//自定义任务-interact-fundme 调用合约函数
task("interact-fundme","interact fundme contract")
    .addParam("addr","fundme contract address")
    .setAction(async(taskArgs,hre) => {

    const fundMeFactory = await ethers.getContractFactory("FundMe");
    //fundMeFactory包含合约FundMe的所有信息，调用attach 将参数taskArgs.addr 贴到fundMeFactory 包含的合约上
    const fundMe = fundMeFactory.attach(taskArgs.addr);


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
})

module.exports = {}