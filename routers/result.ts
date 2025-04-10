import express from "express";

export default function resultRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        if (req.session.user) {
            res.render("result", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });
    return router;
}