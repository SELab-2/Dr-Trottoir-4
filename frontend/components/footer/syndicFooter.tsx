import React from "react";

const SyndicFooter = () => {
    return (
        <nav className="navbar navbar-expand-sm navbar-dark bg-dark fixed-bottom"
             style={{position: "absolute", bottom: "0", width: "100%"}}
        >
            <div className="container-fluid" style={{color: "yellow"}}>
                <span style={{margin: "auto auto"}}>
                    Vragen? Contacteer:{" "}
                    <a style={{color: "yellow", textDecoration: "underline"}} href="mailto:help@drtrottoir.be">
                        help@drtrottoir.be
                    </a>
                </span>
            </div>
        </nav>
    );
};

export default SyndicFooter;
