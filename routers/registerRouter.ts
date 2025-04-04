import express from "express";

export default function registerRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("register");
    });
    return router;
}