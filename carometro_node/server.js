//import biblioteca
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");
const { ifError } = require("assert");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar com banco de dados", err);
    return;
  }
  console.log("conectado com banco de dados👌😁😁👍");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`servidor está rodadndo na porta ${PORT}`));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const authenticateSession = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send("Acesso negado, faça login para continuar");
  }
  next();
};

app.post("/login", (req, res) => {
  const { cpf, senha } = req.body;

  db.query(
    "SELEC * FROM usuarios WHERE cpf = ?",
    [cpf],
    async (err, results) => {
      if (err) return res.status(500).send("Servidor com erro");

      if (results.length === 0)
        return res.status(500).send("CPF ou senha incorretos");

      const usuario = results[0];
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) return res.status(500).send("CPF ou senha incorretos");

      req.session.userId = usuario.idUsuarios;
      console.log("idUsuarios:", usuario.idUsuarios);
      res.json({ message: "Login bem-sucedido" });
    }
  );
});
