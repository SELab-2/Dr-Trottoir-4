import React from "react";
import styles from "@/components/header/roleHeader.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import person from "@/public/icons/person.svg";
import menu from "@/public/icons/menu.svg";
import Link from "next/link";
import Logout from "@/components/logout";

const AdminHeader = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid">
                <Link href="/admin/dashboard">
                    <Image src={logo} alt="My App Logo" width={120} height={30} />
                </Link>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className={`nav-link ${styles.text}`} href="/admin/dashboard">
                                Dashboard
                            </Link>
                        </li>
                        <li className="position-relative">
                            <a
                                className={`nav-link dropdown-toggle ${styles.text}`}
                                id="navbarDropdownData"
                                role="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                Data
                            </a>
                            <ul
                                className="dropdown-menu dropdown-menu-en dropdown-menu-end"
                                aria-labelledby="navbarDropdownData"
                            >
                                <li>
                                    <Link className="dropdown-item" href="/admin/data/users">
                                        Gebruikers
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href="/admin/data/schedules">
                                        Planning
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href="/admin/data/tours">
                                        Rondes
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href="/admin/data/buildings">
                                        Gebouwen
                                    </Link>
                                </li>
                                <li>
                                    <Link className="dropdown-item" href="/admin/data/mails">
                                        Mails
                                    </Link>
                                </li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${styles.text}`} href="/admin/communication">
                                Communicatie
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className={`nav-link ${styles.text}`} href="/admin/analysis">
                                Analyse
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="ms-auto">
                    <a
                        className="nav-link dropdown-toggle"
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
                    <ul className="dropdown-menu dropdown-menu-en dropdown-menu-end" aria-labelledby="navbarDropdown1">
                        <li>
                            <a className="dropdown-item">Bewerk account</a>
                        </li>
                        <li>
                            <hr className="dropdown-divider" />
                        </li>
                        <li>
                            <Logout />
                        </li>
                    </ul>
                </div>
                <a
                    className={`nav-link ${styles.menuIcon}`}
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarSupportedContent"
                    aria-controls="navbarSupportedContent"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <Image src={menu} alt="My App Menu" height={24} />
                </a>
            </div>
        </nav>
    );
};

export default AdminHeader;
