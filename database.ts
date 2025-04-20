import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
import { BlacklistQuote, FavoriteQuote, User } from "./interfaces/types";
import bcrypt from "bcrypt";
import { quotes } from "./routers/10-rounds";
import 'express-session';
import { Request } from "express";

export const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://localhost:27017";

export const client = new MongoClient(MONGODB_URI);

export const userCollection = client.db("login-express").collection<User>("users");

const saltRounds : number = 10;

async function createInitialUser() {
    if (await userCollection.countDocuments() > 0) {
        return;
    }
    let email : string | undefined = process.env.ADMIN_EMAIL;
    let password : string | undefined = process.env.ADMIN_PASSWORD;
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
    let user : User | null = await userCollection.findOne<User>({email: email});
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

export async function addToFavorite(quote: number, req: Request){
    await client.connect();
 
    let favoriteQuote: FavoriteQuote = { 
        quote:quotes[quote].dialog, 
        character: quotes[quote].character,
        user: req.session.user
    };
    const result = await client.db("Les").collection("favoriteQuotes").insertOne(favoriteQuote);
    let readResult: FavoriteQuote[] = await (client.db("Les").collection("favoriteQuotes").find<FavoriteQuote>({})).toArray();
    console.log(readResult);
}

export async function addToBlacklist(quote: number, reason: string, req: Request){
    await client.connect();
    
    let blacklistQuote: BlacklistQuote = { 
        quote:quotes[quote].dialog, 
        character: quotes[quote].character,
        user: req.session.user,
        reason: "Vind deze quote niet leuk"
    };
    const result = await client.db("Les").collection("blacklistQuotes").insertOne(blacklistQuote);
    let readResult: BlacklistQuote[] = await (client.db("Les").collection("blacklistQuotes").find<BlacklistQuote>({})).toArray();
    console.log(readResult);
}