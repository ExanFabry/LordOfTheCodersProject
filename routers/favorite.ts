import express from "express";

export default function favoriteRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            res.render("favorite", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });
    return router;
}