const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cookieSession({
    name: "session",
    keys: ["clef-secrete-volontairement-faible"], // volontairement faible, app de démo
    maxAge: 24 * 60 * 60 * 1000
  })
);

// "Base de données" en mémoire — volontairement simple et non sécurisée
// pour servir de cible d'entraînement pentest.
const USERS = {
  admin: "admin"
};

// AUCUNE limitation de tentatives, AUCUN captcha, AUCUN verrouillage de compte.
// C'est fait exprès : cette app sert de cible d'entraînement pour des outils
// comme Hydra, Burp Intruder, etc.

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (USERS[username] && USERS[username] === password) {
    req.session.user = username;
    return res.redirect("/dashboard");
  }

  // Message d'échec EXACT et constant (utile comme "failure string" pour Hydra)
  return res.status(200).send(renderLogin("Identifiants invalides."));
});

app.get("/dashboard", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.send(`
    <html>
      <head><title>Dashboard</title></head>
      <body style="font-family: sans-serif; text-align:center; margin-top:50px;">
        <h1>Bienvenue, ${req.session.user} !</h1>
        <p>Connexion réussie. Ceci est une cible d'entraînement pentest.</p>
        <a href="/logout">Se déconnecter</a>
      </body>
    </html>
  `);
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

function renderLogin(errorMsg) {
  return `
  <html>
    <head><title>Connexion</title></head>
    <body style="font-family: sans-serif; max-width:400px; margin:80px auto;">
      <h2>Connexion</h2>
      ${errorMsg ? `<p style="color:red;">${errorMsg}</p>` : ""}
      <form method="POST" action="/login">
        <label>Nom d'utilisateur</label><br/>
        <input type="text" name="username" /><br/><br/>
        <label>Mot de passe</label><br/>
        <input type="password" name="password" /><br/><br/>
        <button type="submit">Se connecter</button>
      </form>
    </body>
  </html>
  `;
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Serveur de login (vulnérable, à but pédagogique) démarré sur le port ${PORT}`);
});
