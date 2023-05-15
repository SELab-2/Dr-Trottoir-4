import React from "react";
import styles from "@/components/header/roleHeader.module.css";
import Image from "next/image";
import logo from "@/public/logo.png";
import person from "@/public/icons/person.svg";
import menu from "@/public/icons/menu.svg";
import Link from "next/link";
import Logout from "@/components/logout";
import {Nav, Navbar, NavDropdown} from "react-bootstrap";

const AdminHeader = () => {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <div className="container-fluid">
                <Link href="/admin/dashboard">
                    <Navbar.Brand>
                        <Image src={logo} alt="My App Logo" width={120} height={30}/>
                    </Navbar.Brand>
                </Link>
                <Navbar.Collapse id="navbarSupportedContent">
                    <Nav className="ms-auto mb-2 mb-lg-0">
                        <Nav.Link className={styles.text} href="/admin/dashboard">
                            Dashboard
                        </Nav.Link>
                        <NavDropdown
                            title="Data"
                            className={styles.text}
                            id="navbarDropdownData"
                            menuVariant="dark"
                        >
                            <Link href="/admin/data/users">
                                <NavDropdown.Item>Gebruikers</NavDropdown.Item>
                            </Link>
                            <Link href="/admin/data/schedules">
                                <NavDropdown.Item>Planning</NavDropdown.Item>
                            </Link>
                            <Link href="/admin/data/garbage-collection">
                                <NavDropdown.Item>Vuilophaling</NavDropdown.Item>
                            </Link>
                            <Link href="/admin/data/tours">
                                <NavDropdown.Item>Rondes</NavDropdown.Item>
                            </Link>
                            <Link href="/admin/data/buildings">
                                <NavDropdown.Item>Gebouwen</NavDropdown.Item>
                            </Link>
                            <Link href="/admin/data/regions">
                                <NavDropdown.Item>Regio's</NavDropdown.Item>
                            </Link>
                            <Link href="/admin/data/mails">
                                <NavDropdown.Item>Mails</NavDropdown.Item>
                            </Link>
                            <Link href="/admin/data/lobby">
                                <NavDropdown.Item>Lobby</NavDropdown.Item>
                            </Link>
                        </NavDropdown>
                        <Nav.Link className={styles.text} href="/admin/communication">
                            Communicatie
                        </Nav.Link>
                        <Nav.Link className={styles.text} href="/admin/analysis">
                            Analyse
                        </Nav.Link>
                        <Nav.Link className={styles.text} href="/admin/my-schedule">
                            Mijn agenda
                        </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Navbar.Toggle className={styles.menuIcon} aria-controls="navbarSupportedContent"
                                   aria-label="Toggle navigation">
                        <Image src={menu} alt="My App Menu" height={24}/>
                    </Navbar.Toggle>
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
            </div>
        </Navbar>
    );
};

export default AdminHeader;
