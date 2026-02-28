import express from "express"
import { authmiddleware } from "../middlewares/auth.middleware.js"
import { createAccountController } from "../controllers/account.controller.js"

const router = express.Router()

/**
 * - POST /api/accounts/ 
 * - Create a new account
 * - Protected Route
 */

router.post("/" , authmiddleware , createAccountController)


export default router