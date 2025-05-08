import express from "express";
import { rightOrWrongCharacter, rightOrWrongMovie } from "./10-rounds";

let score: number = 0;

export default function resultRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        req.session.rounds = 0;
        addPoints(rightOrWrongCharacter);
        addPoints(rightOrWrongMovie);
        if (req.session.user) {
            res.render("result", {
                user: req.session.user,
                score: `${score}/10`
            });
        } else {
            res.redirect("/login");
        }
    });
    return router;
}
function addPoints(pointsArray: boolean[]){
    for(let i: number = 0; i < pointsArray.length; i++){
        if(pointsArray[i]){
            score+=0.5;
        }
    }
}