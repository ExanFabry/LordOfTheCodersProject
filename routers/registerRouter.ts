import express from "express";
import { registerUser } from "../database";

export default function registerRouter() {
    const router = express.Router();

    router.get("/", (req, res) => {
        res.render("register");
    });

    router.post("/", (req, res) => {
        console.log("1");
        registerUser(req.body.email, req.body.password);
        console.log("2");
        res.redirect("login")
        console.log("3");
    });
    return router;
}