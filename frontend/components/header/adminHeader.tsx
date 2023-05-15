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
                            <NavDropdown.Item href="/admin/data/users">Gebruikers</NavDropdown.Item>
                            <NavDropdown.Item href="/admin/data/schedules">Planning</NavDropdown.Item>
                            <NavDropdown.Item href="/admin/data/garbage-collection">Vuilophaling</NavDropdown.Item>
                            <NavDropdown.Item href="/admin/data/tours">Rondes</NavDropdown.Item>
                            <NavDropdown.Item href="/admin/data/buildings">Gebouwen</NavDropdown.Item>
                            <NavDropdown.Item href="/admin/data/regions">Regio's</NavDropdown.Item>
                            <NavDropdown.Item href="/admin/data/mails">Mails</NavDropdown.Item>
                            <NavDropdown.Item href="/admin/data/lobby">Lobby</NavDropdown.Item>
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
                <div style={{display: 'flex', alignItems: 'center'}}>
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
                        <NavDropdown.Item href="/user/profile">Bewerk account</NavDropdown.Item>
                        <NavDropdown.Divider/>
                        <NavDropdown.ItemText>
                            <Logout/>
                        </NavDropdown.ItemText>
                    </NavDropdown>
                </div>
            </div>
        </Navbar>
    );
};

export default AdminHeader;
