import "./App.css";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Home from './pages/Home';
import CreatePost from './pages/CreatePost';

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
						<Route path="/login" exact component={Login} />
						<Route
							path="/registration"
							exact
							component={Registration}
						/>
						</>
					) : (
						<>
						<Route path="/" exact component={Home} />
						<Route path="/createpost" exact component={CreatePost} />
						</>
					)}
					</Switch>
				</Router>
			</AuthContext.Provider>
		</div>
	);
}

export default App;
