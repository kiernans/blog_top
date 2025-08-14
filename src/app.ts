import path from "node:path";
import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

// Required for process.env
dotenv.config();

// Standard setup with Express and EJS
const app: Express = express();
// Assumes files are in src folder and views is one level up
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

// Setting up listener
const PORT = process.env.EXPRESS_PORT;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

// Error checking for Express app
// Must be placed after all other middleware to catch error properly
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    res.status(500).send(err.message);
});