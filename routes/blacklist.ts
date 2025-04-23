import express from "express";
import session from "express-session";

// Extend the SessionData interface to include blacklistArray
declare module "express-session" {
    interface SessionData {
        blacklistArray?: { quote: string; answer: string; reason: string }[];
    }
}

export default function blacklistRouter() {
    const router = express.Router();

    const ensureBlacklist = (req: any) => {
        if (!req.session.blacklistArray) {
            req.session.blacklistArray = [];
        }
    };

    router.get("/", async (req, res) => {
        if (req.session.user) {
            ensureBlacklist(req);
            res.render("blacklist", {
                user: req.session.user,
                blacklistArray: req.session.blacklistArray
            });
        } else {
            res.redirect("/login");
        }
    });

    router.post("/add", async (req, res) => {
        if (req.session.user) {
            const { quote, answer, reason } = req.body;
            ensureBlacklist(req);

            if (quote && answer && reason) {
                req.session.blacklistArray!.push({ quote, answer, reason });
            }

            res.redirect("/blacklist");
        } else {
            res.redirect("/login");
        }
    });

    return router;
}
