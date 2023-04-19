import React from "react";

const SyndicFooter = () => {
    return (
            <footer className="navbar navbar-expand-sm navbar-dark bg-dark"
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
            </footer>
    );
};

export default SyndicFooter;
