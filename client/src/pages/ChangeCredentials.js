import React, { useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import NavBar from "../shared/Navbar";

function ChangeCredentials() {
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const { authState } = useContext(AuthContext);
	const [newUsername, setNewUsername] = useState("");
	let history = useHistory();

	const changeCredentials = () => {
		if (window.confirm("Do you want to change your credentials?")) {
			if (newUsername === "" && oldPassword === "" && newPassword === "") {
				alert(
					"If you want to change your credentials, fill the username field and the two password fields below!"
				);
				return;
			} else {
				axios
					.put(
						"http://localhost:3001/changecredentials",
						{
							oldUsername: authState.username,
							oldPassword: oldPassword,
							newPassword: newPassword,
							newUsername: newUsername
						},
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
							alert(response.data.successMessage);
							history.push("/");
							window.location.reload();
						}
					});
			}
		}
	};

	return (
		<div className="changePasswordContainer">
			<NavBar />
			<div className="changePasswordCard" align="center">
				<h2>Change Your Username:</h2>
				<div className="changeUsernameDiv">
				<form autoComplete="off">
					<input
						type="text"
						className="changePasswordInput changeUsernameInput"
						value={authState.username}
					/>
					<input
						className="changePasswordInput changeUsernameInput"
						placeholder="New username"
						onChange={event => {
							setNewUsername(event.target.value);
						}}
					/>
					</form>
				</div>

				<h2>Change Your Password:</h2>
				<div className="changePasswordCardInnerContent">
					<div>
						<input
							className="changePasswordInput"
							type="password"
							placeholder="Old password"
							onChange={event => {
								setOldPassword(event.target.value);
							}}
						/>
					</div>

					<div>
						<input
							className="changePasswordInput"
							type="password"
							placeholder="New password"
							onChange={event => {
								setNewPassword(event.target.value);
							}}
						/>
					</div>

					<div>
						<button
							className="changePasswordSubmitButton"
							onClick={changeCredentials}
						>
							Save Changes
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ChangeCredentials;
