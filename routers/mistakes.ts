import express from "express";
import { quotes } from "./10-rounds";
import { rightOrWrongCharacter, rightOrWrongMovie } from "./10-rounds";
import { characterArray, movieArray } from "../api";

export default function mistakesRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            // Build mistakes array for 10 rounds
            let mistakes: any[] = [];
            for (let i = 0; i < quotes.length; i++) {
                const quote = quotes[i]?.dialog;
                const characterId = quotes[i]?.character;
                const movieId = quotes[i]?.movie;
                const character = characterArray.find(c => c._id.toString() === characterId?.toString());
                const movie = movieArray.find(m => m._id.toString() === movieId?.toString());
                const correctCharacter = character ? character.name : 'Onbekend';
                const correctMovie = movie ? movie.name : 'Onbekend';
                const charCorrect = rightOrWrongCharacter[i];
                const movieCorrect = rightOrWrongMovie[i];
                mistakes.push({
                    quote,
                    correctCharacter,
                    correctMovie,
                    charCorrect,
                    movieCorrect
                });
            }
            // Clear arrays after rendering so only the most recent game's mistakes are shown
            res.render("mistakes", { user: req.session.user, mistakes });
            quotes.length = 0;
            rightOrWrongCharacter.length = 0;
            rightOrWrongMovie.length = 0;
        } else {
            res.redirect("/login");
        }
    });
    return router;
}