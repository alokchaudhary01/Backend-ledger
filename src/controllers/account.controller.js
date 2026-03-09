import accountModel from "../models/account.model.js";

export async function createAccountController(req, res) {

    const user = req.user

    const isAlreadyExists = await accountModel.findOne({
        user: user._id
    })

    if (isAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists"
        })
    }

    const account = await accountModel.create({
        user: user._id
    })

    res.status(201).json({
        account
    })
}
export async function getUserAccountsController(req, res){
    const accounts = await accountModel.find({user:req.user._id});
    return res.status(200).json({
        accounts
    })
}