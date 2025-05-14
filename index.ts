import express from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import path, { format } from "path";
import { connect } from "./database";
import session from "./session";
import { User } from "./interfaces/types";
import { login } from "./database";
import { flashMiddleware } from "./flashMiddleware";

//Import routers
import loginRouter from "./routers/loginRouter";
import registerRouter from "./routers/registerRouter";
import homeRouter from "./routers/homeRouter";
import tenRoundsRouter from "./routers/10-rounds";
import blacklistRouter from "./routers/blacklist";
import favoriteRouter from "./routers/favorite";
import highscoreRouter from "./routers/highscore";
import mistakesRouter from "./routers/mistakes";
import resultRouter from "./routers/result";
import suddendeathRouter from "./routers/suddendeath";
import indexRouter from "./routers/index";
import invalidPageRouter from "./routers/404";

const app = express();

app.use(express.static("public"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 4000);
app.use(session);
app.use(flashMiddleware);
dotenv.config();
//Routers
app.use("/login", loginRouter());
app.use("/register", registerRouter());
app.use("/home", homeRouter());
app.use("/10-rounds", tenRoundsRouter());
app.use("/blacklist", blacklistRouter());
app.use("/favorite", favoriteRouter());
app.use("/highscore", highscoreRouter());
app.use("/mistakes", mistakesRouter());
app.use("/result", resultRouter());
app.use("/suddendeath", suddendeathRouter());
app.use("/404", invalidPageRouter());
app.use("/", indexRouter());

app.post("/login", async (req, res) => {
  const email: string = req.body.email;
  const password: string = req.body.password;
  try {
    let user: User = await login(email, password);
    delete user.password;
    req.session.user = user;
    res.redirect("/")
  } catch (e: any) {
    res.redirect("/login");
  }
});
app.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});
app.use((req, res) => {
  res.redirect("/404");
});

app.listen(app.get("port"), async () => {
  try {
    await connect();
    console.log("Server started on http://localhost:" + app.get('port'));
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
});