import mongoose from "mongoose";
import transactionModel from "../models/transaction.model.js";
import ledgerModel from "../models/ledger.model.js";
import accountModel from "../models/account.model.js";
import { sendTransactionEmail } from "..//services/email.service.js";

export async function createTransaction(req, res) {
  /**
   * 1. Validated the request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "fromAccount , toAccount , amount and idempotencyKey are required fields",
    });
  }
  const fromUserAccount = await accountModel.findById({ _id: fromAccount });
  const toUserAccount = await accountModel.findById({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({
      message: "Either from account or to account does not exist",
    });
  }

  /**
 * 2. Validate Idempotency key

 */

  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction already processed",
        transaction: isTransactionAlreadyExists,
      });
    }

    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(200).json({
        message: "Transaction is still processing",
      });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction failed please retry",
      });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction reversed please retry",
      });
    }
  }

  /**
   * 3. Check account status
   */

  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both fromAccount and toAccount must be ACTIVE to process transaction",
    });
  }

  /**
   * 4. Derive sender balance from the ledger
   */

  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `insufficient balance . current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  /**
   * 5. Create new transaction PENDING
   */
let transaction;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            amount,
            toAccount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session },
      )
    )[0];
    /**
     * 6. Create ledger entry for debit
     */

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          type: "DEBIT",
          transaction: transaction._id,
        },
      ],
      { session },
    );

    /**
     * 7. Create ledger entry for credit
     */

    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 10 * 1000));
    })();

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          type: "CREDIT",
          transaction: transaction._id,
        },
      ],
      { session },
    );

    /**
     * 8. Update transaction status to COMPLETED
     */

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session },
    );

    /**
     * 9. Commit the transaction
     */

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
   return res.status(400).json({
    message:"Transaction is Pending due to some error. Please retry after some time",
    
   })
  }

  /**
   * 10. Send email notification to the receiver
   */

  await sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toUserAccount._id,
  );

  return res.status(200).json({
    message: "Transaction processed successfully",
    transaction,
  });
}

export async function createInitialFunds(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount , amount and idempotencyKey are required fields",
    });
  }

  const toUserAccount = await accountModel.findById({ _id: toAccount });

  if (!toUserAccount) {
    return res.status(404).json({
      message: "to account does not exist",
    });
  }

  const fromUserAccount = await accountModel.findOne({ user: req.user._id });
  if (!fromUserAccount) {
    return res.status(404).json({
      message: "System account does not exist",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  const transaction = await new transactionModel({
    fromAccount: fromUserAccount._id,
    toAccount,
    amount,
    idempotencyKey,
    status: "PENDING",
  });

  const debitLedgerEntry = await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    { session },
  );

  transaction.status = "COMPLETED";
  await transaction.save({ session });

  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message: "Initial funds transaction completed successfull",
    transaction: transaction,
  });
}
