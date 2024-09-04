import {User} from '../models/user.model.js'
import bcryptjs from 'bcryptjs';
import { generateVerficationCode } from '../utils/generateVerificationCode.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import { sendVerificationEmail } from '../mail/emails.js';
export const signup = async (req, res) => {
    const { email, password, name } = req.body;  // Destructure the required fields from the request body

    try {
        // Check if all required fields are provided
        if (!email || !password || !name) {
            throw new Error("All fields are required");
        }

        // Check if a user with the given email already exists
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password with a salt factor of 12
        const hashPassword = await bcryptjs.hash(password, 12);

        // Generate a verification token (assuming it's a function that generates a random code)
        const verificationToken = generateVerficationCode();

        // Create a new user instance
        const user = new User({
            email,
            password: hashPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000  // Token expires in 24 hours
        });

        // Save the new user to the database
        await user.save();

        // Generate JWT token and set it as a cookie in the response
        generateTokenAndSetCookie(res, user._id);

        await sendVerificationEmail(user.email,user.name)

        // Return a success response with the user details (excluding the password)
        res.status(201).json({
            success: true,
            message: "Email Verified successfully",
            user: {
                ...user._doc,
                password: undefined  // Exclude the password from the response
            }
        });
    } catch (error) {
        // Handle errors and send a response with the error message
        res.status(400).json({ success: false, message: error.message });
    }
};
export const logout = async(req,res)=>{
    res.send("logout routes")
}

export const login = async(req,res)=>{
    res.send("login routes")
}

export const verifyEmail = async(req,res)=>{
    const {code} = req.body;
    try {
        const user = await User.findOne({
            verificationToken:code,
            verificationTokenExpiresAt: {$gt:Date.now()}
        })
        if(!user){
            return res.status(400).json({
                success:false,
                message :"Invalide or expired verification code"
            })
        }
        user.isVerified = true,
        user.verificationToken = undefined,
        user.verificationTokenExpiresAt = undefined,
        await user.save();

    } catch (error) {
        
    }
    res.send("Verify email")
}