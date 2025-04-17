// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

//这是一个众筹合约，要实现的功能如下：
//1. 创建一个收款函数
//2. 记录投资人并查看
//3. 在锁定期内，达到目标值，生产商可以提款
//4. 在锁定期内，没有达到目标值，投资人在锁定期后退款

contract FundMe{

    //记录投资人-投资金额
    mapping (address => uint256) public fundersToAmount;

    //设置众筹最小投资金额 (单位默认是WEI) //100USD
    uint256 constant MINIMUM_VALUE = 100 * 10 ** 18;

    AggregatorV3Interface public dataFeed;

    uint256 constant TARGET = 1000 * 10 ** 18;

    address public owner;

    //时间锁
    //从什么时候开始
    uint256 deploymentTimestamp;
    //锁定多久
    uint256 lockTime;

    address erc20Addr;
    //记录是否众筹结束并提款完成状态
    bool public getFundSuccess = false;

    event FundWithdrawByOwner(uint256);
    event ReFundByFunder(address,uint256);

    //构造函数2个参数，一个是众筹窗口时间秒，另外一个是dataFeed喂价获取usd 地址
    constructor(uint256 _lockTime,address dataFeedAddr){
        dataFeed = AggregatorV3Interface(dataFeedAddr);
        owner = msg.sender;
        deploymentTimestamp = block.timestamp; //部署合约成功的时间戳
        lockTime = _lockTime;
    }

    //可以变更owner
    function transferOwnership(address newOwner) public  onlyOwner{
        owner = newOwner;
    }

    //众筹收款函数
    function fund() external payable {
        require(convertEthToUsd(msg.value) >= MINIMUM_VALUE,"send more ETH");
        require(block.timestamp < deploymentTimestamp + lockTime,"window is closed");
        fundersToAmount[msg.sender] = msg.value;
    }

      /**
     * Returns the latest answer.
     */
    function getChainlinkDataFeedLatestAnswer() public view returns (int) {
        // prettier-ignore
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return answer;
    }

    function convertEthToUsd(uint256 ethAmount) internal view returns(uint256){
        uint256 ethPrice = uint256(getChainlinkDataFeedLatestAnswer());
       return ethAmount * ethPrice/(10 ** 8);
    }

    //众筹达成目标结束后提款函数
    function getFund() external onlyOwner windowClosed{
        require(convertEthToUsd(address(this).balance) >= TARGET,"Target is not reached");    
        //从智能合约余额转账给调用者,实现方式有三种
        //1. transfer
       // payable(msg.sender).transfer(address(this).balance);
        //2. send
       // bool success = payable(msg.sender).send(address(this).balance);
        //require(success,"tx failed");
        //3. call 
        bool resState;
        uint256 balance = address(this).balance;
        (resState,) = payable(msg.sender).call{value: balance}("");
        require(resState,"tx failed");
        getFundSuccess = true;

        //记录日志
        emit FundWithdrawByOwner(balance);
    }

    //修改mapping 对应地址的余额
    function setFunderToAmount(address funder,uint256 amountToUpdate) external  {
        require(msg.sender == erc20Addr,"you do not perimiss to call this function");
        fundersToAmount[funder] = amountToUpdate;
    }

    //修改erc20地址
    function setErc20Addr(address _erc20Addr)public onlyOwner{
        erc20Addr = _erc20Addr;
    }

    //众筹时间窗口关闭，筹款没有达到预期，退款函数
    function refund() external windowClosed{
        require(convertEthToUsd(address(this).balance) < TARGET,"Target is reached");
        
        uint256 amount = fundersToAmount[msg.sender];
        require(amount != 0,"there is not fund for you");
        bool resState;
        uint256 fundAmount = fundersToAmount[msg.sender];
        (resState,) = payable(msg.sender).call{value: fundAmount}("");
        require(resState,"tx failed");
        fundersToAmount[msg.sender] = 0;
        emit ReFundByFunder(msg.sender,fundAmount);
    }

    //筹款窗口关闭 修饰器
    modifier windowClosed(){
        require(block.timestamp >= deploymentTimestamp + lockTime,"window is not closed");
        _;
    }

    modifier onlyOwner(){
        require(msg.sender == owner,"this function can only be called by owner");
        _;
    }
}
