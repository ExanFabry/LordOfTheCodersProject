import express from "express";

export default function highscoreRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            res.render("highscore", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });
    return router;
}