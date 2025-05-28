import { Characters, Movies, Quotes } from "./interfaces/types";

const quotesApi: string = "https://the-one-api.dev/v2/quote";
export let quotesArray: Quotes[] = [];

const movieApi: string = "https://the-one-api.dev/v2/movie";
export let movieArray: Movies[] = [];

const characterApi: string = "https://the-one-api.dev/v2/character";
export let characterArray: Characters[] = [];

export async function getQuotes() {
    const response = await fetch(quotesApi, {
        headers: {
            Authorization: `Bearer ${process.env.API_KEY}`
        }
    });
    const jsonData = await response.json();
    quotesArray = jsonData.docs;
}

export async function getMovies() {
    const response = await fetch(movieApi, {
        headers: {
            Authorization: `Bearer ${process.env.API_KEY}`
        }
    });
    const jsonData = await response.json();
    movieArray = jsonData.docs;
}

export async function getCharacters() {
    const response = await fetch(characterApi, {
        headers: {
            Authorization: `Bearer ${process.env.API_KEY}`
        }
    });
    const jsonData = await response.json();
    characterArray = jsonData.docs;
}