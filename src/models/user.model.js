import mongoose from "mongoose";
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema({
    email:
    {
        type: String,
        required: [true , "Email is required for creating new user"],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
        unique: [true , "Email already exists"]
    },
    name:{
        type: String,
        required : [true, "Name is required for creating an account"],


    },
    password:{
        type:String,
        required: [true , "password is required for creating an account"],
        minlength:[6 , "password should contain minimum 6 characters"],
        select: false
    }
},{
timestamps: true
})

userSchema.pre("save" , async function(){
    if (!this.isModified("password")){
        return
    }

    const hash = await bcrypt.hash(this.password , 10)
    this.password = hash
    return
})

userSchema.methods.comparePassword = async function(password){
    return bcrypt.compare(password , this.password)
}


const userModel = mongoose.model("user" , userSchema)

export default userModel