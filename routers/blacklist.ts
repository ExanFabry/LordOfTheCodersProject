import express from "express";
import { addToBlacklist, client } from "../database";
import { ObjectId } from "mongodb";
import { quotes } from "./10-rounds";
import { deleteFromBlacklist } from "../database";
import { characterArray, getCharacters } from "../api";
import { get } from "http";

export default function blacklistRouter() {
    const router = express.Router();

    // GET: Toon blacklist uit de database
    router.get("/", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        await client.connect();
        const blacklistArray = await client
            .db("Les")
            .collection("blacklistQuotes")
            .find({ user: req.session.user })
            .toArray();
        await getCharacters();


        res.render("blacklist", {
            user: req.session.user,
            blacklistArray: blacklistArray,
            characterArray: characterArray,
            id: req.session.user
        });
    });

    // POST: Voeg quote toe aan blacklist via database.ts
    router.post("/add", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const quoteIndex = parseInt(req.body.quote); // quote index uit de quotes array
        const reason = req.body.reason;

        if (!isNaN(quoteIndex) && reason && quotes[quoteIndex]) {
            await addToBlacklist(quoteIndex, reason, req);
        }

        res.redirect("/blacklist");
    });
    router.post("/delete/:id", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }

        const quoteId = req.params.id as string;

        if (ObjectId.isValid(quoteId)) {
            await deleteFromBlacklist(quoteId);
            res.redirect("/blacklist")
        };



    });
    router.post("/edit/:id", async (req, res) => {
        if (!req.session.user) {
            return res.redirect("/login");
        }
        const quoteId = req.params.id as string;
        const newReason = req.body.reason;
        if (ObjectId.isValid(quoteId) && newReason) {
            await client.connect();
            await client.db("Les").collection("blacklistQuotes").updateOne(
                { _id: new ObjectId(quoteId) },
                { $set: { reason: newReason } }
            );
        }
        res.redirect("/blacklist");
    });

    return router;
}
