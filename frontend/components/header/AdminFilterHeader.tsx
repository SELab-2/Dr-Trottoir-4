import React from "react";
import styles from "@/components/header/RoleHeader.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import person from "@/public/icons/person.svg";
import menu from "@/public/icons/menu.svg";
import Template3Filters from "@/components/filters/Template3Filters";
import Template2Filters from "@/components/filters/Template2Filters";
import Link from "next/link";

type MyComponentVariations = typeof Template3Filters | typeof Template2Filters;

interface AdminFilterHeaderProps {
    children: React.ReactElement<MyComponentVariations>;
}

const AdminFilterHeader = ({children}: AdminFilterHeaderProps) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className={`container-fluid w-100 d-grid ${styles.grid}`}>
                <div className="row align-items-center d-flex">
                    <div className="col">
                        <div className="d-flex">
                            <Link className="navbar-brand" href="/admin/dashboard">
                                <Image src={logo} alt="My App Logo" width={120} height={30}/>
                            </Link>
                            <div className={`navbar-collapse ${styles.navigation_links_top}`}>
                                <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                                    <li className="nav-item">
                                        <Link className={`nav-link ${styles.text}`} href="/admin/dashboard">
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className={`nav-link ${styles.text}`} href="/admin/data/users">
                                            Data
                                        </Link>
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
                                <Link className={`nav-link ${styles.text}`} href="/admin/dashboard">
                                    Dashboard
                                </Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${styles.text}`} href="/admin/data/users">
                                    Data
                                </Link>
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
                </div>
                <div className="row">
                    {children}
                </div>
            </div>
        </nav>
    );
};

export default AdminFilterHeader;