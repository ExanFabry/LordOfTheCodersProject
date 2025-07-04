import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
import { Answer, Characters, FavoriteQuote, User } from "./interfaces/types";
import bcrypt from "bcrypt";
import { quotes } from "./routers/10-rounds";
import 'express-session';
import { Request } from "express";
import { ObjectId } from "mongodb";
import { characterArray, movieArray } from "./api";

export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";

export const client = new MongoClient(MONGODB_URI);

export const userCollection = client.db("login-express").collection<User>("users");

const saltRounds: number = 10;

async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let email: string | undefined = process.env.ADMIN_EMAIL;
    let password: string | undefined = process.env.ADMIN_PASSWORD;
    if (email === undefined || password === undefined) {
        throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment");
    }
    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "ADMIN"
    });
}

export async function registerUser(email: string | undefined, password: string | undefined) {
    if (email === undefined || password === undefined) {
        throw new Error("Email and password must be set in environment");
    }
    await userCollection.insertOne({
        email: email,
        password: await bcrypt.hash(password, saltRounds),
        role: "USER"
    });
}

async function exit() {
    try {
        await client.close();
        console.log("Disconnected from database");
    } catch (error) {
        console.error(error);
    }
    process.exit(0);
}

export async function connect() {
    await createInitialUser();
    await client.connect();
    console.log("Connected to database");
    process.on("SIGINT", exit);
}
export async function login(email: string, password: string) {
    if (email === "" || password === "") {
        throw new Error("Email and password required");
    }
    let user: User | null = await userCollection.findOne<User>({ email: email });
    if (user) {
        if (await bcrypt.compare(password, user.password!)) {
            return user;
        } else {
            throw new Error("Password incorrect");
        }
    } else {
        throw new Error("User not found");
    }
}

export async function addToFavorite(quoteObj: any, req: Request) {
    await client.connect();

    let favoriteQuote: FavoriteQuote = {
        quote: quoteObj.dialog,
        character: (() => {
            const foundCharacter = characterArray.find(c => c._id.toString() === quoteObj.character?.toString())?.name;
            return foundCharacter ? foundCharacter.toString() : (quoteObj.characterName || "Unknown Character");
        })(),
        movie: (() => {
            const foundMovie = movieArray.find(c => c._id.toString() === quoteObj.movie?.toString())?.name;
            return foundMovie ? foundMovie.toString() : (quoteObj.movieName || "Unknown Movie");
        })(),
        user: req.session.user
    };
    await client.db("Les").collection("favoriteQuotes").insertOne(favoriteQuote);
}

export async function addToBlacklist(quoteIndex: number, reason: string, req: Request) {
    await client.connect();

    // const quotes = req.session.quotes;
    // if (!quotes || !quotes[quoteIndex]) {
    //     throw new Error("Quote niet gevonden in sessie.");
    // }

    let blacklistQuote: Answer = {
        quote: quotes[quoteIndex].dialog,
        character: (() => {
            const foundCharacter = characterArray.find(c => c._id.toString() === quotes[quoteIndex].character.toString())?.name;
            return foundCharacter ? foundCharacter.toString() : "Unknown Character";
        })(),
        user: req.session.user,
        reason: reason

    };
    const result = await client.db("Les").collection("blacklistQuotes").insertOne(blacklistQuote);
    let readResult: Answer[] = await client.db("Les").collection("blacklistQuotes").find<Answer>({}).toArray();
    console.log(readResult);
}
export async function deleteFromBlacklist(id: string) {
    await client.connect();
    await client.db("Les").collection("blacklistQuotes").deleteOne({ _id: new ObjectId(id) });
}
export async function deleteFromFavorite(id: string) {
    await client.connect();
    await client.db("Les").collection("favoriteQuotes").deleteOne({ _id: new ObjectId(id) });
}