import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link, useHistory } from "react-router-dom";
import Navbar from '../shared/Navbar';

function Home() {
	const [listOfPosts, setListOfPosts] = useState([]);
	const [likedPosts, setLikedPosts] = useState([]);

	return (
		<div className="homePageContainer">
			<Navbar />
		</div>
	);
}

export default Home;
