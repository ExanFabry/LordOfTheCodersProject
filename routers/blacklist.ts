import express from "express";

export default function blacklistRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("blacklist");
    });
    return router;
}