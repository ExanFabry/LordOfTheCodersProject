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
    router.post("/", async (req,res)=>{
        let quote: string = req.body.quote;
        let answer: string = req.body.answer;
        let result: string = req.body.result;
        
        
    })
    return router;
}