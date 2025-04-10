import express from "express";

export default function mistakesRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            res.render("mistakes", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });
    return router;
}