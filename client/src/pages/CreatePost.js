import React, { useContext, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";
import Navbar from "../shared/Navbar";

function CreatePost() {
	const { authState } = useContext(AuthContext);
	const initialValues = {
		title: "",
		content: "",
		username: authState.username
	};
	let history = useHistory();

	useEffect(() => {
		if (!localStorage.getItem("accessToken")) {
			history.push("/login");
		}
	}, []);

	const validationSchema = Yup.object().shape({
		title: Yup.string().required("You must provide a title for your post!"),
		content: Yup.string().required(
			"You must provide a content for your post!"
		),
	});

	const onSubmit = data => {
		axios
			.post("http://localhost:3001/createpost", data, {
				headers: {
					accessToken: localStorage.getItem("accessToken")
				}
			})
			.then(response => {
				if (response.data.error) {
					alert(
						"There was an error with the creation, try again please."
					);
				} else {
					history.push("/");
				}
			});
	};

	return (
		<div className="createPostContainer">
			<Navbar />
			<div className="createPostFormDiv">
				<Formik
					initialValues={initialValues}
					onSubmit={onSubmit}
					validationSchema={validationSchema}
				>
					<Form className="createPostContainerForm">
						<label>Title:</label>
						<ErrorMessage name="title" component="h3" />
						<Field
							autoComplete="off"
							id="inputCreatePost"
							name="title"
							placeholder="Title of the post"
						/>

						<Field
							type="hidden"
							name="username"
						/>

						<label>Content:</label>
						<ErrorMessage name="content" component="h3" />
						<Field
							autoComplete="off"
							id="inputCreatePost"
							name="content"
							placeholder="Content of the post"
						/>

						<button className="createPostButton" type="submit">
							Create Post
						</button>
					</Form>
				</Formik>
			</div>
		</div>
	);
}

export default CreatePost;
