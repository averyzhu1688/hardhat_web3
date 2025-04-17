//常量配置文件

const DECIMAL = 8; //小数位数=8
const INITIAL_ANSWER = 300000000000; //usd 喂价
const LOCK_TIME = 300; //合约窗口时间秒
//本地网络
const dev_chains = ["hardhat","local"];

const networkConfig = {
    11155111:{//bnb-
        ethUsdDataFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
    },
    97:{//bnb-chain-test
        ethUsdDataFeed: "0x143db3CEEfbdfe5631aDD3E50f7614B6ba708BA7"
    }
}


module.exports = {
    DECIMAL,
    INITIAL_ANSWER,
    dev_chains,
    networkConfig,
    LOCK_TIME
}