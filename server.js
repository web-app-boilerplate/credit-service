import express from "express";
import dotenv from "dotenv";
import creditRoute from "./routes/creditRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 5003;

app.use(express.json());

// Test route
app.get("/health", (req, res) => {
    res.json({ service: "credit-service", status: "ok" });
});

// Users route
app.use("/credit", creditRoute)

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Credit Service running on port ${PORT}`);
});
