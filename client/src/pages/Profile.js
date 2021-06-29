import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import FavoriteIcon from "@material-ui/icons/Favorite";
import { AuthContext } from "../helpers/AuthContext";
import Navbar from "../shared/Navbar";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import Tooltip from "@material-ui/core/Tooltip";
import ChatIcon from "@material-ui/icons/Chat";

function Profile() {
	let { id } = useParams();
	const [username, setUsername] = useState("");
	const [listOfPosts, setListOfPosts] = useState([]);
	const { authState } = useContext(AuthContext);
	let history = useHistory();

	useEffect(() => {
		axios.get(`http://localhost:3001/info/${id}`).then(response => {
			setUsername(response.data[0].username);
		});

		axios
			.get(`http://localhost:3001/post/byUserId/${id}`)
			.then(response => {
				setListOfPosts(response.data);
			});
	}, []);

	return (
		<div className="profilePageContainer">
			<Navbar />
			<div className="basicInfoContainer" align="center">
				<h2>
					Username: {username}
					{authState.username === username &&
						<Tooltip title="Edit credentials">
							<EditOutlinedIcon
								className="editCredentialsIcon"
								onClick={() => {
									history.push("/changecredentials");
								}}
							/>
						</Tooltip>}
				</h2>
			</div>

			<div className="userPostsTitleDiv" align="center">
				<h2>
					{username}'s posts:
				</h2>
			</div>

			<div className="listOfUserPosts">
				{listOfPosts.map((post, index) => {
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
									<span className="username">
										{post.username}
									</span>
								</div>

								<div className="postDate">
									{`${new Date(
										post.created_at
									).getFullYear()}-${new Date(
										post.created_at
									).getMonth() + 1}-${new Date(
										post.created_at
									).getDate()}`}

									<div className="commentCounterDiv">
									<ChatIcon className="commentsIcon" onClick={() => {
										history.push(`/posts/${post.post_id}`);
									}} />
									<label>
										{post.Comments}
									</label>
								</div>

									<div className="likeButtons">
										<FavoriteIcon className="likeButton" />
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
		</div>
	);
}

export default Profile;
