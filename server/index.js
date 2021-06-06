const express = require("express");
const router = express.Router();
const app = express();
require("dotenv").config({ path: __dirname + "/.env" });
const cors = require("cors");
const PORT = process.env.PORT || 3001;
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const mysql = require("mysql");
const { sign } = require("jsonwebtoken");
const { validateToken } = require('./middlewares/AuthMiddleware');

app.use(express.json());
app.use(
	cors({
		origin: ["http://localhost:3000"],
		methods: ["GET", "POST", "PUT", "DELETE"]
	})
);
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createPool({
	host: process.env.HOST,
	user: process.env.DB_USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
	insecureAuth: true
});

const saltRounds = 10;

app.post("/api/registeruser", (req, res) => {
	const { username, password } = req.body;

	db.query(
		"SELECT username FROM user WHERE username = ?",
		username,
		(err, result) => {
			if (err) {
				console.log(err);
				res.json(err);
			} else if (result.length > 0) {
				res.json({
					message: "This username is already exist!",
					success: false
				});
			} else {
				const sqlInsert =
					"INSERT INTO user SET username = ?, password = ?;";

				bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
					if (err) {
						console.log(err);
						res.json(err);
					}

					db.query(
						sqlInsert,
						[username, hashedPassword],
						(err, result) => {
							if (err) {
								console.log(err);
								res.json(err);
							}

							res.json({
								message: "Successful registration",
								success: true
							});
						}
					);
				});
			}
		}
	);
});

app.get('/auth', validateToken, (req, res) => {
	res.json(req.user);
});

app.post("/api/loginuser", (req, res) => {
	const { username, password } = req.body;

	const sqlSelect = "SELECT * FROM user WHERE username = ?;";

	db.query(sqlSelect, username, (err, result) => {
		if (err) {
			res.json(err);
			console.log(err);
		}

		if (result.length > 0) {
			bcrypt.compare(password, result[0].password, (error, response) => {
				if (!response) {
					res.json({ error: "Wrong username or password!" });
				} else if (response) {
					const accessToken = sign(
						{ username: result[0].username, id: result[0].id },
						"tOkEnSeCrEt"
					);

                    res.json({
                        token: accessToken,
                        username: username,
                        id: result[0].id
                    });
				}
			});
		} else {
			res.json({ error: "Wrong credentials!" });
			console.log("Wrong credentials");
		}
	});
});

app.listen(PORT, () => {
	console.log(`App is listening on PORT ${PORT}`);
});
