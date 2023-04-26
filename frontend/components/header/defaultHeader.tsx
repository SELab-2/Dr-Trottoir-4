import React from "react";
import styles from "@/components/header/roleHeader.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import person from "@/public/icons/person.svg";
import Link from "next/link";
import Logout from "@/components/logout";

const StudentHeader = () => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container-fluid text-center">
                <Link href="/default/dashboard">
                    <Image src={logo} alt="My App Logo" width={120} height={30} />
                </Link>
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
                    <ul className="dropdown-menu dropdown-menu-en dropdown-menu-end" aria-labelledby="navbarDropdown1">
                        <li>
                            <Link className="dropdown-item" href="/user/profile">
                                Bewerk account
                            </Link>
                        </li>
                        <li>
                            <hr className="dropdown-divider" />
                        </li>
                        <li>
                            <Logout />
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default StudentHeader;
