import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { AuthContext } from "../helpers/AuthContext";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import ChatIcon from "@material-ui/icons/Chat";

function Home() {
	const [listOfPosts, setListOfPosts] = useState([]);
	const [likedPosts, setLikedPosts] = useState([]);
	const { authState } = useContext(AuthContext);

	let history = useHistory();

	useEffect(() => {
		if (!localStorage.getItem("accessToken")) {
			history.push("/login");
		} else {
			axios
				.get("http://localhost:3001/getposts", {
					headers: {
						accessToken: localStorage.getItem("accessToken")
					}
				})
				.then(response => {
					setListOfPosts(response.data.listOfPosts);
					setLikedPosts(
						response.data.likedPosts.map(like => {
							return like.post_id;
						})
					);
				});
		}
	}, []);

	const likePost = postId => {
		axios
			.post(
				"http://localhost:3001/like",
				{
					postId: postId
				},
				{
					headers: {
						accessToken: localStorage.getItem("accessToken")
					}
				}
			)
			.then(response => {
				setListOfPosts(
					listOfPosts.map(post => {
						if (post.post_id === postId) {
							if (response.data.isLiked) {
								return { ...post, Likes: [...post.Likes, 0] };
							} else {
								const likesArray = post.Likes;
								likesArray.pop();

								return { ...post, Likes: likesArray };
							}
						} else {
							return post;
						}
					})
				);

				if (likedPosts.includes(postId)) {
					setLikedPosts(
						likedPosts.filter(id => {
							return id != postId;
						})
					);
				} else {
					setLikedPosts([...likedPosts, postId]);
				}
			});
	};

	const formatDate = date => {
		let newDate = new Date(date),
			month = `${newDate.getMonth() + 1}`,
			day = `${newDate.getDate()}`,
			year = newDate.getFullYear();

		if (month.length < 2) {
			month = `0${month}`;
		}

		if (day.length < 2) {
			day = `0${day}`;
		}

		return [year, month, day].join("-");
	};

	return (
		<div className="homePageContainer">
			<Navbar />
			{listOfPosts.length === 0
				? <div className="noPostsDiv" align="center">
						<p>Be the first,</p>
						<button
							className="homePageCreatePostButton"
							onClick={() => {
								history.push("/createpost");
							}}
						>
							create a post!
						</button>
					</div>
				: listOfPosts.map((post, index) => {
						return (
							<div className="postDiv" key={index}>
								<div className="postTitle">
									{post.title}
								</div>

								<div
									className="postContent"
									onClick={() => {
										history.push(`/posts/${post.post_id}`);
									}}
								>
									{post.content}
								</div>

								<div className="postFooter">
									<div className="usernameDiv">
										<Link
											className="usernameLink"
											to={`/profile/${post.user_id}`}
										>
											<span className="username">
												{post.username}
											</span>
										</Link>
									</div>
									<div className="postDate">
										{formatDate(post.created_at)}
										<div className="commentCounterDiv">
											<ChatIcon
												className="commentsIcon"
												onClick={() => {
													history.push(
														`/posts/${post.post_id}`
													);
												}}
											/>
											<label>
												{post.Comments}
											</label>
										</div>

										<div className="likeButtons">
											{likedPosts.includes(post.post_id)
												? <FavoriteIcon
														className="likeButton"
														onClick={() =>
															likePost(post.post_id)}
													/>
												: <FavoriteBorderIcon
														className="likeButton"
														onClick={() => {
															likePost(post.post_id);
														}}
													/>}
											<label>
												{post.Likes.length}
											</label>
										</div>
									</div>
								</div>
							</div>
						);
					})}
		</div>
	);
}

export default Home;
