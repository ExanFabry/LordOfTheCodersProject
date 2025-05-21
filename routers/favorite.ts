import express from "express";
import { addToFavorite, client } from "../database";
import { ObjectId } from "mongodb";
import { quotes } from "./10-rounds";
import { characterArray, getCharacters, getMovies, movieArray } from "../api";
import { get } from "http";
import { FavoriteQuote } from "../interfaces/types";
export default function favoriteRouter() {
    const router = express.Router();

    // GET: Toon blacklist uit de database
    router.get("/", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        await client.connect();
        const favoriteArray: FavoriteQuote[] = await client
            .db("Les")
            .collection<FavoriteQuote>("favoriteQuotes")
            .find({ user: req.session.user })
            .toArray();
        await getCharacters();
        await getMovies();

        // Build a new array with quote, characterName, movieName
        const favoritesWithDetails = favoriteArray.map(fav => {
            // Try to match by string value of ObjectId or by name
            let movie = movieArray.find(m => m._id.toString() === String(fav.movie) || m.name === fav.movie);
            let character = characterArray.find(c => c._id.toString() === String(fav.character) || c.name === fav.character);
            return {
                quote: fav.quote,
                characterName: character ? character.name : fav.character,
                movieName: movie ? movie.name : fav.movie
            };
        });

        res.render("favorite", {
            user: req.session.user,
            favoritesWithDetails: favoritesWithDetails
        });
    });

    // POST: Voeg quote toe aan blacklist via database.ts
    router.post("/add", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const quoteIndex = parseInt(req.body.quote); // quote index uit de quotes array


        if (!isNaN(quoteIndex) && quotes[quoteIndex]) {
            await addToFavorite(quoteIndex, req);
        }

        res.redirect("/favorite");
    });

    // POST: Verwijder quote uit database
    router.post("/delete", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const id = req.body.id;
        if (id) {
            await client.connect();
            await client
                .db("Les")
                .collection("favoriteQuotes")
                .deleteOne({ _id: new ObjectId(id), user: req.session.user });
        }

        res.redirect("/favorite");
    });

    return router;
}