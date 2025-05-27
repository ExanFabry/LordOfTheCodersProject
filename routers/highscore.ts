import express from "express";
import { client } from "../database";

export default function highscoreRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            await client.connect();
            // Fetch highest 10-rounds score for this user
            const userEmail = req.session.user.email;
            const highscore10 = await client.db("Les").collection("score").find({ "user.email": userEmail })
                .sort({ score: -1 }).limit(1).toArray();
            // Fetch highest sudden death score for this user
            const highscoreSD = await client.db("Les").collection("sudden-death-score").find({ "user.email": userEmail })
                .sort({ score: -1 }).limit(1).toArray();
            res.render("highscore", {
                user: req.session.user,
                highscore10: highscore10[0]?.score ?? 0,
                highscoreSD: highscoreSD[0]?.score ?? 0
            });
        } else {
            res.redirect("/login");
        }
    });
    return router;
}