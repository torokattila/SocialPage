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
	insecureAuth: true,
	multipleStatements: true
});

setInterval(function() {
	db.query("SELECT 1");
}, 4500);

db.query("USE " + db.database);

db.query(
	"CREATE TABLE IF NOT EXISTS `user`" +
		"(" +
		"`id` int(6) unsigned AUTO_INCREMENT PRIMARY KEY, " +
		"`username` varchar(50), " +
		"`password` varchar(255), " +
		"`postId` int(6) unsigned, " +
		"`commentId` int(6) unsigned " +
		");"
);

db.query(
	"CREATE TABLE IF NOT EXISTS `post` ( " +
		"`post_id` int(6) unsigned AUTO_INCREMENT PRIMARY KEY, " +
		"`user_id` int(6) unsigned, " +
		"`title` varchar(255), " +
		"`content` text, " +
		"`created_at` datetime, " +
		"`username` varchar(255) " +
		");"
);

db.query(
	"CREATE TABLE IF NOT EXISTS `likes` ( " +
		"`like_id` int(6) unsigned AUTO_INCREMENT PRIMARY KEY, " +
		"`post_id` int(6) unsigned, " +
		"`user_id` int(6) unsigned " +
		");"
);

db.query(
	"CREATE TABLE IF NOT EXISTS `comments` ( " + 
	"`id` int(6) unsigned AUTO_INCREMENT PRIMARY KEY, " + 
	"`post_id` int(6) unsigned, " + 
	"`user_id` int(6) unsigned," + 
	"`username` varchar(255), " + 
	"`created_at` datetime, " + 
	"`content` text " + 
	");"
);

db.query(
	"CREATE TABLE IF NOT EXISTS `comment_likes` ( " + 
	"`like_id` int(6) unsigned AUTO_INCREMENT PRIMARY KEY, " + 
	"`comment_id` int(6) unsigned, " + 
	"`user_id` int(6) unsigned " + 
	");"
);

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
	const userId = req.user.id;
	const getUsernameQuery = "SELECT username FROM user WHERE id = ?";

	db.query(getUsernameQuery, userId, (error, result) => {
		if (error) {
			console.log(error);
			res.json({ error: "User does not exist!" });
		} else if (result.length > 0) {
			res.json({ user: req.user, username: result[0].username });
		}
	});
});

app.post("/api/loginuser", (req, res) => {
	const { username, password } = req.body;

	const sqlSelect = "SELECT * FROM user WHERE username = ?;";

	if (username === "" && password === "") {
		res.json({
			error: "You have to fill both username and password field!"
		});
	} else if (username === "" && password !== "") {
		res.json({ error: "Please fill the username field!" });
	} else if (username !== "" && password === "") {
		res.json({ error: "Please fill the password field!" });
	} else {
		db.query(sqlSelect, username, (err, result) => {
			if (err) {
				res.json(err);
				console.log(err);
			}

			if (result.length > 0) {
				bcrypt.compare(
					password,
					result[0].password,
					(error, response) => {
						if (!response) {
							res.json({ error: "Wrong username or password!" });
						} else if (response) {
							const accessToken = sign(
								{ id: result[0].id },
								"tOkEnSeCrEt"
							);

							res.json({
								token: accessToken,
								username: username,
								id: result[0].id
							});
						}
					}
				);
			} else {
				res.json({ error: "Wrong credentials!" });
				console.log("Wrong credentials");
			}
		});
	}
});

