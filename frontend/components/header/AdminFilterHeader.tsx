import React from "react";
import styles from "@/components/header/RoleHeader.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import person from "@/public/icons/person.svg";
import menu from "@/public/icons/menu.svg";

const AdminFilterHeader = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className={`container-fluid w-100 d-grid grid-rows-2 ${styles.grid}`}>
                <div className="row align-items-center">
                    <div className="col-auto">
                        <Image className={styles.logo} src={logo} alt="My App Logo" width={120} height={30}/>
                    </div>
                    <div className="col">
                        <div className="d-flex">
                            <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 order-last">
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
                            <div className="navbar-header">
                        <button
                            className={`navbar-toggler ${styles.button}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarNav"
                            aria-controls="navbarNav"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <Image src={menu} alt="My App Menu"/>
                        </button>
                    </div>
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
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
                            </li>
                        </ul>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 col-lg-3">
                        <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 1"/>
                    </div>
                    <div className="col-12 col-lg-3">
                        <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 2"/>
                    </div>
                    <div className="col-12 col-lg-3">
                        <input type="text" className={`form-control ${styles.input}`} placeholder="Filter field 3"/>
                    </div>
                </div>
            </div>
        </nav>

    );
};

export default AdminFilterHeader;