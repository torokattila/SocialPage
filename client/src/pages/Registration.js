import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useHistory } from "react-router-dom";

function Registration() {
	const initialValues = {
		username: "",
		password: ""
	};

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
				console.log(response);
				history.push("/login");
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
							<label for="username" className="inputLabel">
								Username:
							</label>
							<ErrorMessage name="username" component="h3" />
							<Field
								type="text"
								name="username"
								autocomplete="off"
								className="loginInput"
								placeholder="Username"
							/>

							<label for="password" className="inputLabel">
								Password:
							</label>
							<ErrorMessage name="password" component="h3" />
							<Field
								type="password"
								autocomplete="off"
								name="password"
								className="loginInput"
								placeholder="Password"
							/>

							<button 
                                className="signInButton" 
                                type="submit"
                                onS
                                >
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
