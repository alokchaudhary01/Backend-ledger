import { Router } from "express";
import { authmiddleware, authSystemUserMiddleware } from "../middlewares/auth.middleware.js";
import { createInitialFunds, createTransaction } from "../controllers/transaction.controller.js";

const transactionRoutes = Router()

/**
 * - POST /api/transactions/
 * - Create a new transaction
 * - Protected Route
 */

transactionRoutes.post("/" , authmiddleware , createTransaction)

/**
 * POST /api/transactions/system/inirtial-funds
 * - Create initial funds for a system user
 */

transactionRoutes.post("/system/initial-funds" , authSystemUserMiddleware , createInitialFunds)



export default transactionRoutes