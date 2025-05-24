import express from "express";
import { Characters, Movies, Quotes } from "../interfaces/types";
import { characterArray, movieArray, getCharacters, getQuotes, quotesArray, getMovies } from "../api";
import { addToBlacklist, addToFavorite, client } from "../database";
import { ObjectId } from "mongodb";
import session from "express-session";
import { Session } from "inspector/promises";
import { stoppedSuddenDeath } from "./suddendeath";

export let quotes: Quotes[] = [];
let characters: {
    id: ObjectId;
    name: string | undefined;
    correctCharacter: boolean;
}[] = [];
let movies: {
    id: ObjectId;
    name: string | undefined;
    correctMovie: boolean;
}[] = [];
export function emptyQuotes() {
    quotes = [];
}
export let questionAnsweredArrayOfTypeBoolean: boolean[] = [false, false, false, false, false, false, false, false, false, false];
export let rightOrWrongCharacter: boolean[] = [];
export let rightOrWrongMovie: boolean[] = [];

let characterColorChange: number | undefined;
let movieColorChange: number | undefined;

export default function tenRoundsRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        let randomNumbers: number[] = [];
        stoppedSuddenDeath();
        if (+(req.session.rounds as number) <= 2 || +(req.session.rounds as number) === undefined) {
            try {
                await getQuotes();
                await getCharacters();
                await getMovies();
            } catch (error) {
                console.log(error);
            }
        }

        //Character array die meegegeven gaat worden in de route
        let characterOptions: {
            id: ObjectId;
            name: string | undefined;
        }[] = [];

        //Genereer 10 unieke random cijfers
        //Check eerst of de quotes array leeg is
        if (quotes.length === 0 || quotes.length === 1) {
            await client.connect();
            const resultBlackList = await client.db("Les").collection("blacklistQuotes").find<Quotes>({}).toArray();
            //Gebruik een for lus om 10 cijfers te genereren
            for (let i: number = 0; i < 10; i++) {
                //Gebruik een lus tot het getal uniek is
                let randomNumber: number;
                do {
                    //Genereer een random nummer
                    randomNumber = Math.floor(Math.random() * quotesArray.length);
                } while (
                    randomNumbers.includes(randomNumber) &&
                    quotesArray[randomNumber].character !== undefined &&
                    quotesArray[randomNumber].movie !== undefined &&
                    resultBlackList.includes(quotesArray[randomNumber])
                );
                //Steek de getallen in een array
                randomNumbers.push(randomNumber);
            }
        }

        //Haal 10 quotes uit de api
        for (let i: number = 0; i < 10; i++) {
            quotes.push(quotesArray[randomNumbers[i]]);
        }

        //Geef de quotes mee
        if (req.session.user) {
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            if (req.session.rounds > 10) {
                req.session.rounds = 1;
            }

            if (characters.length === 0) {
                generateCharacters(req);
            }

            if (movies.length === 0) {
                generateMovies(req);
            }

            let charactersForRound: {
                id: ObjectId;
                name: string | undefined;
                correctCharacter: boolean;
            }[] = [];

            for (let i: number = 0; i < 3; i++) {
                charactersForRound.push(characters[(req.session.rounds - 1) * 3 + i]);
            }

            let moviesForRound: {
                id: ObjectId;
                name: string | undefined;
                correctMovie: boolean;
            }[] = [];
            for (let i: number = 0; i < 3; i++) {
                const movieIndex = (req.session.rounds - 1) * 3 + i;
                if (movieIndex < movies.length) {
                    moviesForRound.push(movies[movieIndex]);
                }
            }
            res.render("10-rounds", {
                rounds: req.session.rounds,
                quotes: quotes[req.session.rounds - 1],
                questionAnsweredBoolean: questionAnsweredArrayOfTypeBoolean,
                characterOptions: charactersForRound,
                movieOptions: moviesForRound,
                characterColorChange: characterColorChange,
                movieColorChange: movieColorChange,
            });
        } else {
            res.redirect("/login");
        }
    });

    router.post("/favorite", (req, res) => {
        if (req.session.user) {
            addToFavorite(req.session.rounds as number, req);
            res.redirect("/10-rounds");
        } else {
            res.redirect("/login");
        }
    }); 

    router.post("/blacklist", (req, res) => {
        if (req.session.user) {
            addToBlacklist((req.session.rounds as number) - 1, req.body.blackListReason as string, req);
            console.log(req.session.blackListReason as string);
            res.redirect("/10-rounds");
        } else {
            res.redirect("/login");
        }
    });

    //Verhoogt de rounds variabele.
    router.post("/increase-rounds", (req, res) => {
        if (req.session.user) {
            characterColorChange = undefined;
            movieColorChange = undefined;
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            if (req.session.rounds >= 10) {
                req.session.rounds = 0;
            }
            req.session.rounds += 1;
            res.redirect("/10-rounds");
        } else {
            res.redirect("/login");
        }
    });

    //Verlaagt de rounds variabele.
    router.post("/decrease-rounds", (req, res) => {
        if (req.session.user) {
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            if (req.session.rounds >= 1) {
                req.session.rounds -= 1;
                res.redirect("/10-rounds");
            } else {
                res.redirect("/home");
            }
        } else {
            res.redirect("/login");
        }
    });

    router.post("/add-character-points", (req, res) => {
        if (req.session.user) {
            const characterValue = JSON.parse(req.body.characterOption);
            const characterIndex = +(req.body.characterIndex as number);
            characterColorChange = characterIndex;
            if (characterValue.correctCharacter === false) {
                if (req.session.rounds !== undefined) {
                    if (rightOrWrongCharacter.length < req.session.rounds) {
                        rightOrWrongCharacter.push(false);
                    } else {
                        rightOrWrongCharacter[req.session.rounds] = false;
                    }
                }
            } else if (characterValue.correctCharacter === true) {
                if (req.session.rounds !== undefined) {
                    if (rightOrWrongCharacter.length < req.session.rounds) {
                        rightOrWrongCharacter.push(true);
                    } else {
                        rightOrWrongCharacter[req.session.rounds] = true;
                    }
                }
            }
            res.redirect("/10-rounds");
        } else {
            res.redirect("/login");
        }
    });

    router.post("/add-movie-points", (req, res) => {
        if (req.session.user) {
            const movieValue = JSON.parse(req.body.movieOption);
            const movieIndex = +(req.body.movieIndex as number);
            movieColorChange = movieIndex;
            console.log(movieValue);
            if (movieValue.correctMovie === false) {
                if (req.session.rounds !== undefined) {
                    if (rightOrWrongMovie.length < req.session.rounds) {
                        rightOrWrongMovie.push(false);
                    } else {
                        rightOrWrongMovie[req.session.rounds] = false;
                    }
                }
                console.log(rightOrWrongMovie);
            } else if (movieValue.correctMovie === true) {
                if (req.session.rounds !== undefined) {
                    if (rightOrWrongMovie.length < req.session.rounds) {
                        rightOrWrongMovie.push(true);
                    } else {
                        rightOrWrongMovie[req.session.rounds] = true;
                    }
                }
                console.log(rightOrWrongMovie);
            }
            res.redirect("/10-rounds");
        } else {
            res.redirect("/login");
        }
    });

    //Submit question
    router.post("/complete-question", (req, res) => {
        if (req.session.user) {
            if (req.session.rounds !== undefined) {
                questionAnsweredArrayOfTypeBoolean[req.session.rounds] = true;
            }

            res.redirect("/10-rounds");
        } else {
            res.redirect("/login");
        }
    });
    return router;
}

