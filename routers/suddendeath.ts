import express from "express";

export default function suddendeathRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("suddendeath");
    });
    return router;
}