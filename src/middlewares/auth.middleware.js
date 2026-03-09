import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export async function authmiddleware(req , res , next){

    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    try{

        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        const user  = await userModel.findById(decoded.userId)
        req.user = user

        return next()
        
    }catch{
        return res.status(401).json({
            message: "Unauthorized access, Token is invalid"
        })
    }









}

export async function authSystemUserMiddleware(req , res , next){
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]
    if(!token){
        return res.status(401).json({
            message: "Unauthorized access, token is missing"
        })
    }

    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET)
        const user  = await userModel.findById(decoded.userId).select("+systemUser")
        if(!user.systemUser){
            return res.status(403).json({
                message: "Forbidden access, user is not a system user"
            })
        }
        req.user = user
        return next()
    }catch{
        return res.status(401).json({
            message: "Unauthorized access, Token is invalid"
        })
    }
}

 