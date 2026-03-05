import { Router } from "express";
import { authmiddleware } from "../middlewares/auth.middleware.js";

const transactionRoutes = Router()

/**
 * - POST /api/transactions/
 * - Create a new transaction
 * - Protected Route
 */

transactionRoutes.post("/" , authmiddleware)