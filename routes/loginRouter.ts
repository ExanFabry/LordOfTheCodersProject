import express from "express";
import { User } from "../interfaces/types";
import { login } from "../database";
import { secureMiddleware } from "../secureMiddleware";
import { NextFunction, Request, Response } from "express";

export default function loginRouter() {
    const router = express.Router();
    let error = "";

    router.get("/", async (req, res) => {
        console.log(req.session.message?.type);
        res.render("login", {
            message: error
        });
    });

    router.post("/", async (req, res) => {
        const email: string = req.body.email;
        const password: string = req.body.password;
        try {
            let user: User = await login(email, password);
            delete user.password; // Remove password from user object. Sounds like a good idea.
            req.session.user = user;
            res.redirect("/home")
        } catch (e: any) {
            req.session.message = {type: "error", message: e.message};
            error = "error";
            res.redirect("/login");
        }
    });

    router.post("/logout", secureMiddleware, async (req, res) => {
        req.session.destroy((err) => {
            res.redirect("/login");
        });
    });

    return router;
}