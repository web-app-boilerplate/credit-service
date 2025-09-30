// services/auth-service/swagger.js
import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Credit Service API",
        description: "Credit endpoints"
    },
    host: "localhost:5004", // used by swagger-autogen for docs generation (dev)
    schemes: ["http"],
    components: {
        securitySchemes: {
            bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" }
        }
    },
    tags: [{ name: "Credit", description: "Credit endpoints" }]
};

const outputFile = "./swagger-output.json";
const endpointsFiles = ["./routes/creditRoutes.js"]; // adjust to your routes entry file(s)

swaggerAutogen()(outputFile, endpointsFiles, doc).then(() => {
    console.log("swagger-output.json created.");
});
