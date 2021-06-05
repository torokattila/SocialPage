import "./App.css";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import { AuthContext } from "./helpers/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import Registration from './pages/Registration';
import Login from './pages/Login';

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
          { !authState.status && (
            <Login />
          )}
        </Router>
      </AuthContext.Provider>
		</div>
	);
}

export default App;
