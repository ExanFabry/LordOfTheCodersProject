import express from "express";

export default function tenRoundsRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        
        if (req.session.user) {
            if (!req.session.rounds) {
                req.session.rounds = 1;
              }
              res.render('10-rounds', { rounds: req.session.rounds });
        } 
        else {
            res.redirect("/login");
        }
    });

    //Verhoogt de rounds variabele.
    router.post('/increase-rounds', (req, res) => {
        if (req.session.user) {
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            req.session.rounds += 1;
            res.redirect("/10-rounds");
        }
        else {
            res.redirect("/login");
        }
      });

      //Verlaagt de rounds variabele.
      router.post('/decrease-rounds', (req, res) => {
          if (req.session.user) {
              if (!req.session.rounds) {
                  req.session.rounds = 1;
              }
              if(req.session.rounds >= 1){
                req.session.rounds -= 1;
                res.redirect("/10-rounds");
              }
              else{
                res.redirect("/home")
              }
          }
          else {
              res.redirect("/login");
          }
        });
    return router;
}