import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Navbar from "../shared/Navbar";
import { AuthContext } from "../helpers/AuthContext";

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
				});
		}
	}, []);

	return (
		<div className="homePageContainer">
			<Navbar />
			{listOfPosts.map((post, index) => {
				return (
					<div className="postDiv" key={index}>
						<div className="postTitle">
							{post.title}
						</div>

						<div className="postContent">
							{post.content}
						</div>

						<div className="postFooter">
							{`${new Date(post.created_at).getFullYear()}-${new Date(post.created_at).getMonth() + 1}-${new Date(post.created_at).getDate()}`}
						</div>
					</div>
				);
			})}
		</div>
	);
}

export default Home;
