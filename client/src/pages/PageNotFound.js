import React from 'react';
import { Link } from 'react-router-dom';

function PageNotFound() {
    return (
        <div className="pageNotFoundContainer">
            <h2>Page Not Found :/</h2>

            <div className="pageNotFoundLinksDiv">
                <div className="pageNotFoundLinksInnerDiv">
                    <Link className="pageNotFoundLink" to="/"><span className="pageNotFoundLinkText">Back to the home page</span></Link>
                </div>

                <div>
                    <Link className="pageNotFoundLink" to="/createpost"><span className="pageNotFoundLinkText">Create a post</span></Link>
                </div>
            </div>
        </div>
    )
}

export default PageNotFound;
