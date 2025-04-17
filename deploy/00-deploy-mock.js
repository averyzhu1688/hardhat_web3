
const {DECIMAL,INITIAL_ANSWER} = require("../help.hardhat.config")
const {dev_chains} = require("../help.hardhat.config")
//mock 合约部署
module.exports = async ({getNamedAccounts, deployments}) => {
    const {firstAccount} = await getNamedAccounts();
    const {deploy} = deployments;
    console.log(`the first account address is ${firstAccount}`)

    if(dev_chains.includes(network.name)){
        console.log("begin deploy mock contract .....")
        //部署MockV3Aggregator 合约
        await deploy("MockV3Aggregator",{
            from: firstAccount,
            args: [DECIMAL,INITIAL_ANSWER],
            log: true
        })
    }else{
        console.log("environment is not local,mock contract deployment skiped!")
    }
}

//增加tag
module.exports.tags = ["mockV3Aggregator"]