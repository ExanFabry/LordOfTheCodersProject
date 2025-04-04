import express from "express";

export default function favoriteRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("favorite");
    });
    return router;
}