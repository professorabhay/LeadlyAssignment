import mongoose, { Document, Model, Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


interface UserDocument extends Document {
    name: string;
    email: string;
    password: string;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
}

const userSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: [true, "Please provide your name!"]
    },
    email: {
        type: String, 
        required: [true, "Please provide your Email!"],
        unique: true,
        lowercase: true    
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minlength: 8,
        // select: false
    },
    refreshToken: {
        type: String
    }
},
{
    timestamps: true
}
);

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    console.log(this.password)
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.methods.isPasswordCorrect = async function (password: string) {
    try {
        console.log('Comparing passwords:', password, this.password);
        if (!this.password) {
            throw new Error('No password found');
        }
        const isMatch = await bcrypt.compare(password, this.password as string);
        console.log('Password comparison result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw new Error('Error comparing passwords');
    }
};

userSchema.methods.generateAccessToken =  function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }   
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model<UserDocument>("User", userSchema);