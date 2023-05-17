import React from "react";

const SyndicFooter = () => {
    return (
        <footer className="navbar navbar-expand-sm navbar-dark bg-dark"
                style={{position: "fixed", bottom: "0", width: "100%"}}>
            <div className="container-fluid"
                 style={{color: 'yellow', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <label>
                    Vragen? Contacteer:
                    <a style={{color: "yellow", textDecoration: "underline"}} href="mailto:help@drtrottoir.be">
                        help@drtrottoir.be
                    </a>
                </label>
            </div>
        </footer>
    );
};

export default SyndicFooter;
