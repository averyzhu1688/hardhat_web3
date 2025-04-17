const { ethers,deployments, getNamedAccounts} = require("hardhat")
const {dev_chains} = require("../../help.hardhat.config")

//如果当前网络是sepolia 测试网络执行以下单元测试，否则跳过
dev_chains.includes(network.name)?describe.skip :
//集成测试
describe("staging test fundme contract",async function(){
    //合约变量
    let fundMe;
    //hardhat.config.js accounts[0] 个账户
    let firstAccount;

    //运行it 测试用例之前会先执行 beforeEach()
    beforeEach(async function(){
        await deployments.fixture(["fundme"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        fundMeDeploy = await deployments.get("FundMe")
        fundMe = await ethers.getContractAt("FundMe",fundMeDeploy.address)
    })

    //test fund and getFund successfully
    it("fund and getFund successfully",async function(){
        //make sure target reached
        await fundMe.fund({value: ethers.parseEther("0.5")}) //3000 * 0.5 = 1500
        //等待一段时间,让fundme合约窗口关闭(300秒)
        await new Promise(resolve => setTimeout(resolve,302 * 1000))
        //通过FundWithdrawByOwner event 日志检查达成的交易是否是 1eth
        //确保交易已经写到区块链上，需要做一些处理
        const getFundTx = fundMe.getFund();
        const getFundReceipt = getFundTx.wait();//等待区块交易成功并发回回执
        await expect(getFundReceipt).to.emit(fundMe,"FundWithdrawByOwner").withArgs(ethers.parseEther("0.5"));
    })
    //test fund and refund successfully
    it("fund and refund successfully",async function(){
        //make sure target not reached
        await fundMe.fund({value: ethers.parseEther("0.1")}) //3000 * 0.1 = 300
        //等待一段时间,让fundme合约窗口关闭(300秒)
        await new Promise(resolve => setTimeout(resolve,302 * 1000))
        //通过FundWithdrawByOwner event 日志检查达成的交易是否是 1eth
        //确保交易已经写到区块链上，需要做一些处理
        const refundTx = fundMe.refund();
        const refundReceipt = refundTx.wait();//等待区块交易成功并发回回执
        await expect(refundReceipt).to.emit(fundMe,"ReFundByFunder").withArgs(firstAccount,ethers.parseEther("0.1"));
    })
})