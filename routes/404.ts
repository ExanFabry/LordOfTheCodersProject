import express from "express";

export default function invalidPageRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("404");
    });
    return router;
}