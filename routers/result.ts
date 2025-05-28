import express from "express";
import { quotes, rightOrWrongCharacter, rightOrWrongMovie, questionAnsweredArrayOfTypeBoolean } from "./10-rounds";
import { client } from "../database";
import { User } from "../interfaces/types";
import { finishedSuddenDeath, totalRounds } from "./suddendeath";

let score: number = 0;

export default function resultRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        await client.connect();
        req.session.rounds = 0;
        addPoints(rightOrWrongCharacter);
        addPoints(rightOrWrongMovie);
        if (req.session.user) {
            let userScore: {
                user: User,
                score: number
            } = {
                user: req.session.user as User,
                score: score
            }
            let userScoreSuddenDeath: {
                user: User,
                score: number
            } = {
                user: req.session.user as User,
                score: +(totalRounds)
            }
            const scoreCollection = await client.db("Les").collection("score").insertOne(userScore);
            const scoreSuddenDeathCollection = await client.db("Les").collection("sudden-death-score").insertOne(userScoreSuddenDeath);
            res.render("result", {
                user: req.session.user,
                score: `${score}/10`,
                suddenDeath: finishedSuddenDeath,
                scoreSuddenDeath: totalRounds
            });
        } else {
            res.redirect("/login");
        }
    });
    return router;
}
function addPoints(pointsArray: boolean[]) {
    for (let i: number = 0; i < pointsArray.length; i++) {
        if (pointsArray[i]) {
            score += 0.5;
        }
    }
}