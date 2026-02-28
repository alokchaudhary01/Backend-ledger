import express from "express"

import cookieParser from "cookie-parser"


// Route import 


import accountRouter from "./routes/account.routes.js"
import authRouter from "./routes/auth.routes.js"


const app = express()

app.use(express.json())
app.use(cookieParser())

// Use Routes

app.use("/api/auth", authRouter)
app.use("/api/accounts", accountRouter)

export default app