//Imports
import express from "express";
import { getQuotes, getCharacters, getMovies, quotesArray, characterArray, movieArray } from "../api";
// import { quotes } from "./10-rounds";
import { client, addToBlacklist, addToFavorite } from "../database";
import { Quotes, Characters, Movies } from "../interfaces/types";
import { ObjectId } from "mongodb";
import { addToQuotes } from "./10-rounds";

export let quotesSuddenDeath: Quotes[] = [];
// Genereer één unieke random quote die niet op de blacklist staat
let randomQuote: Quotes | undefined;
export let totalRounds: string;
export let finishedSuddenDeath: boolean;

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

export let rightOrWrongCharacterSuddenDeath: boolean[] = [];
export let rightOrWrongMovieSuddenDeath: boolean[] = [];

let characterColorChange: number | undefined;
let movieColorChange: number | undefined;

//Sudden death router
export default function suddendeathRouter() {
    const router = express.Router();

    router.get("/", async (req, res) => {
        //Haalt de blacklist quotes op.
        const resultBlackList = await client.db("Les").collection("blacklistQuotes").find<Quotes>({}).toArray();
        //Ervoor zorgen dat de api niet teveel wordt aangeroepen.
        if (+(req.session.rounds as number) <= 2 || +(req.session.rounds as number) === undefined) {
            try {
                //Haalt de api op.
                await getQuotes();
                await getCharacters();
                await getMovies();
            } catch (error) {
                //Logt error.
                console.log(error);
            }
        }

        if (randomQuote === undefined) {
            do {
                const randomIndex = Math.floor(Math.random() * quotesArray.length);
                randomQuote = quotesArray[randomIndex];
            } while (
                !randomQuote ||
                resultBlackList.some((q) => q._id === randomQuote!._id) ||
                randomQuote.character === undefined ||
                randomQuote.movie === undefined
            );

            quotesSuddenDeath = [];
            quotesSuddenDeath.push(randomQuote);
            addToQuotes(randomQuote);
        }

        //Als de gebruiker is ingelogd.
        if (req.session.user) {
            //Als req.session.rounds geen waarde heeft dan is het 1.
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            //Steekt de characters en movies in de array
            if (characters.length === 0 && movies.length === 0) {
                generateCharacters(req);
                generateMovies(req);
            }
            quotesSuddenDeath.push(randomQuote);


            let characterAnswered: boolean = true;
            let movieAnswered: boolean = true;
            if (rightOrWrongCharacterSuddenDeath.length < req.session.rounds) {
                movieAnswered = false;
            }
            if (rightOrWrongMovieSuddenDeath.length < req.session.rounds) {
                characterAnswered = false;
            }

            res.render("suddendeath", {
                //Geeft de rondes mee
                rounds: req.session.rounds,
                //Geef de quotes mee
                quotes: randomQuote,
                //Geeft characters mee
                characterOptions: characters,
                //Geeft films mee
                movieOptions: movies,
                //Welk character is geselecteerd
                characterColorChange: characterColorChange,
                //Welke film is geselecteerd
                movieColorChange: movieColorChange,
                characterAnswered: characterAnswered,
                movieAnswered: movieAnswered
            });
        } else {
            res.redirect("/login");
        }
    });

    router.post("/favorite", (req, res) => {
        if (req.session.user) {
            // Add the current quote object (not by index) to favorites, just like in 10-rounds
            if (quotesSuddenDeath[0]) {
                addToFavorite(quotesSuddenDeath[0], req);
            }
            res.redirect("/suddendeath");
        } else {
            res.redirect("/login");
        }
    });

    router.post("/blacklist", (req, res) => {
        if (req.session.user) {
            addToBlacklist((req.session.rounds as number) - 1, req.body.blackListReason as string, req);
            console.log(req.session.blackListReason as string);
            res.redirect("/suddendeath");
        } else {
            res.redirect("/login");
        }
    });

    //Verhoogt de rounds variabele.
    router.post("/increase-rounds", (req, res) => {
        characters = [];
        movies = [];
        characterColorChange = undefined;
        movieColorChange = undefined;
        if (req.session.user) {
            if (!req.session.rounds) {
                req.session.rounds = 1;
            }
            else {
                req.session.rounds += 1;
            }
            randomQuote = undefined;
            if (rightOrWrongCharacterSuddenDeath[rightOrWrongCharacterSuddenDeath.length - 1] === false || rightOrWrongMovieSuddenDeath[rightOrWrongMovieSuddenDeath.length - 1] === false || rightOrWrongCharacterSuddenDeath.length < req.session.rounds || rightOrWrongMovieSuddenDeath.length < req.session.rounds) {
                totalRounds = (req.session.rounds as number - 1).toString();
                finishedSuddenDeath = true;
                res.redirect("/result");
            }
            else {
                quotesSuddenDeath.pop();
                res.redirect("/suddendeath");
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
                    if (rightOrWrongCharacterSuddenDeath.length < req.session.rounds) {
                        rightOrWrongCharacterSuddenDeath.push(false);
                    } else {
                        rightOrWrongCharacterSuddenDeath[req.session.rounds] = false;
                    }
                }
            } else if (characterValue.correctCharacter === true) {
                if (req.session.rounds !== undefined) {
                    if (rightOrWrongCharacterSuddenDeath.length < req.session.rounds) {
                        rightOrWrongCharacterSuddenDeath.push(true);
                    } else {
                        rightOrWrongCharacterSuddenDeath[req.session.rounds] = true;
                    }
                }
            }
            res.redirect("/suddendeath");
        } else {
            res.redirect("/login");
        }
    });

    router.post("/add-movie-points", (req, res) => {
        if (req.session.user) {
            const movieValue = JSON.parse(req.body.movieOption);
            const movieIndex = +(req.body.movieIndex as number);
            movieColorChange = movieIndex;
            if (movieValue.correctMovie === false) {
                if (req.session.rounds !== undefined) {
                    if (rightOrWrongMovieSuddenDeath.length < req.session.rounds) {
                        rightOrWrongMovieSuddenDeath.push(false);
                    } else {
                        rightOrWrongMovieSuddenDeath[req.session.rounds] = false;
                    }
                }
            } else if (movieValue.correctMovie === true) {
                if (req.session.rounds !== undefined) {
                    if (rightOrWrongMovieSuddenDeath.length < req.session.rounds) {
                        rightOrWrongMovieSuddenDeath.push(true);
                    } else {
                        rightOrWrongMovieSuddenDeath[req.session.rounds] = true;
                    }
                }
            }
            res.redirect("/suddendeath");
        } else {
            res.redirect("/login");
        }
    });
    return router;
}

