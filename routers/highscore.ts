import express from "express";

export default function highscoreRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("highscore");
    });
    return router;
}