const { ethers,deployments, getNamedAccounts, network} = require("hardhat")
const {assert,expect} = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const {dev_chains} = require("../../help.hardhat.config")

//如果当前网络是本地网络执行以下单元测试，否则跳过
!dev_chains.includes(network.name)?describe.skip :
//单元测试
describe("test fundme contract",async function(){
    //合约变量
    let fundMe;
    let fundMeSecendAccount;
    //hardhat.config.js accounts[0] 个账户
    let firstAccount;
    let secendAccount;
    let mockDataFeedContract;


    //运行it 测试用例之前会先执行 beforeEach()
    beforeEach(async function(){
        //部署mockV3Aggregator，fundme合约
        await deployments.fixture(["mockV3Aggregator","fundme"]);
        firstAccount = (await getNamedAccounts()).firstAccount;
        secendAccount = (await getNamedAccounts()).secendAccount;

        //获取Fundme合约对象
        fundMeDeploy = await deployments.get("FundMe")

        //获取MockV3Aggregator合约
        mockDataFeedContract = await deployments.get("MockV3Aggregator")
        //获取合约
        fundMe = await ethers.getContractAt("FundMe",fundMeDeploy.address)

        //通过第二个账户生成另一个合约
        fundMeSecendAccount =  await ethers.getContract("FundMe",secendAccount)
    })

    //测试FundMe合约构造函数有没有正常调用-测试逻辑查看owner 是否被正确赋值
    it("test if the owner is msg.sender",async function (){
        await fundMe.waitForDeployment();
        //测试fundMe 构造函数有没有初始化 owner = msg.sender
        assert.equal(await fundMe.owner(),firstAccount)

    })

    //测试dataFeed 变量值是否被正确赋值 
    it("test if the dataFeed assigned correctly",async function (){
        await fundMe.waitForDeployment();
        //测试fundMe 构造函数有没有初始化 owner = msg.sender
        assert.equal(await fundMe.dataFeed(),mockDataFeedContract.address)

    })
    //测试dataFeed 变量值是否被正确赋值 
    it("test if the dataFeed assigned correctly by expect",async function (){
        await fundMe.waitForDeployment();
        //测试fundMe 构造函数有没有初始化 owner = msg.sender
        //expect.equal(await fundMe.dataFeed(),"0x694AA1769357215DE4FAC081bf1f309aDC325306")
        expect(await fundMe.dataFeed()).to.equal(mockDataFeedContract.address);
    })

    //编写单元测试: fund,getFund,refund


    //fund函数单元测试,验证需要写三个测试用例: 1. window open; 2. value grater than minimum; 3. funder balance
    //1.
    it("window closed,value grater than minimum,fund failed",async function () {
        //make sure the window is closed
        await helpers.time.increase(350)
        await helpers.mine()
        //验证非法操作有没有被拦住
        expect(fundMe.fund({value: ethers.parseEther("0.1")})).to.be.revertedWith("window is closed")
    })
    //2.
    it("window open,value is less than minimum, fund failed",async function(){
        //失败时与收到的消息对比 revertedWith 
        //验证非法操作有没有被拦住
        expect(fundMe.fund({value: ethers.parseEther("0.01")})).to.be.revertedWith("send more ETH")
    })
    //3.
    it("window open,value is greater minimum ,fund success",async function(){
        await fundMe.fund({value: ethers.parseEther("0.1")})
        const balance = await fundMe.fundersToAmount(firstAccount)
        expect(balance).to.equal(ethers.parseEther("0.1"))
    })

    //getFund函数单元测试
    //only owner,window closed,target reached
    it("not owner,window closed,target reached,getFund failed",async function(){
        //达成筹款目标，支付超过 target 目标
        await fundMe.fund({value: ethers.parseEther("1")})
        //确保窗口关闭
        await helpers.time.increase(350)
        await helpers.mine()
        //非owner 调用 getFund
        //验证非法操作有没有被拦住
        await expect(fundMeSecendAccount.getFund()).to.be.revertedWith("this function can only be called by owner")
    })
    it("window open,target reached,getFund failed",async function(){
        await fundMe.fund({value: ethers.parseEther("1")})
        //验证非法操作有没有被拦住
        await expect(fundMe.getFund()).to.be.revertedWith("window is not closed")
    })
    it("window closed,target not reached,getFund failed",async function(){
        //达成筹款目标，支付超过 target 目标
        await fundMe.fund({value: ethers.parseEther("0.3")})
        //确保窗口关闭
        await helpers.time.increase(350)
        await helpers.mine()
        //验证非法操作有没有被拦住
        await expect(fundMe.getFund()).to.be.revertedWith("Target is not reached")
    })
    it("window closed,target reached,getFund successfully",async function(){
        //达成筹款目标，支付超过 target 目标
        await fundMe.fund({value: ethers.parseEther("1")})
        //确保窗口关闭
        await helpers.time.increase(350)
        await helpers.mine()

        //通过FundWithdrawByOwner event 日志检查达成的交易是否是 1eth
        await expect(fundMe.getFund()).to.emit(fundMe,"FundWithdrawByOwner").withArgs(ethers.parseEther("1"));
    })


    //refund函数单元测试
    //window closed,target not reached,funder has balance
    it("window open,target not reached,funder has balance",async function(){
        //目标没有达成
        await fundMe.fund({value: ethers.parseEther("0.1")})
        //验证非法操作有没有被拦住
        await expect(fundMe.refund()).to.be.revertedWith("window is not closed")
    })
    it("window closed,target reached,under has balance",async function(){
         //达成筹款目标，支付超过 target 目标
         await fundMe.fund({value: ethers.parseEther("1")})
          //确保窗口关闭
          await helpers.time.increase(350)
          await helpers.mine()
        //验证非法操作有没有被拦住
          await expect(fundMe.refund()).to.be.revertedWith("Target is reached")
    })
    it("window closed,target not reached,under has not balance",async function(){
        //目标没有达成
        await fundMe.fund({value: ethers.parseEther("0.1")})
         //确保窗口关闭
         await helpers.time.increase(350)
         await helpers.mine()
         //验证非法操作有没有被拦住
         await expect(fundMeSecendAccount.refund()).to.be.revertedWith("there is not fund for you")
   })

   it("window closed,target not reached,under has balance",async function(){
    //目标没有达成
    await fundMe.fund({value: ethers.parseEther("0.1")})
     //确保窗口关闭
     await helpers.time.increase(350)
     await helpers.mine()
     await expect(fundMe.refund()).to.emit(fundMe,"ReFundByFunder").withArgs(firstAccount,ethers.parseEther("0.1"))
})
})