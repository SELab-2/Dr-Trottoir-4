import React from "react";
import styles from "@/components/header/AdminHeader.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import person from "@/public/icons/person.svg";
import menu from "@/public/icons/menu.svg";

// {`navbar-toggler ${styles.button}`}

const AdminHeader = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Image src={logo} alt="My App Logo" width={120} height={30}/>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <a className={`nav-link ${styles.text}`} href="#">
                                Dashboard
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${styles.text}`} href="#">
                                Data
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${styles.text}`} href="#">
                                Communicatie
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className={`nav-link ${styles.text}`} href="#">
                                Analyse
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="ms-auto">
                    <a
                        className="nav-link dropdown-toggle"
                        href="#"
                        id="navbarDropdown1"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <Image
                            src={person}
                            alt="My App Logo"
                            className={`rounded-circle ${styles.person}`}
                            height={24}
                        />
                    </a>
                    <ul
                        className="dropdown-menu dropdown-menu-en dropdown-menu-end"
                        aria-labelledby="navbarDropdown1"
                    >
                        <li>
                            <a className="dropdown-item" href="#">
                                Bewerk account
                            </a>
                        </li>
                        <li>
                            <hr className="dropdown-divider"/>
                        </li>
                        <li>
                            <a className="dropdown-item" href="#">
                                Log out
                            </a>
                        </li>
                    </ul>
                </div>
                <button
                    className={`navbar-toggler ${styles.button}`}
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <Image src={menu} alt="My App Menu"/>
                </button>
            </div>
        </nav>
    );
};

export default AdminHeader;