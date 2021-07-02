import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import axios from "axios";
import Navbar from "../shared/Navbar";
import DeleteIcon from "@material-ui/icons/Delete";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import Tooltip from "@material-ui/core/Tooltip";
import Swal from "sweetalert2";

function Post() {
	let { id } = useParams();
	const [postObject, setPostObject] = useState({});
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");
	const { authState } = useContext(AuthContext);
	let history = useHistory();

	useEffect(
		() => {
			axios
				.get(`http://localhost:3001/posts/byId/${id}`)
				.then(response => {
					setPostObject(response.data);
				});

			axios.get(`http://localhost:3001/comments/${id}`).then(response => {
				setComments(response.data);
			});
		},
		[id]
	);

	const addComment = () => {
		axios
			.post(
				"http://localhost:3001/comment",
				{
					username: authState.username,
					commentContent: newComment,
					postId: id
				},
				{
					headers: {
						accessToken: localStorage.getItem("accessToken")
					}
				}
			)
			.then(response => {
				if (response.data.error) {
					Swal.fire({
						title: "",
						text: response.data.error,
						type: "error"
					});
				} else {
					const commentToAdd = {
						content: response.data.commentContent,
						username: response.data.username
					};

					setComments([...comments, commentToAdd]);
					setNewComment("");
					window.location.reload();
				}
			});
	};

	const deleteComment = commentId => {
		Swal.fire({
			title: "Are you sure?",
			text: "Do you want to delete your comment?",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Yes!"
		}).then(response => {
			if (response.value) {
				axios
					.delete(
						`http://localhost:3001/deletecomment/${commentId}`,
						{
							headers: {
								accessToken: localStorage.getItem("accessToken")
							}
						}
					)
					.then(response => {
						if (response.data.error) {
							alert(response.data.error);
						} else {
							setComments(
								comments.filter(comment => {
									return comment.id !== commentId;
								})
							);
							window.location.reload();
						}
					});
			}
		});
	};

	const deletePost = postId => {
		Swal.fire({
			title: "Are you sure?",
			text: "Do you want to delete your post?",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Yes!"
		}).then(confirmResponse => {
			if (confirmResponse.value) {
				axios
					.delete(`http://localhost:3001/deletepost/${postId}`, {
						headers: {
							accessToken: localStorage.getItem("accessToken")
						}
					})
					.then(response => {
						if (response.data.error) {
							Swal.fire({
								title: "",
								text: response.data.error,
								type: "error"
							});
						} else {
							console.log(response);
							Swal.fire({
								title: "",
								text: response.data,
								type: "success"
							}).then(alertResponse => {
								if (alertResponse.value) {
									history.push("/");
								}
							});
						}
					});
			}
		});
	};

	const editPost = option => {
		if (option === "title") {
			Swal.fire({
				title: "Enter the new title:",
				input: "text",
				showCancelButton: true,
				closeOnConfirm: true,
				inputPlaceholder: "Your new title"
			}).then(inputResponse => {
				if (inputResponse.value) {
					axios
						.put(
							"http://localhost:3001/edittitle",
							{
								newTitle: inputResponse.value,
								postId: id
							},
							{
								headers: {
									accessToken: localStorage.getItem(
										"accessToken"
									)
								}
							}
						)
						.then(response => {
							if (response.data.error) {
								alert(
									"We were unable to update the title, please try again!"
								);
							} else {
								setPostObject({
									...postObject,
									title: inputResponse.value
								});
							}
						});
				}
			});
		} else {
			Swal.fire({
				title: "Enter the new content of the post:",
				input: "text",
				showCancelButton: true,
				closeOnConfirm: true,
				inputPlaceholder: "Your new content"
			}).then(inputResponse => {
				if (inputResponse.value) {
					axios
					.put(
						"http://localhost:3001/editcontent",
						{
							newContent: inputResponse.value,
							postId: id
						},
						{
							headers: {
								accessToken: localStorage.getItem("accessToken")
							}
						}
					)
					.then(response => {
						if (response.data.error) {
							alert(
								"We were unable to update the content, please try again!"
							);
						} else {
							setPostObject({
								...postObject,
								content: inputResponse.value
							});
						}
					});
				}
			});
		}
	};

	return (
		<div className="postPageContainer">
			<Navbar />
			<div className="postCommentContainer">
				<div className="leftSide">
					<div className="postDiv">
						<div
							className="postTitle"
							onClick={() => {
								if (
									authState.username === postObject.username
								) {
									editPost("title");
								}
							}}
						>
							{postObject.title}
							{authState.username === postObject.username &&
								<Tooltip title="Edit post title">
									<EditOutlinedIcon className="editTitleIcon" />
								</Tooltip>}
						</div>

						<div
							className="postContent"
							onClick={() => {
								if (
									authState.username === postObject.username
								) {
									editPost("content");
								}
							}}
						>
							{authState.username === postObject.username &&
								<Tooltip title="Edit post content">
									<EditOutlinedIcon className="editContentIcon" />
								</Tooltip>}
							{postObject.content}
						</div>

						<div className="postFooter">
							<div className="usernameDiv">
								<span className="username">
									{postObject.username}
								</span>
							</div>

							<div className="postDate">
								{`${new Date(
									postObject.created_at
								).getFullYear()}-${new Date(
									postObject.created_at
								).getMonth() + 1}-${new Date(
									postObject.created_at
								).getDate()}`}
							</div>

							{authState.username === postObject.username &&
								<div className="likeButtons">
									<DeleteIcon
										className="likeButton"
										onClick={() =>
											deletePost(postObject.post_id)}
									/>
								</div>}
						</div>
					</div>
				</div>

				<div className="rightSide">
					<div className="addCommentContainer">
						<h2>Add comment to this post:</h2>

						<input
							type="text"
							className="commentInput"
							placeholder="E.g. Nice post!"
							autoComplete="off"
							value={newComment}
							onChange={event => {
								setNewComment(event.target.value);
							}}
						/>

						<div align="center">
							<button
								className="addCommentButton"
								onClick={addComment}
							>
								Comment
							</button>
						</div>
					</div>

					<div className="listOfComments">
						{comments.map((comment, key) => {
							return (
								<div key={key} className="commentCard">
									{authState.username === comment.username &&
										<div
											className="deleteCommentIcon"
											onClick={() => {
												deleteComment(comment.id);
											}}
										>
											<span>x</span>
										</div>}
									<div className="commentContent">
										<span>
											{comment.content}
										</span>
									</div>

									<div className="commentFooter">
										<div>
											<span>
												{comment.username}
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Post;
