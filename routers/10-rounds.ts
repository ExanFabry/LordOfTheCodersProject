import express from "express";
import { Characters, Movies, Quotes } from "../interfaces/types";
import { characterArray, movieArray, getCharacters, getQuotes, quotesArray, getMovies } from "../api";
import { addToBlacklist, addToFavorite, client } from "../database";
import { ObjectId } from "mongodb";

export let quotes: Quotes[] = [];
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
export let rightOrWrongCharacter: boolean[] = [];
export let rightOrWrongMovie: boolean[] = [];

export default function tenRoundsRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        let randomNumbers: number[] = [];
        if(+(req.session.rounds as number) <= 2 || +(req.session.rounds as number) === undefined){ 
            try{
                await getQuotes();
                await getCharacters();
                await getMovies();
            }
            catch(error){
                console.log(error);
            }
        }

        //Character array die meegegeven gaat worden in de route
        let characterOptions: {
            id: ObjectId,
            name: string | undefined
        }[] = [];  
        
        //Genereer 10 unieke random cijfers
        //Check eerst of de quotes array leeg is
        if(quotes.length === 0 || quotes.length === 1){
            await client.connect();
            const resultBlackList = await client.db("Les").collection("blacklistQuotes").find<Quotes>({}).toArray();
            //Gebruik een for lus om 10 cijfers te genereren
            for(let i: number = 0; i < 10; i++){
                //Gebruik een lus tot het getal uniek is
                let randomNumber: number;
                do{
                    //Genereer een random nummer
                    randomNumber = Math.floor(Math.random() * quotesArray.length);
                }while(randomNumbers.includes(randomNumber) && quotesArray[randomNumber].character !== undefined && quotesArray[randomNumber].movie !== undefined && resultBlackList.includes(quotesArray[randomNumber]))
                //Steek de getallen in een array
                randomNumbers.push(randomNumber);
            }
        } 

        //Haal 10 quotes uit de api
        console.log(randomNumbers);
        for(let i: number = 0; i < 10; i++){
            quotes.push(quotesArray[randomNumbers[i]]);
        }
        req.session.quotes = quotes;
        //Geef de quotes mee
        if (req.session.user) {
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            if(req.session.rounds > 10){
                req.session.rounds = 1;
            }
            
            if(characters.length === 0){
                generateCharacters(req);
            }

            if(movies.length === 0){
                generateMovies(req);
            }
            
            let charactersForRound: {
                id: ObjectId,        
                name: string | undefined,
                correctCharacter: boolean
            }[] = [];
            
            for(let i: number = 0; i < 3; i++){
                charactersForRound.push(characters[((req.session.rounds - 1) * 3) + i]);
            }
            
            let moviesForRound: {
                id: ObjectId,        
                name: string | undefined,
                correctMovie: boolean
            }[] = [];
            for(let i: number = 0; i < 3; i++){
                const movieIndex = ((req.session.rounds - 1) * 3) + i;
                if (movieIndex < movies.length) {
                    moviesForRound.push(movies[movieIndex]);
                }
            }
            res.render('10-rounds', { 
                rounds: req.session.rounds,
                quotes: quotes,
                questionAnsweredBoolean: questionAnsweredArrayOfTypeBoolean,
                characterOptions: characterOptions
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

    router.post('/add-character-points', (req, res) => {
        if (req.session.user) { 
            const characterValue = JSON.parse(req.body.characterOption);
            if(characterValue.correctCharacter === false){
                if(req.session.rounds !== undefined){
                    if(rightOrWrongCharacter.length < req.session.rounds){
                        rightOrWrongCharacter.push(false);
                    }
                    else{
                        rightOrWrongCharacter[req.session.rounds] = false;
                    }
                }
            }
            else if(characterValue.correctCharacter === true){
                if(req.session.rounds !== undefined){
                    if(rightOrWrongCharacter.length < req.session.rounds){
                        rightOrWrongCharacter.push(true);
                    }
                    else{
                        rightOrWrongCharacter[req.session.rounds] = true;
                    }
                }
            }
            res.redirect("/10-rounds");
        }
        else {
            res.redirect("/login");
        }
    });

        router.post('/add-movie-points', (req, res) => {
            if (req.session.user) { 
                const movieValue = JSON.parse(req.body.movieOption);
                console.log(movieValue);
                if(movieValue.correctMovie === false){
                    if(req.session.rounds !== undefined){
                        if(rightOrWrongMovie.length < req.session.rounds){
                            rightOrWrongMovie.push(false);
                        }
                        else{
                            rightOrWrongMovie[req.session.rounds] = false;
                        }
                    }
                    console.log(rightOrWrongMovie);
                }
                else if(movieValue.correctMovie === true){
                    if(req.session.rounds !== undefined){
                        if(rightOrWrongMovie.length < req.session.rounds){
                            rightOrWrongMovie.push(true);
                        }
                        else{
                            rightOrWrongMovie[req.session.rounds] = true;
                        }
                    }
                    console.log(rightOrWrongMovie);
                }
                res.redirect("/10-rounds");
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
};