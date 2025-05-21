//Imports
import express from "express";
import { getQuotes, getCharacters, getMovies, quotesArray } from "../api";
import { quotes } from "./10-rounds";
import { client } from "../database";
import { Quotes } from "../interfaces/types";

//Sudden death router
export default function suddendeathRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        //Haalt de blacklist quotes op.
        const resultBlackList = await client.db("Les").collection("blacklistQuotes").find<Quotes>({}).toArray();
        //Ervoor zorgen dat de api niet teveel wordt aangeroepen.
        if (+(req.session.rounds as number) <= 2 || +(req.session.rounds as number) === undefined) {
            try {
                //Haalt de api op.
                await getQuotes();
                await getCharacters();
                await getMovies();
            } catch (error) {
                //Logt error.
                console.log(error);
            }
        }

        // Genereer één unieke random quote die niet op de blacklist staat
        let randomQuote: Quotes | undefined;
        do {
            const randomIndex = Math.floor(Math.random() * quotesArray.length);
            randomQuote = quotesArray[randomIndex];
        } while (
            !randomQuote ||
            resultBlackList.some((q) => q._id === randomQuote!._id) ||
            randomQuote.character === undefined ||
            randomQuote.movie === undefined
        );

        //Als de gebruiker is ingelogd.
        if (req.session.user) {
            //Als req.session.rounds geen waarde heeft dan is het 1.
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            res.render("suddendeath", {
                //Geeft de rondes mee
                rounds: req.session.rounds,
                //Geef de quotes mee
                quotes: randomQuote
            });
        } else {
            res.redirect("/login");
        }
    });
    
        //Verhoogt de rounds variabele.
        router.post("/increase-rounds", (req, res) => {
            if (req.session.user) {
                if (!req.session.rounds) {
                    req.session.rounds = 1;
                }
                else{
                    req.session.rounds += 1;
                }
                res.redirect("/suddendeath");
            } else {
                res.redirect("/login");
            }
        });
    return router;
}
