import express from "express";
import ejs from "ejs";
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
import indexRouter from "./routers";

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("port", process.env.PORT || 3000);

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
app.use("/", indexRouter());

app.listen(app.get("port"), () =>
  console.log("[server] http://localhost:" + app.get("port"))
);