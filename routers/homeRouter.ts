import express from "express";
import { secureMiddleware } from "../secureMiddleware";

export default function homeRouter() {
    const router = express.Router();

    // router.get("/", (req, res) => {
    //     res.render("homepage");
    // });
    router.get("/", async (req, res) => {
        if (req.session.user) {
            res.render("homepage", {user: req.session.user});
        } else {
            res.redirect("/login");
        }
    });

    router.get("/", secureMiddleware, async(req, res) => {
        res.render("index");
    });
    
    return router;
}