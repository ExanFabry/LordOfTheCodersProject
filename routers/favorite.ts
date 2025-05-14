import express from "express";
import { addToFavorite, client } from "../database";
import { ObjectId } from "mongodb";
import { quotes } from "./10-rounds";
import { characterArray, getCharacters, getMovies, movieArray } from "../api";
import { get } from "http";
export default function favoriteRouter() {
    const router = express.Router();
    
        // GET: Toon blacklist uit de database
        router.get("/", async (req, res) => {
            if (!req.session.user) {
                return res.redirect("/login");
            }
    
            await client.connect();
            const favoriteArray = await client
                .db("Les")
                .collection("favoriteQuotes")
                .find({ user: req.session.user })
                .toArray();
            await getCharacters();
            await getMovies();
                
            res.render("favorite", {
                user: req.session.user,
                favoriteArray: favoriteArray,
                characterArray: characterArray,
                movieArray: movieArray
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