async function generateCharacters(req: express.Request): Promise<void> {
    for (let i: number = 0; i < 10; i++) {
        let randomCharacters: number[] = [];
        let charactersPerRound: {
            id: ObjectId;
            name: string | undefined;
            correctCharacter: boolean;
        }[] = [];

        for (let j: number = 0; j < 1; j++) {
            let rightCharacterFind: Characters | undefined = characterArray.find((element) =>
                new ObjectId(element._id).equals(new ObjectId(quotes[i].character))
            );
            let rightCharacter: {
                id: ObjectId;
                name: string | undefined;
                correctCharacter: boolean;
            } = {
                id: new ObjectId(quotes[req.session.rounds as number].character),
                name: rightCharacterFind?.name,
                correctCharacter: true,
            };
            if (rightCharacter !== undefined) {
                charactersPerRound.push(rightCharacter);
            } else {
                j--;
            }
        }
        for (let j: number = 0; j < 2; j++) {
            let randomNumber = Math.floor(Math.random() * characterArray.length);
            if (!randomCharacters.includes(randomNumber)) {
                randomCharacters.push(randomNumber);
            }
            if (
                (randomCharacters !== undefined && characterArray[randomCharacters[j]]._id,
                characterArray[randomCharacters[j]].name && !charactersPerRound.some((character) => character.name === characterArray[randomNumber].name))
            ) {
                let newCharacter: {
                    id: ObjectId;
                    name: string | undefined;
                    correctCharacter: boolean;
                } = {
                    id: characterArray[randomCharacters[j]]._id,
                    name: characterArray[randomCharacters[j]].name,
                    correctCharacter: false,
                };
                if (newCharacter !== undefined) {
                    charactersPerRound.push(newCharacter);
                }
            } else {
                j--;
                randomCharacters.pop();
            }
        }

        //Fisher-Yates shuffle
        for (let k = charactersPerRound.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (i + 1));
            [charactersPerRound[k], charactersPerRound[j]] = [charactersPerRound[j], charactersPerRound[k]];
        }
        characters.push(...charactersPerRound.filter((m) => m !== undefined));
    }
}

