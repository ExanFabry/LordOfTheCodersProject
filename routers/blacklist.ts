import express from "express";

export default function blacklistRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            res.render("blacklist", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });
    return router;
}