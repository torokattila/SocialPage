import React, { useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { setAuthState } = useContext(AuthContext);

	const history = useHistory();

	const onLogin = () => {
		const data = { username: username, password: password };

		axios.post('http://localhost:3001/api/loginuser', data).then(response => {
			if (response.data.error) {
				alert(response.data.error);
			} else {
				localStorage.setItem('accessToken', response.data.token);
				setAuthState({
					username: response.data.username,
					id: response.data.id,
					status: true
				});
				history.push('/');
			}
		})
	}

	return (
		<div className="loginContainer">
			<div className="loginCard">
				<div className="loginCardLeftSide">
					<div className="headerDiv">
						<h1>Sign in to your Account</h1>
						<hr />
					</div>
					<div className="loginInputsDiv">
						<label for="username" className="inputLabel">
							Username:
						</label>
						<input
							type="text"
							className="loginInput"
							placeholder="Username"
							onChange={event => {
								setUsername(event.target.value);
							}}
						/>

						<label for="password" className="inputLabel">
							Password:
						</label>
						<input
							type="password"
							className="loginInput"
							placeholder="Password"
							onChange={event => {
								setPassword(event.target.value);
							}}
						/>

						<button className="signInButton" onClick={onLogin}>Sign In</button>
					</div>
				</div>
				<div className="loginCardRightSide">
					<div className="rightHeaderDiv">
						<div>
							<h1>Don't you have an account?</h1>
						</div>
						<div>
							<button
								className="signupButton"
								onClick={() => {
									history.push("/registration");
								}}
							>
								Sign Up
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
