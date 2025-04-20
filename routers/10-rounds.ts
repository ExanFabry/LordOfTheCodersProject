import express from "express";
import { Quotes } from "../interfaces/types";
import { getQuotes, quotesArray } from "../api";
import { addToFavorite } from "../database";

export let quotes: Quotes[] = [];
export let questionAnsweredArrayOfTypeBoolean: boolean[] = [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    false
]
export default function tenRoundsRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        let randomNumbers: number[] = [];
        try{
            await getQuotes();
        }
        catch(error){
            console.log(error);
            // return res.status(500).send("Failed");
        }
        
        //Genereer 10 unieke random cijfers
        //Check eerst of de quotes array leeg is
        if(quotes.length === 0){
            //Gebruik een for lus om 10 cijfers te genereren
            for(let i: number = 0; i < 10; i++){
                //Gebruik een lus tot het getal uniek is
                let checkUniqueNumber = true;
                let randomNumber: number;
                do{
                    //Genereer een random nummer
                    randomNumber = Math.floor(Math.random() * quotesArray.length);
                }while(randomNumbers.includes(randomNumber))
                //Steek de getallen in een array
                randomNumbers.push(randomNumber);
            }
        }

        //Haal 10 quotes uit de api
        console.log(randomNumbers);
        for(let i: number = 0; i < 10; i++){
            quotes.push(quotesArray[randomNumbers[i]]);
        }

        //Geef de quotes mee
        if (req.session.user) {
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            if(req.session.rounds > 10){
                req.session.rounds = 1;
            }
            console.log(req.session.rounds);
            res.render('10-rounds', { 
                rounds: req.session.rounds,
                quotes: quotes,
                questionAnsweredBoolean: questionAnsweredArrayOfTypeBoolean
            });
        } 
        else {
            res.redirect("/login");
        }
    });

    router.post('/favorite', (req, res) => {
        if (req.session.user) {
            addToFavorite(req.session.rounds as number, req);
            res.redirect("/10-rounds");
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
            if(req.session.rounds >= 10){
                req.session.rounds = 0;
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
        
        //Submit question
        router.post('/complete-question', (req, res) => {
            if (req.session.user) {
                if(req.session.rounds !== undefined){
                    questionAnsweredArrayOfTypeBoolean[req.session.rounds] = true;
                }
                
                res.redirect("/10-rounds");
            }
            else {
                res.redirect("/login");
            }
          });
    return router;
}