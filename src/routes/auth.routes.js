import express from "express";
import { userLoginController, userRegisterController } from "../controllers/auth.controller.js";

const router = express.Router()


// POST /api/auth/register

router.post("/register" , userRegisterController)
router.post("/login" , userLoginController)

export default router