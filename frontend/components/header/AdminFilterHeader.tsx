import React from "react";
import styles from "@/components/header/RoleHeader.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import person from "@/public/icons/person.svg";
import menu from "@/public/icons/menu.svg";

const AdminFilterHeader = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className={`container-fluid w-100 d-grid ${styles.grid}`}>
                <div className="row align-items-center d-flex">
                    <div className="col">
                        <div className="d-flex">
                            <a className="navbar-brand" href="#">
                                <Image src={logo} alt="My App Logo" width={120} height={30}/>
                            </a>
                            <div className={`navbar-collapse ${styles.navigation_links_top}`}>
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
                            <div className="navbar-nav ms-auto position-relative">
                                <a
                                    className="nav-link"
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
                                    className="dropdown-menu dropdown-menu-end position-absolute"
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
                            <div className="navbar-nav">
                                <a
                                    className={`nav-link ${styles.menuIcon}`}
                                    data-bs-toggle="collapse"
                                    data-bs-target="#navbarSupportedContent"
                                    aria-controls="navbarSupportedContent"
                                    aria-expanded="false"
                                    aria-label="Toggle navigation"
                                >
                                    <Image src={menu} alt="My App Menu" height={24}/>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className={`row ${styles.navigation_links_bottom}`}>
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
                </div>
                <div className="row">
                    <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 1"/>
                    <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 2"/>
                    <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 3"/>
                </div>
            </div>
        </nav>
    );
};

export default AdminFilterHeader;