import express from "express";

export default function resultRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("result");
    });
    return router;
}