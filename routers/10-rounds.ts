import express from "express";
import { Quotes } from "../interfaces/types";
import { getQuotes, quotesArray } from "../api";

export let quotes: Quotes[] = [];
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
                if (quotesArray.length < 10) {
                    throw new Error("Not enough quotes available to generate 10 unique numbers.");
                }
                let randomNumber: number;
                do{
                    //Genereer een random nummer
                    randomNumber = Math.floor(Math.random() * quotesArray.length);
                }while(randomNumbers.includes(randomNumber))
                //Steek de getallen in een array
                randomNumbers.push(randomNumber);
                // console.log(quotesArray);
                console.log(randomNumber);
                console.log(quotesArray.length);
            }
        }
        console.log(randomNumbers);

        //Haal 10 quotes uit de api
        console.log(randomNumbers);
        for(let i: number = 0; i < 10; i++){
            quotes.push(quotesArray[randomNumbers[i]]);
        }
        console.log(quotes);

        //Geef de quotes mee
        if (req.session.user) {
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            res.render('10-rounds', { 
                rounds: req.session.rounds,
                quotes: quotes
            });
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