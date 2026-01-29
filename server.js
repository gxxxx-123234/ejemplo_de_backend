const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Base de datos en memoria (simple)
const db = new sqlite3.Database(":memory:");

db.serialize(() => {
  db.run("CREATE TABLE users (username TEXT, password TEXT)");
  db.run("INSERT INTO users VALUES ('admin', 'admin123')");
});

// ❌ VULNERABLE A SQL INJECTION
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const query = `
    SELECT * FROM users 
    WHERE username = '${username}' 
    AND password = '${password}'
  `;

  db.get(query, (err, row) => {
    if (row) {
      res.send(`Bienvenido ${username}`);
    } else {
      res.send("Login incorrecto");
    }
  });
});

// ❌ VULNERABLE A XSS (reflejado)
app.get("/saludo", (req, res) => {
  const nombre = req.query.nombre;
  res.send(`<h1>Hola ${nombre}</h1>`);
});

// ❌ SIN AUTENTICACIÓN / AUTORIZACIÓN
app.get("/admin", (req, res) => {
  res.send("Panel de administrador 🔓");
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
