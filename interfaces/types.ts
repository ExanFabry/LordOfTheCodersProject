import { ObjectId } from "mongodb";

export interface User {
    _id?: ObjectId;
    email: string;
    password?: string;
    role: "ADMIN" | "USER";
}

export interface FlashMessage {
    type: "error" | "success"
    message: string;
}

export interface SessionData {
    user?: User;
    message?: FlashMessage;
}

export interface Quotes {
    _id: ObjectId;
    dialog: string;
    movie: string;
    character: string;
    id: string;
}

export interface Movies{
    _id: ObjectId;
    name: string;
    runtimeInMinutes: number;
    budgetInMillions: number;
    boxOfficeRevenueInMillions: number;
    academyAwardNominations: number;
    academyAwardWins: number;
    rottenTomatoesScore: number;
}

export interface Characters {
    _id: ObjectId;
    name: string;
    wikiUrl: string;
    race: string;
    birth: string;
    gender: string;
    death: string;
    hair: string;
    height: string;
    realm: string;
    spouse: string;
}

export interface FavoriteQuote {
    quote: string;
    character: string;
    user: User | undefined;
    movie: string;
}

export interface Answer {
    quote: string;
    character: string;
    user: User | undefined;
    reason: string;
}