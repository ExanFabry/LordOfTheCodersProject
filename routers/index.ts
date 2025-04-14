import express from "express";

export default function indexRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        req.session.rounds = 0;
        res.render("index");
    });
    return router;
}