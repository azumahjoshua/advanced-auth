import express from "express";
import {forgotPassword, verifyEmail, login, logout,signup } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup)

router.post("/login",login)

router.get("/logout",logout)

router.post("/verify-email",verifyEmail)

router.post("/forgot-password",forgotPassword)

export default router;