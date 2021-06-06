import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import FavoriteBorderIcon from "@material-ui/icons/FavoriteBorder";
import FavoriteIcon from "@material-ui/icons/Favorite";
import HomeIcon from "@material-ui/icons/Home";
import PostAddIcon from "@material-ui/icons/PostAdd";

function Navbar(props) {
	const [authState, setAuthState] = useState({
		username: "",
		id: 0,
		status: false
	});
	let history = useHistory();

	useEffect(() => {
		if (!localStorage.getItem("accessToken")) {
			history.push("/login");
		} else {
			axios
				.get("http://localhost:3001/auth", {
					headers: {
						accessToken: localStorage.getItem("accessToken")
					}
				})
				.then(response => {
					if (response.data.error) {
						setAuthState({ ...authState, status: false });
					} else {
						setAuthState({
							username: response.data.username,
							id: response.data.id,
							status: true
						});
					}
				});
		}
	}, []);

	const logout = () => {
		if (window.confirm("Do you want to log out?")) {
			localStorage.removeItem("accessToken");
			setAuthState({
				username: "",
				id: 0,
				status: false
			});
			window.location.reload(false);
		}
	};

	return (
		<div className="navbar">
			<div className="nameAndLogout">
				<div>
					<h1>
						{authState.username}
					</h1>
				</div>
				<div>
					<button className="logoutButton" onClick={logout}>
						Logout
					</button>
				</div>
			</div>

			<div className="homeAndCreatePost">
				<div>
					<HomeIcon fontSize="large" className="homeIcon" />
					<Link className="links" to="/">
						Home Page
					</Link>
				</div>

				<div>
					<PostAddIcon fontSize="large" className="homeIcon" />
					<Link className="links" to="/createpost">
						Create a Post
					</Link>
				</div>
			</div>
		</div>
	);
}

export default Navbar;
