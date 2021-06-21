import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import NavBar from "../shared/Navbar";

function ChangePassword() {
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	let history = useHistory();

	const changePassword = () => {
		if (window.confirm("Do you want to change your password?")) {
			if (oldPassword === "" || newPassword === "") {
				alert(
					"You have to fill both old password and new password field!"
				);
				return;
			} else {
				axios.put(
					"http://localhost:3001/changepassword",
					{
						oldPassword: oldPassword,
						newPassword: newPassword
					},
					{
						headers: {
							accessToken: localStorage.getItem("accessToken")
						}
					}
				).then(response => {
                    if (response.data.error) {
                        alert(response.data.error);
                    } else {
                        alert(response.data);
                        history.push("/");
                    }
                });
			}
		}
	};

	return (
		<div className="changePasswordContainer">
			<NavBar />
			<div className="changePasswordCard" align="center">
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
							onClick={changePassword}
						>
							Save Changes
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default ChangePassword;
