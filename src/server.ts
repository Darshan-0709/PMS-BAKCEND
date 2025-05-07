import "dotenv/config";
import express from "express";
import { routeLogger } from "./middlewares/routeLogger";
import app from "./app";

const PORT = process.env.PORT || 3000;

app.use(routeLogger); // Log all routes

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
