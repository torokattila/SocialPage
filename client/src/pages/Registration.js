import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import Swal from "sweetalert2";

function Registration() {
	const initialValues = {
		username: "",
		password: ""
	};
	const { setAuthState } = useContext(AuthContext);

	const history = useHistory();

	const validationSchema = Yup.object().shape({
		username: Yup.string()
			.min(3, "The username must be at least 3 characters long!")
			.max(15, "The username must be maximum 15 characters long!")
			.required("You must provide a username!"),
		password: Yup.string()
			.min(4, "The password must be at least 4 characters long!")
			.max(20, "The password must be maximum 20 characters long!")
			.required("You must provide a password!")
	});

	const onSubmit = data => {
		axios
			.post("http://localhost:3001/api/registeruser", data)
			.then(response => {
				if (response.data.error) {
					Swal.fire({
						title: "",
						text: response.data.error,
						type: "error",
					});
				} else {
					localStorage.setItem('accessToken', response.data.token);
					setAuthState({
						username: response.data.username,
						id: response.data.id,
						status: true
					});
					history.push('/');
				}
			});
	};
	return (
		<div className="loginContainer">
			<Formik
				initialValues={initialValues}
				onSubmit={onSubmit}
				validationSchema={validationSchema}
			>
				<Form className="loginCard">
					<div className="loginCardLeftSide">
						<div className="headerDiv">
							<h1>Create your new account</h1>
							<hr />
						</div>
						<div className="loginInputsDiv">
							<label htmlFor="username" className="inputLabel">
								Username:
							</label>
							<ErrorMessage name="username" component="h3" />
							<form>
								<Field
									type="text"
									name="username"
									autoComplete="off"
									className="loginInput"
									placeholder="Username"
								/>
							</form>

							<label htmlFor="password" className="inputLabel">
								Password:
							</label>
							<ErrorMessage name="password" component="h3" />
							<Field
								type="password"
								autoComplete="off"
								name="password"
								className="loginInput"
								placeholder="Password"
							/>

							<button className="signInButton" type="submit">
								Sign Up
							</button>
						</div>
					</div>
					<div className="loginCardRightSide">
						<div className="rightHeaderDiv">
							<div>
								<h1>Do you already have an account?</h1>
							</div>
							<div>
								<button
									className="signupButton"
									onClick={() => {
										history.push("/login");
									}}
								>
									Login
								</button>
							</div>
						</div>
					</div>
				</Form>
			</Formik>
		</div>
	);
}

export default Registration;
