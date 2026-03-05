import transactionModel from "../models/transaction.model"

async function createTransaction(req , res){

    /**
     * 1. Validated the request
     */
    const {fromAccount , toAccount , amount , idempotencyKey} = req.body
    
    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
      return  res.status(400).json({
            message: "fromAccount , toAccount , amount and idempotencyKey are required fields"

        })

    }
    const fromUserAccount = await accountModel.findById({_id: fromAccount})
    const toUserAccount = await accountModel.findById({_id: toAccount})

    if(!fromUserAccount || !toUserAccount){
        return res.status(404).json({
            message: "Either from account or to account does not exist"
        })
    }





/**
 * 2. Validate Idempotency key

 */

const isTransactionAlreadyExists = await transactionModel.findOne(idempotencyKey)

if(isTransactionAlreadyExists){
    if(isTransactionAlreadyExists.status === "COMPLETED"){
      return  res.status(200).json({
            message: "Transaction already processed",
            transaction: isTransactionAlreadyExists
        })
    }
    
    if(isTransactionAlreadyExists.status === "PENDING"){
      return  res.status(200).json({
            message: "Transaction is still processing"
        })
    }
    if(isTransactionAlreadyExists.status === "FAILED"){
     return  res.status(500).json({
            message: "Transaction failed please retry",
        })
    }
    if(isTransactionAlreadyExists.status === "REVERSED"){
       return res.status(500).json({
            message: "Transaction reversed please retry",
        })
    }

}


/**
 * 3. Check account status
 */

if (fromUserAccount.status !== "ACTIVE" || toUserAccount!=="ACTIVE"){
    return res.status(400).json({
        message: "Both fromAccount and toAccount must be ACTIVE to process transaction"
    })
}

/**
 * 4. Derive sender balance from the ledger 
 */

const balance = await fromUserAccount.getBalance()

if(balance < amount){
    return res.status(400).json({
        message:`insufficient balance . current balance is ${balance}. Requested amount is ${amount}`
    })
}




}