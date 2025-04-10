import express from "express";

export default function tenRoundsRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            res.render("10-rounds", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });
    return router;
}