app.post("/createpost", validateToken, (req, res) => {
	const post = req.body;
	const userId = req.user.id;
	const username = req.body.username;

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
		"SELECT post.post_id, post.user_id, post.title, post.content, post.created_at, post.username, IFNULL(GROUP_CONCAT(likes.post_id), '') AS Likes, IFNULL(GROUP_CONCAT(likes.user_id), '') AS like_user_id, (SELECT COUNT(post_id) AS comment_counts FROM comments WHERE comments.post_id = post.post_id) AS Comments FROM post AS post LEFT OUTER JOIN likes AS likes ON post.post_id = likes.post_id GROUP BY post_id ORDER BY post.created_at DESC;";
	const selectLikesQuery = "SELECT * FROM likes WHERE user_id = ?;";

	db.query(selectPostsQuery, (err, result) => {
		if (err) {
			console.log(err);
			res.json({ error: err });
		} else if (result) {
			var listOfPosts = JSON.parse(JSON.stringify(result));
			var likedPosts = [];

			listOfPosts = listOfPosts.map(post => {
				post.Likes =
					post.Likes == ""
						? []
						: post.Likes.includes(",")
							? post.Likes.split(",")
							: [post.Likes];

				post.like_user_id =
					post.like_user_id == ""
						? []
						: post.like_user_id.includes(",")
							? post.like_user_id
									.split(",")
									.map(userId => Number(userId))
							: [Number(post.like_user_id)];

				return post;
			});

			db.query(selectLikesQuery, userId, (likeError, likeResult) => {
				if (likeResult.length > 0) {
					likedPosts = JSON.parse(JSON.stringify(likeResult));
				} /*else {
					listOfPosts = listOfPosts.map(post => {
						post.Likes = [];
						post.like_user_id = [];

						return post;
					});

					likedPosts = [];
				}*/

				res.json({
					listOfPosts: listOfPosts,
					likedPosts: likedPosts
				});
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

app.post("/commentlike", validateToken, (req, res) => {
	const { commentId } = req.body;
	const userId = req.user.id;

	const selectTheCommentLike =
		"SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?";

	db.query(selectTheCommentLike, [commentId, userId], (error, result) => {
		if (result.length > 0) {
			const deleteQuery =
				"DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?";

			db.query(
				deleteQuery,
				[commentId, userId],
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
			const insertCommentLikeQuery =
				"INSERT INTO comment_likes SET comment_id = ?, user_id = ?";

			db.query(
				insertCommentLikeQuery,
				[commentId, userId],
				(insertError, insertResult) => {
					if (insertError) {
						console.log(insertError);
						res.json({
							error: "There was an error with the liking!"
						});
					} else if (insertResult) {
						res.json({ isLiked: true });
					}
				}
			);
		}
	});
});

app.get("/info/:id", (req, res) => {
	const userId = req.params.id;

	const userInfoQuery = "SELECT id, username FROM user WHERE id = ?";

	db.query(userInfoQuery, userId, (error, result) => {
		if (error) {
			console.log(error);
			res.json({
				error: "There was an error with getting the user infos!"
			});
		} else if (result.length > 0) {
			res.json(result);
		}
	});
});

app.get("/post/byUserId/:id", (req, res) => {
	const userId = req.params.id;

	const selectPostsQuery =
		"SELECT post.post_id, post.user_id, post.title, post.content, post.created_at, post.username, IFNULL(GROUP_CONCAT(likes.post_id), '') AS Likes, IFNULL(GROUP_CONCAT(likes.user_id), '') AS like_user_id, (SELECT COUNT(post_id) AS comment_counts FROM comments WHERE comments.post_id = post.post_id) AS Comments FROM post AS post LEFT OUTER JOIN likes AS likes ON post.post_id = likes.post_id WHERE post.user_id = ? GROUP BY post_id ORDER BY post.created_at DESC;";

	db.query(selectPostsQuery, userId, (err, result) => {
		if (err) {
			console.log(err);
			res.json({ error: err });
		} else if (result) {
			var listOfPosts = JSON.parse(JSON.stringify(result));

			listOfPosts = listOfPosts.map(post => {
				post.Likes =
					post.Likes == ""
						? []
						: post.Likes.includes(",")
							? post.Likes.split(",")
							: [post.Likes];

				post.like_user_id =
					post.like_user_id == ""
						? []
						: post.like_user_id.includes(",")
							? post.like_user_id
									.split(",")
									.map(userId => Number(userId))
							: [Number(post.like_user_id)];

				return post;
			});

			res.json(listOfPosts);
		}
	});
});

app.put("/changecredentials", validateToken, (req, res) => {
	const { oldUsername, newUsername, oldPassword, newPassword } = req.body;
	const userId = req.user.id;
	const getUserQuery = "SELECT * FROM user WHERE username = ?";

	db.query(getUserQuery, oldUsername, (err, result) => {
		if (err) {
			console.log(err);
			res.json({ error: "There is no user with this username!" });
		} else if (result.length > 0) {
			if (
				newUsername !== "" &&
				oldPassword === "" &&
				newPassword === ""
			) {
				const updateUsernameQuery =
					"UPDATE user, post SET user.username = ?, post.username = ? WHERE user.id = ? AND post.user_id = ?";

				db.query(
					updateUsernameQuery,
					[newUsername, newUsername, userId, userId],
					(usernameUpdateError, usernameUpdateResult) => {
						if (usernameUpdateError) {
							console.log(usernameUpdateError);
							res.json({
								error:
									"There was an error during the username update! Please try again!"
							});
						} else if (usernameUpdateResult) {
							res.json({
								successMessage: "Username updated successfully!"
							});
						}
					}
				);
			} else if (newUsername === "") {
				if (oldPassword === "" || newPassword == "") {
					res.json({
						error:
							"You have to fill both old password and new password fields!"
					});
				} else {
					bcrypt.compare(
						oldPassword,
						result[0].password,
						(compareError, compareResult) => {
							if (compareError) {
								console.log(compareError);
								res.json({
									error:
										"There was an error with your old password!"
								});
							} else if (compareResult) {
								bcrypt.hash(
									newPassword,
									saltRounds,
									(hashError, hashedPassword) => {
										if (hashError) {
											console.log(hashError);
											res.json({ error: hashError });
										}

										const updatePasswordQuery =
											"UPDATE user SET password = ? WHERE id = ?";

										db.query(
											updatePasswordQuery,
											[hashedPassword, userId],
											(updateError, updateResult) => {
												if (updateError) {
													console.log(updateError);
													res.json({
														error:
															"There was an error with the update, try again please!"
													});
												} else if (updateResult) {
													res.json({
														successMessage:
															"Password updated successfully!"
													});
												}
											}
										);
									}
								);
							}
						}
					);
				}
			}
		}
	});
});

app.get("/posts/byId/:id", (req, res) => {
	const postId = req.params.id;
	const getSpecificPostQuery = "SELECT * FROM post WHERE post_id = ?";

	db.query(getSpecificPostQuery, postId, (error, result) => {
		if (error) {
			console.log(error);
			res.json("There is no post with this post id!");
		} else if (result.length > 0) {
			res.json(JSON.parse(JSON.stringify(result))[0]);
		}
	});
});

app.post("/comment", validateToken, (req, res) => {
	const comment = req.body;
	const insertCommentQuery =
		"INSERT INTO comments SET post_id = ?, user_id = ?, username = ?, created_at = NOW(), content = ?";

	if (comment.commentContent === "") {
		res.json({ error: "Add some text to the comment!" });
	} else {
		db.query(
			insertCommentQuery,
			[
				comment.postId,
				req.user.id,
				comment.username,
				comment.commentContent
			],
			(error, result) => {
				if (error) {
					console.log(error);
					res.json({ error: error });
				} else if (result) {
					res.json(comment);
				}
			}
		);
	}
});

app.get("/comments/:postId", validateToken, (req, res) => {
	const postId = req.params.postId;
	const userId = req.user.id;
	const getSpecificCommentsQuery =
		"SELECT comments.id, comments.post_id, comments.user_id, comments.username, comments.created_at, comments.content, IFNULL(GROUP_CONCAT(comment_likes.comment_id), '') AS Likes, IFNULL(GROUP_CONCAT(comment_likes.user_id), '') AS comment_like_user_id FROM comments AS comments LEFT OUTER JOIN comment_likes AS comment_likes ON comments.id = comment_likes.comment_id WHERE comments.post_id = ? GROUP BY comments.id ORDER BY comments.created_at DESC";
	const selectCommentLikesQuery =
		"SELECT * FROM comment_likes WHERE user_id = ?;";

	db.query(getSpecificCommentsQuery, postId, (error, result) => {
		if (error) {
			console.log(error);
			res.json({
				error: "There was an error with getting the comments!"
			});
		} else if (result) {
			var listOfComments = JSON.parse(JSON.stringify(result));
			var likedComments = [];

			listOfComments = listOfComments.map(comment => {
				comment.Likes =
					comment.Likes == ""
						? []
						: comment.Likes.includes(",")
							? comment.Likes.split(",")
							: [comment.Likes];

				comment.comment_like_user_id =
					comment.comment_like_user_id == ""
						? []
						: comment.comment_like_user_id.includes(",")
							? comment.comment_like_user_id
									.split(",")
									.map(userid => Number(userid))
							: [Number(comment.like_user_id)];

				return comment;
			});

			db.query(
				selectCommentLikesQuery,
				userId,
				(commentLikeError, commentLikeResult) => {
					if (commentLikeResult.length > 0) {
						likedComments = JSON.parse(
							JSON.stringify(commentLikeResult)
						);
					}

					res.json({
						listOfComments: listOfComments,
						likedComments: likedComments
					});
				}
			);
		}
	});
});

app.delete("/deletecomment/:commentId", validateToken, (req, res) => {
	const commentId = req.params.commentId;
	const deleteCommentQuery =
		"DELETE FROM comments WHERE id = ?; DELETE FROM comment_likes WHERE comment_id = ?;";

	db.query(deleteCommentQuery, [commentId, commentId], (error, result) => {
		if (error) {
			console.log(error);
			res.json({ error: "There is no comment with this id!" });
		} else if (result) {
			res.json("Comment has been deleted!");
		}
	});
});

app.delete("/deletepost/:postId", validateToken, (req, res) => {
	const postId = req.params.postId;
	const deletePostQuery =
		"DELETE FROM post WHERE post_id = ?; DELETE FROM likes WHERE post_id = ?; DELETE FROM comments WHERE post_id = ?;";

	db.query(deletePostQuery, [postId, postId, postId], (error, result) => {
		if (error) {
			console.log(error);
			res.json({
				error:
					"There was an error with deleting this post, try again please!"
			});
		} else if (result) {
			res.json("Post deleted!");
		}
	});
});

app.put("/edittitle", validateToken, (req, res) => {
	const { newTitle, postId } = req.body;
	const updatePostTitleQuery = "UPDATE post SET title = ? WHERE post_id = ?";

	db.query(updatePostTitleQuery, [newTitle, postId], (error, result) => {
		if (error) {
			console.log(error);
			res.json({ error: error });
		} else if (result) {
			res.json("Title has been updated!");
		}
	});
});

app.put("/editcontent", validateToken, (req, res) => {
	const { newContent, postId } = req.body;
	const updatePostContentQuery =
		"UPDATE post SET content = ? WHERE post_id = ?";

	db.query(updatePostContentQuery, [newContent, postId], (error, result) => {
		if (error) {
			console.log(error);
			res.json({ error: error });
		} else if (result) {
			res.json("Content has been updated!");
		}
	});
});

app.listen(PORT, () => {
	console.log(`App is listening on PORT ${PORT}`);
});
