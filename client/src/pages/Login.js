import React, { useState, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Login() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const { setAuthState } = useContext(AuthContext);

	const history = useHistory();

	return (
		<div className="loginContainer">
			<div className="loginCard">
				<div className="loginCardLeftSide">
					<div className="headerDiv">
						<h1>Sign in to your Account</h1>
						<hr />
					</div>
                    <div className="loginInputsDiv">
                        <input type="text" className="loginInput" placeholder="Username"/>
                        <input type="password" className="loginInput" placeholder="Password" />
                    </div>
				</div>
				<div className="loginCardRightSide">
					<div className="rightHeaderDiv">
						<div>
							<h1>Don't you have an account?</h1>
						</div>
						<div>
							<button className="signupButton">Sign Up</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Login;
