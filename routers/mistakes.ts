import express from "express";

export default function mistakesRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("mistakes");
    });
    return router;
}