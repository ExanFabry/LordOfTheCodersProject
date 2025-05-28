import express from "express";
import { addToFavorite, client, deleteFromFavorite } from "../database";
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

        const movies = Array.isArray(movieArray) ? movieArray : [];
        const characters = Array.isArray(characterArray) ? characterArray : [];
        const favoritesWithDetails: any[] = favoriteArray
            .filter(fav => fav && fav.quote)
            .map(fav => {
                let movie = movies.find(m => m._id.toString() === String(fav.movie) || m.name === fav.movie);
                let character = characters.find(c => c._id.toString() === String(fav.character) || c.name === fav.character);
                let id = fav._id ? fav._id : (fav as any)._id ? (fav as any)._id : undefined;
                return {
                    _id: id,
                    quote: fav.quote,
                    characterName: character ? character.name : fav.character,
                    movieName: movie ? movie.name : fav.movie
                };
            });
        // Character count map
        const characterCount: Record<string, { name: string, count: number }> = {};
        favoritesWithDetails.forEach(fav => {
            if (!characterCount[fav.characterName]) {
                characterCount[fav.characterName] = { name: fav.characterName, count: 0 };
            }
            characterCount[fav.characterName].count++;
        });
        // Filter by character if query param is present
        let filteredFavorites = favoritesWithDetails;
        let selectedCharacter = req.query.character as string;
        if (selectedCharacter) {
            filteredFavorites = favoritesWithDetails.filter(fav => fav.characterName === selectedCharacter);
        }
        res.render("favorite", {
            user: req.session.user,
            favoritesWithDetails: filteredFavorites,
            characterCount: Object.values(characterCount),
            selectedCharacter
        });
    });

    // POST: Voeg quote toe aan blacklist via database.ts
    router.post("/add", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        // Expect the full quote object in req.body.quoteObj (sent as JSON string)
        let quoteObj;
        try {
            quoteObj = typeof req.body.quoteObj === 'string' ? JSON.parse(req.body.quoteObj) : req.body.quoteObj;
        } catch (e) {
            return res.redirect("/favorite");
        }

        if (quoteObj && quoteObj.dialog) {
            await addToFavorite(quoteObj, req);
        }

        res.redirect("/favorite");
    });

    // POST: Verwijder quote uit database
    router.post("/delete/:id", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const favoriteId = req.params.id as string;

        if (ObjectId.isValid(favoriteId)) {
            await deleteFromFavorite(favoriteId);
        }
        res.redirect("/favorite");
    });

    return router;
}