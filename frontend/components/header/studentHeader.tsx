import React from "react";
import styles from "@/components/header/roleHeader.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import person from "@/public/icons/person.svg";
import Link from "next/link";
import Logout from "@/components/logout";
import {Navbar, NavDropdown} from "react-bootstrap";

const StudentHeader = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <div className="container-fluid text-center">
                <Link href="/student/dashboard">
                    <Navbar.Brand>
                        <Image src={logo} alt="My App Logo" width={120} height={30}/>
                    </Navbar.Brand>
                </Link>
                <NavDropdown
                        id="navbarDropdown1"
                        menuVariant="dark"
                        align="end"
                        title={
                            <Image
                                src={person}
                                alt="My App Logo"
                                className={styles.person}
                                height={24}
                            />
                        }
                    >
                        <Link href="/user/profile">
                            <NavDropdown.Item>Bewerk account</NavDropdown.Item>
                        </Link>
                        <NavDropdown.Divider/>
                        <NavDropdown.Item>
                            <Logout/>
                        </NavDropdown.Item>
                    </NavDropdown>
            </div>
        </Navbar>
    );
};

export default StudentHeader;
