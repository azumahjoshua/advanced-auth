import {User} from '../models/user.model.js'
import bcryptjs from 'bcryptjs';
import crypto from 'crypto'
import { generateVerficationCode } from '../utils/generateVerificationCode.js';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js';
import {sendPasswordResetEmail, sendRestSuccessEmail, sendVerificationEmail } from '../mail/emails.js';

// Signup Controller
export const signup = async (req, res) => {
    const { email, password, name } = req.body;  // Destructure email, password, and name from the request body

    try {
        // Check if all required fields are provided
        if (!email || !password || !name) {
            throw new Error("All fields are required");
        }

        // Check if a user with the given email already exists in the database
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }

        // Hash the password using bcryptjs with a salt factor of 12
        const hashPassword = await bcryptjs.hash(password, 12);

        // Generate a verification token (this is usually a random code for email verification)
        const verificationToken = generateVerificationCode();

        // Create a new user instance
        const user = new User({
            email,
            password: hashPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000  // Set token expiration time to 24 hours
        });

        // Save the new user to the database
        await user.save();

        // Generate JWT token and set it as a cookie in the response
        generateTokenAndSetCookie(res, user._id);

        // Send a verification email to the user's email address
        await sendVerificationEmail(user.email, user.name);

        // Return a success response with user details (excluding password)
        res.status(201).json({
            success: true,
            message: "Signup successful. Please verify your email.",
            user: {
                ...user._doc,
                password: undefined  // Remove password from the response object
            }
        });
    } catch (error) {
        // Handle any errors and send a failure response
        res.status(400).json({ success: false, message: error.message });
    }
};

// Logout Controller
export const logout = async (req, res) => {
    // Clear the token cookie to log the user out
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
};


// Login Controller
export const login = async (req, res) => {
    const { email, password } = req.body;  // Destructure email and password from the request body
    try {
        // Check if the user with the given email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Generate JWT token and set it as a cookie in the response
        generateTokenAndSetCookie(res, user._id);

        // Update the user's last login time and save to the database
        user.lastLogin = new Date();
        await user.save();

        // Return a success response with the user details (excluding password)
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined  // Remove password from the response object
            }
        });
    } catch (error) {
        // Handle any errors and send a failure response
        res.status(400).json({ success: false, message: error.message });
    }
};

// Email Verification Controller
export const verifyEmail = async (req, res) => {
    const { code } = req.body;  // Get the verification code from the request body
    try {
        // Find the user with the matching verification token and ensure the token is not expired
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }  // Ensure the token hasn't expired
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification code"
            });
        }

        // Mark the user as verified and clear the verification token and expiration
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();

        // Send a success response after the email is verified
        res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (error) {
        // Handle any errors and send a failure response
        res.status(400).json({ success: false, message: error.message });
    }
};

// Forgot Password Controller
export const forgotPassword = async (req, res) => {
    const { email } = req.body;  // Get the email from the request body

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate a secure reset token using crypto
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Set the expiration time for the reset token (1 hour from now)
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;  // Corrected from Data.now()

        // Update user with the reset token and expiration time
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        // Save the user with the new reset token
        await user.save();

        // Send password reset email with the reset token link
        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`
        );

        // Respond with a success message
        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email"
        });
    } catch (error) {
        // Handle any errors and respond with an error message
        res.status(400).json({ success: false, message: error.message });
    }
};

export const resetPassword = async (req,res)=>{
    try {
        const {token} = req.params
        const {password} = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {$gt:Date.now()}
        })
        if(!user){
            return res.status(400).json({success:false, message:"Invalid or expired reset token"})
        }
        // update password
        const hashPassword = await bcryptjs.hash(password,12)
        user.password = hashPassword,
        user.resetPasswordToken = undefined,
        user.resetPasswordExpiresAt= undefined,
        await user.save(),

        await sendRestSuccessEmail(user.email)
        res.status(200).json({success:true, message:"Password reset successful"})

    } catch (error) {
        console.log("Error in reseting password", error)
        res.status(400).json({ success: false, message: error.message });
    }
}