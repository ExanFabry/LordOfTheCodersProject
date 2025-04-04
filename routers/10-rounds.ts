import express from "express";

export default function tenRoundsRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("10-rounds");
    });
    return router;
}