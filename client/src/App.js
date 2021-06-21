import "./App.css";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';
import PageNotFound from './pages/PageNotFound';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';

function App() {
	const [authState, setAuthState] = useState({
		username: "",
		id: 0,
		status: false
	});

	useEffect(() => {
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
	}, []);

	return (
		<div className="App">
			<AuthContext.Provider value={{ authState, setAuthState }}>
				<Router>
					<Switch>
					{!authState.status ? (
						<>
						<Login />
						<Route exact path="/login" component={Login} />
						<Route
							exact
							path="/registration"
							component={Registration}
						/>
						</>
					) : (
						<>
						<Route exact path="/" component={Home} />
						<Route exact path="/createpost" component={CreatePost} />
						<Route exact path="/profile/:id" component={Profile} />
						<Route exact path="/changepassword" component={ChangePassword} />
						</>
					)}
					</Switch>
				</Router>
			</AuthContext.Provider>
		</div>
	);
}

export default App;
