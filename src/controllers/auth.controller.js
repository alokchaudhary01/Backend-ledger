import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendRegistrationEmail } from "../services/email.service.js";
/**
 * - user register controller
 * - POST /api/auth/register
**/
export async  function userRegisterController(req,res){

    const{email , password , name } = req.body
    const isexists = await userModel.findOne({email})

    if(isexists){
        return res.status(422).json({
            message:"User already exists with this email",
            status:"failed"
        })
    }
const user = await userModel.create({
    email , password , name
})

const token = jwt.sign({userId:user._id} , process.env.JWT_SECRET ,{ expiresIn: "3d"})
res.cookie("token" , token)
res.status(201).json({
   user :{
     _id: user._id,
    email:user.email,
    name: user.name
},
token
})

await sendRegistrationEmail(user.email , user.name)

}


/**
 * - user login controller
 * - POST /api/auth/login
**/

export async function  userLoginController(req , res){
const {email , password} = req.body
const user = await userModel.findOne({email}).select("+password");
if(!user){
  return  res.status(401).json({
        message: "Either Email or password is invalid"
    })
    
}
const isPasswordValid = user.comparePassword(password)
if(!isPasswordValid){
     return  res.status(401).json({
        message: "Either Email or password is invalid"
    })
}
const token = jwt.sign({userId:user._id} , process.env.JWT_SECRET ,{ expiresIn: "3d"})
res.cookie("token" , token)
res.status(200).json({
   user :{
     _id: user._id,
    email:user.email,
    name: user.name
},
token
})
}
