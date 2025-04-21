import express from "express";
import { secureMiddleware } from "../secureMiddleware";
import { emptyQuotes, quotes } from "./10-rounds";

export default function homeRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            emptyQuotes();
            res.render("homepage", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });

    router.get("/", secureMiddleware, async(req, res) => {
        res.render("index");
    });
    
    return router;
}