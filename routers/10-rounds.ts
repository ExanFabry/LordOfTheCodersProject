/*

1: Er wordt buiten de router functie een lege array aangemaakt voor de personages ingestoken die uiteindelijk 30 character bevat en een boolean om te laten zien ofdat het de juiste of foute character is. (complete)
2: Er is een for loop die 10 keer herhaald als de array leeg is. (complete)
3: Er wordt een array gemaakt van hetzelfde type als de eerder vernoemde array waar 3 characters in horen te komen. (complete)
4: Er worden twee foute characters in de array gestoken met een boolean die false is. (complete)
5: De juiste character wordt in de array gestoken met een boolean die true is. (complete)
6: De array wordt random gemaakt met de Fisher-Yates Shuffle. (complete)
7: Er is een andere array die drie elementen hoort de bevatten. (complete)
8: De elementen worden er ingestoken doormiddel van in een for lus array.push(andereArray[((req.session.rounds - 1) * 3) + i]) te gebruiken. (complete)

*/

import express from "express";
import { Characters, Quotes } from "../interfaces/types";
import { characterArray, getCharacters, getQuotes, quotesArray } from "../api";
import { addToBlacklist, addToFavorite } from "../database";
import { ObjectId } from "mongodb";

export let quotes: Quotes[] = [];
let characters: {
    id: ObjectId,        
    name: string | undefined,
    correctCharacter: boolean
 }[] = [];
export function emptyQuotes(){
    quotes = [];
}
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
            await getCharacters();
        }
        catch(error){
            console.log(error);
            // return res.status(500).send("Failed");
        }

        //Character array die meegegeven gaat worden in de route
        let characterOptions: {
            id: ObjectId,
            name: string | undefined
        }[] = [];  
        
        //Genereer 10 unieke random cijfers
        //Check eerst of de quotes array leeg is
        if(quotes.length === 0){
            //Gebruik een for lus om 10 cijfers te genereren
            for(let i: number = 0; i < 10; i++){
                //Gebruik een lus tot het getal uniek is
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
            
            if(characters.length === 0){
                for(let i: number = 0; i < 10; i++){
                    let randomCharacters: number[] = [];
                    let charactersPerRound: {
                        id: ObjectId,
                        name: string | undefined,
                        correctCharacter: boolean
                    }[] = [];
                    // Genereer 2 unieke random cijfers
                    while(randomCharacters.length < 2){
                        let randomNumber = Math.floor(Math.random() * characterArray.length);
                        if(!randomCharacters.includes(randomNumber)){
                            randomCharacters.push(randomNumber);
                        }
                    }
                    for(let j: number = 0; j < 2; j++){
                        let newCharacter: {
                            id: ObjectId,
                            name: string | undefined,
                            correctCharacter: boolean
                        } = {
                            id: characterArray[randomCharacters[j]]._id,
                            name: characterArray[randomCharacters[j]].name,
                            correctCharacter: false
                        }
                        // charactersPerRound.push(newCharacter);
                        charactersPerRound.push(newCharacter);
                    }
                    let rightCharacterFind: Characters | undefined = characterArray.find(element => new ObjectId(element._id).equals(new ObjectId(quotes[i].character)));
                    let rightCharacter: {
                        id: ObjectId,
                        name: string | undefined,
                        correctCharacter: boolean
                    } = {
                        id: new ObjectId(quotes[req.session.rounds as number].character),
                        name: rightCharacterFind?.name,
                        correctCharacter: true
                    }
                    charactersPerRound.push(rightCharacter);
                    //Fisher-Yates shuffle
                    for (let k = charactersPerRound.length - 1; k > 0; k--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [charactersPerRound[k], charactersPerRound[j]] = [charactersPerRound[j], charactersPerRound[k]];
                    }
                    characters.push(...charactersPerRound)
                } 
            }
            
            let charactersForRound: {
                id: ObjectId,        
                name: string | undefined,
                correctCharacter: boolean
            }[] = [];
            console.log(characters);
            for(let i: number = 1; i < 4; i++){
                charactersForRound.push(characters[((req.session.rounds - 1) * 3) + i]);
                console.log(characters[((req.session.rounds - 1) * 3) + i]);
            }
            // console.log(charactersForRound[0].name);
            // console.log(charactersForRound[1].name);
            // console.log(charactersForRound[2].name);
            res.render('10-rounds', { 
                rounds: req.session.rounds,
                quotes: quotes,
                questionAnsweredBoolean: questionAnsweredArrayOfTypeBoolean,
                characterOptions: charactersForRound
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

    router.post('/blacklist', (req, res) => {
        if (req.session.user) {
            addToBlacklist(req.session.rounds as number, req.session.blackListReason as string, req);
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