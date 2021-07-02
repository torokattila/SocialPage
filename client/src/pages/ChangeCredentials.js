import React, { useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import NavBar from "../shared/Navbar";
import Swal from "sweetalert2";

function ChangeCredentials() {
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const { authState } = useContext(AuthContext);
	const [newUsername, setNewUsername] = useState("");
	let history = useHistory();

	const changeCredentials = () => {
		Swal.fire({
			title: "Are you sure?",
			text: "Do you want to change your credentials?",
			showCancelButton: true,
			confirmButtonColor: "#3085d6",
			cancelButtonColor: "#d33",
			confirmButtonText: "Yes!"
		}).then(response => {
			if (response.value) {
				if (newUsername === "" && oldPassword === "" && newPassword === "") {
					Swal.fire({
						title: "",
						text: "If you want to change your credentials, fill the username field and/or the two password fields below!",
						type: "error",
					});
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
								Swal.fire({
									title: "",
									text: response.data.error,
									type: "error",
								});
							} else {
								Swal.fire({
									title: "",
									text: response.data.successMessage,
									type: "success",
								}).then(response => {
									if (response.value) {
										history.push("/");
										window.location.reload();
									}
								});
							}
						});
				}
			}
		});
	};

	return (
		<div className="changePasswordContainer">
			<NavBar />
			<div className="changePasswordCard" align="center">
				<h2>Change Username:</h2>
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

				<h2>Change Password:</h2>
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
