import express from "express";
import dotenv from "dotenv";
import creditRoute from "./routes/creditRoutes.js";
import errorHandler from "./middlewares/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import swaggerFile from "./swagger-output.json" assert { type: "json" };


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

// Swagger
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.get("/swagger.json", (req, res) => {
    res.json(swaggerFile);
});

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Credit Service running on port ${PORT}`);
});
