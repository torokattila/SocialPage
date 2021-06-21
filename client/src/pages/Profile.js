import React, { useEffect, useState, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import { AuthContext } from "../helpers/AuthContext";
import NavBar from "../shared/Navbar";

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
			<NavBar />
			<div className="basicInfoContainer" align="center">
				<h2>
					Username: {username}
				</h2>

				{authState.username === username &&
					<button
						className="changePasswordButton"
						onClick={() => {
							history.push("/changepassword");
						}}
					>
						Change Password
					</button>}
			</div>
		</div>
	);
}

export default Profile;