async function generateCharacters(req: express.Request) {
    let randomCharacters: number[] = [];
    let charactersPerRound: {
        id: ObjectId;
        name: string | undefined;
        correctCharacter: boolean;
    }[] = [];

    let rightCharacterFind: Characters | undefined = characterArray.find((element) =>
        new ObjectId(element._id).equals(new ObjectId(quotesSuddenDeath[0].character))
    );
    let rightCharacter: {
        id: ObjectId;
        name: string | undefined;
        correctCharacter: boolean;
    } = {
        id: new ObjectId(quotesSuddenDeath[0].character),
        name: rightCharacterFind?.name,
        correctCharacter: true,
    };
    if (rightCharacter !== undefined) {
        charactersPerRound.push(rightCharacter);
    }

    for (let i: number = 0; i < 2; i++) {
        let randomNumber = Math.floor(Math.random() * characterArray.length);
        if (!randomCharacters.includes(randomNumber)) {
            randomCharacters.push(randomNumber);
        }

        if (
            characterArray[randomCharacters[i]] &&
            characterArray[randomCharacters[i]].name &&
            !charactersPerRound.some((character) => character.name === characterArray[randomNumber].name)
        ) {
            let newCharacter: {
                id: ObjectId;
                name: string | undefined;
                correctCharacter: boolean;
            } = {
                id: characterArray[randomCharacters[i]]._id,
                name: characterArray[randomCharacters[i]].name,
                correctCharacter: false,
            };
            charactersPerRound.push(newCharacter);
        } else {
            i--;
            randomCharacters.pop();
        }
    }

    // Fisher-Yates shuffle
    for (let k = charactersPerRound.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [charactersPerRound[k], charactersPerRound[j]] = [charactersPerRound[j], charactersPerRound[k]];
    }

    characters.push(...charactersPerRound.filter((m) => m !== undefined));
}
async function generateMovies(req: express.Request) {
    let randomMovies: number[] = [];
    let moviesPerRound: {
        id: ObjectId;
        name: string | undefined;
        correctMovie: boolean;
    }[] = [];

    // Voeg juiste film toe
    let rightMovieFind: Movies | undefined = movieArray.find((element) =>
        new ObjectId(element._id).equals(new ObjectId(quotesSuddenDeath[0].movie))
    );
    if (rightMovieFind !== undefined) {
        let rightMovie: {
            id: ObjectId;
            name: string | undefined;
            correctMovie: boolean;
        } = {
            id: new ObjectId(quotesSuddenDeath[0].movie),
            name: rightMovieFind?.name,
            correctMovie: true,
        };
        moviesPerRound.push(rightMovie);
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

    // Voeg 2 foute films toe (met i i.p.v. j)
    for (let i: number = 0; i < 2; i++) {
        if (
            randomMovies[i] !== undefined &&
            movieArray[randomMovies[i]]._id !== undefined &&
            movieArray[randomMovies[i]].name !== undefined
        ) {
            let newMovie: {
                id: ObjectId;
                name: string | undefined;
                correctMovie: boolean;
            } = {
                id: movieArray[randomMovies[i]]._id,
                name: movieArray[randomMovies[i]].name,
                correctMovie: false,
            };

            moviesPerRound.push(newMovie);
        } else {
            i--;
            randomMovies.pop();
        }
    }

    // Fisher-Yates shuffle
    for (let k = moviesPerRound.length - 1; k > 0; k--) {
        const j = Math.floor(Math.random() * (k + 1));
        [moviesPerRound[k], moviesPerRound[j]] = [moviesPerRound[j], moviesPerRound[k]];
    }

    movies.push(...moviesPerRound.filter((m) => m !== undefined));
}
export function stoppedSuddenDeath() {
    finishedSuddenDeath = false;
}