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
const { validateToken } = require("./middlewares/AuthMiddleware");

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

app.get("/auth", validateToken, (req, res) => {
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

app.post("/createpost", validateToken, (req, res) => {
	const post = req.body;
	const userId = req.user.id;
	const username = req.user.username;

	const insertQuery =
		"INSERT INTO post SET user_id = ?, title = ?, content = ?, created_at = NOW(), username = ?;";

	db.query(
		insertQuery,
		[userId, post.title, post.content, username],
		(err, result) => {
			if (err) {
				console.log(err);
				res.json({ error: err });
			} else if (result) {
				res.json({ success: "Created the post!" });
			}
		}
	);
});

app.get("/getposts", validateToken, (req, res) => {
	const userId = req.user.id;
	const selectPostsQuery =
		"SELECT * FROM post WHERE user_id = ? ORDER BY created_at DESC;";
	const selectLikesQuery = "SELECT * FROM likes WHERE user_id = ?;";

	db.query(selectPostsQuery, userId, (err, result) => {
		if (err) {
			console.log(err);
			res.json({ error: err });
		} else if (result) {
			db.query(selectLikesQuery, userId, (likeError, likeResult) => {
				let listOfPosts = JSON.parse(JSON.stringify(result));
				const likedPosts = JSON.parse(JSON.stringify(likeResult));
				let belongingLike = [];

				likedPosts.forEach(like => {
					listOfPosts = listOfPosts.map(row => {
						if (like.post_id == row.post_id) {
							belongingLike.push(like);
						} else {
							belongingLike = [];
						}

						return Object.assign({}, row, {
							Likes: belongingLike
						});
					});
				});

				res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
			});
		}
	});
});

app.post("/like", validateToken, (req, res) => {
	const { postId } = req.body;
	const userId = req.user.id;

	const selectTheLike =
		"SELECT * FROM likes WHERE post_id = ? AND user_id = ?;";

	db.query(selectTheLike, [postId, userId], (err, result) => {
		if (result.length > 0) {
			const deleteQuery =
				"DELETE FROM likes WHERE post_id = ? AND user_id = ?;";

			db.query(
				deleteQuery,
				[postId, userId],
				(deleteError, deleteResult) => {
					if (deleteError) {
						console.log(deleteError);
						res.json({
							error: "There was an error with the dislike!"
						});
					} else if (deleteResult) {
						res.json({ isLiked: false });
					}
				}
			);
		} else {
			const insertQuery =
				"INSERT INTO likes SET post_id = ?, user_id = ?;";

			db.query(
				insertQuery,
				[postId, userId],
				(insertError, insertResult) => {
					if (insertError) {
						console.log(insertError);
						res.json({
							error: "There was an error with the like!"
						});
					} else if (insertResult) {
						res.json({ isLiked: true });
					}
				}
			);
		}
	});
});

app.listen(PORT, () => {
	console.log(`App is listening on PORT ${PORT}`);
});