async function generateMovies(req: express.Request): Promise<void> {
    for (let i: number = 0; i < 10; i++) {
        let randomMovies: number[] = [];
        let moviesPerRound: {
            id: ObjectId;
            name: string | undefined;
            correctMovie: boolean;
        }[] = [];

        for (let j: number = 0; j < 1; j++) {
            let rightMovieFind: Movies | undefined = movieArray.find((element) => new ObjectId(element._id).equals(new ObjectId(quotes[i].movie)));
            if (rightMovieFind !== undefined) {
                let rightMovie: {
                    id: ObjectId;
                    name: string | undefined;
                    correctMovie: boolean;
                } = {
                    id: new ObjectId(quotes[req.session.rounds as number].movie),
                    name: rightMovieFind?.name,
                    correctMovie: true,
                };
                moviesPerRound.push(rightMovie);
            } else {
                j--;
            }
        }
        // Genereer 2 unieke random cijfers
        while (randomMovies.length < 2) {
            let randomNumber = Math.floor(Math.random() * movieArray.length);
            if (
                !randomMovies.includes(randomNumber) &&
                movieArray[randomNumber] &&
                !moviesPerRound.some((movie) => movie.name === movieArray[randomNumber].name)
            ) {
                randomMovies.push(randomNumber);
            }
        }

        for (let j: number = 0; j < 2; j++) {
            if (randomMovies[j] !== undefined && movieArray[randomMovies[j]]._id !== undefined && movieArray[randomMovies[j]].name !== undefined) {
                let newMovie: {
                    id: ObjectId;
                    name: string | undefined;
                    correctMovie: boolean;
                } = {
                    id: movieArray[randomMovies[j]]._id,
                    name: movieArray[randomMovies[j]].name,
                    correctMovie: false,
                };

                moviesPerRound.push(newMovie);
            } else {
                j--;
                randomMovies.pop();
            }
        }

        //Fisher-Yates shuffle
        for (let k = moviesPerRound.length - 1; k > 0; k--) {
            const j = Math.floor(Math.random() * (i + 1));
            [moviesPerRound[k], moviesPerRound[j]] = [moviesPerRound[j], moviesPerRound[k]];
        }
        movies.push(...moviesPerRound.filter((m) => m !== undefined));
    }
}

export function clearArrays(): void {
    characters = [];
    movies = [];
}

export const addToQuotes = (quote: Quotes) => quotes.push(quote);