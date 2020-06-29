const BSV = require('bsv') //引用bsv库
const MatterCloud = require('mattercloudjs') //引用MatterCloud库

const MatterCloudAPIKey = "CeJg9E1uuVJueBoJg6fkD5f5u7jBv4k7jj4cr6mmo8UTMzuqbq8Muzp3aXYTZ6bTh" //MatterCloud API Key
const matterAPI = MatterCloud.instance({
    api_key: MatterCloudAPIKey, 
})

let priKeyHex = "79f5876834b1e179de0112fd150e3170259fc2863328bb39a3f6f07403686158" //钱包私钥

let receiverAddresss = "1FjdJzaGXiUKQjnPBiTXqbuTPZMwypfoPC" //收款地址
let value = 9000 //收款金额（单位：Sat）

async function main() {

    let priKey = BSV.PrivateKey.fromHex(priKeyHex) //组装私钥
    let address = priKey.toAddress() //获取自己钱包的地址

    //获取锁定在钱包地址上的所有UTXO
    await matterAPI.getUtxos(address).then(async utxos => {

        let newTx = new BSV.Transaction() //创建一个transaction

        newTx.feePerKb(600) //设置手续费率为 0.6 Sat/Byte。 FIXME: 最终得到的tx的手续费和这里设置的不一致，原因不明
        //不同服务商的费率不同，经测试MatterCloud的广播API至少要 0.5 Sat/Byte。

        //将所有UTXO全部填入transaction的输入端（这是一种无脑做法，优秀的钱包应该智能地选择UTXO）
        let inputs = []
        utxos.forEach(utxo => {
            inputs.push(utxo)
        });
        newTx.from(inputs)

        //将收款地址对应的P2PKH输出添加到transaction的输出端
        let output = BSV.Transaction.Output({
            satoshis: value,
            script: BSV.Script.fromAddress(receiverAddresss)
        })
        newTx.addOutput(output)

        newTx.change(address) //将自己的地址设置为找零地址

        newTx.sign(priKey) //用私钥给transaction签署

        //生成16进制的transaction原数据，并输出，你可以用其他服务商来广播transaction
        let rawTx = newTx.toBuffer().toString('hex')
        console.log('RawTx:')
        console.log(rawTx)

        //用MatterCloud服务商广播transaction
        await matterAPI.sendRawTx(rawTx).then(res => {

            console.log('发送transaction成功:')
            console.log(res) //输出广播transaction的结果，包含txid

        }).catch(e => {
            console.error(e)
        })
    })
}

main()