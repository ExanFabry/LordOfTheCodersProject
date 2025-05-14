import express from "express";
import { clearArrays } from "./10-rounds";

export default function indexRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        clearArrays();
        req.session.rounds = 0;
        res.render("index");
    });
    return router;
}