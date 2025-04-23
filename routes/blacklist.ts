import express from "express";
import { addToBlacklist, client } from "../database";
import { ObjectId } from "mongodb";
import { quotes } from "./10-rounds";

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

        res.render("blacklist", {
            user: req.session.user,
            blacklistArray: blacklistArray
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
                .collection("blacklistQuotes")
                .deleteOne({ _id: new ObjectId(id), user: req.session.user });
        }

        res.redirect("/blacklist");
    });

    return router;
}
