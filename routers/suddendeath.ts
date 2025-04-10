import express from "express";

export default function suddendeathRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            res.render("suddendeath", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });
    return router;
}