import {Button, Form, Modal} from "react-bootstrap";
import styles from "@/styles/Login.module.css";
import React, {FormEvent, useEffect, useState} from "react";
import {getAllRoles, Role} from "@/lib/role";
import {IconButton} from "@mui/material";
import {Replay} from "@mui/icons-material";
import {addToLobby, Lobby, patchLobby} from "@/lib/lobby";
import {useTranslation} from "react-i18next";
import {handleError} from "@/lib/error";

export default function EditLobbyModal(
    {
        selectedLobby,
        show,
        onHide,
        onPatch,
        onPost,
        newVerificationCode
    } : {
        selectedLobby : Lobby | null,
        show : boolean,
        onHide : () => void,
        onPatch : (l: Lobby) => void,
        onPost : (l : Lobby) => void,
        newVerificationCode : () => void
    }
) {
    const {t} = useTranslation();

    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [email, setEmail] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const [allRoles, setAllRoles] = useState<Role[]>([]);

    useEffect(() => {
        getAllRoles().then(res => {
            const r: Role[] = res.data;
            setAllRoles(r);
        }, console.error);
    }, []);

    useEffect(() => {
        if (! selectedLobby) {
            return;
        }
        setEmail(selectedLobby.email);
        setRole(allRoles.find(r => r.id === selectedLobby.role)!.name);
    }, [selectedLobby]);

    // post/patch a lobby
    function changeLobby(event : FormEvent) {
        event.preventDefault();
        if (selectedLobby) {
            modifyLobby();
        } else {
            addLobby();
        }
    }

    // Add a lobby via a post
    function addLobby() {
        if (!role) {
            setErrorMessages(["Een rol is verplicht."]);
            return;
        }
        const selectedRole: Role = allRoles.find(r => r.name === role)!;
        addToLobby(email, selectedRole.id).then(res => {
            const l: Lobby = res.data;
            onPost(l);
            hideModal();
        }, err => {
            const e = handleError(err);
            setErrorMessages(e);
        });
    }

    // Patch a lobby
    function modifyLobby() {
        if (!role || ! selectedLobby) {
            return;
        }
        const selectedRole: Role = allRoles.find(r => r.name === role)!;
        const data : { [name: string]: string | number | number[] } = {};
        if (selectedRole.id != selectedLobby.id) {
            data['role'] = selectedRole.id;
        }
        if (email != selectedLobby.email) {
            data['email'] = email;
        }
        patchLobby(selectedLobby.id, data).then(res => {
            const lobby : Lobby = res.data;
            onPatch(lobby)
            hideModal();
        }, err => {
            const e = handleError(err);
            setErrorMessages(e);
        });
    }

    function hideModal() {
        onHide();
        setRole("");
        setEmail("");
        setErrorMessages([]);
    }


    return (
        <Modal show={show} onHide={() => {
            onHide()
        }}>
            <Modal.Header>
                <Modal.Title>{selectedLobby ? "Pas lobby aan" : "Voeg toe aan lobby"}</Modal.Title>
            </Modal.Header>
            <Form onSubmit={changeLobby}>
                <Modal.Body>
                    {errorMessages.length !== 0 && (
                        <div className={"visible alert alert-danger alert-dismissible fade show"}>
                            <ul>
                                {errorMessages.map((err, i) => (
                                    <li key={i}>{t(err)}</li>
                                ))}
                            </ul>
                            <button type="button" className="btn-close" onClick={() => setErrorMessages([])}></button>
                        </div>
                    )}
                    <div className="card-body p-4 p-lg-5 text-black">
                        <div className="form-outline mb-4">
                            <label className="form-label">Email:</label>
                            <input
                                type="email"
                                className={`form-control form-control-lg ${styles.input}`}
                                id="email"
                                value={email}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setEmail(e.target.value);
                                }}
                                required
                            />
                        </div>
                        <div className="form-outline mb-4">
                            <label className="form-label">Rol:</label>
                            <select
                                value={role}
                                className={`form-select form-control form-control-lg ${styles.input}`}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    setRole(e.target.value);
                                }}
                            >
                                <option disabled value=""></option>
                                {allRoles.map((role: Role) => (
                                    <option value={role.name} key={role.name}>
                                        {t(role.name)}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {
                            (selectedLobby) &&
                            (
                                <div className="form-outline mb-4">
                                    <label className="form-label">Verificatiecode:</label>
                                    <input type="text"
                                           readOnly
                                           className={`form-control form-control-lg ${styles.input}`}
                                           value={selectedLobby?.verification_code}
                                           aria-describedby="regenerate"/>
                                    <div className="input-group-append">
                                        <IconButton onClick={() => newVerificationCode()} id="regenerate">
                                            <Replay/>
                                        </IconButton>
                                    </div>
                                </div>
                            )
                        }
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        className="btn-light"
                        onClick={() => {
                            onHide();
                        }}
                    >
                        Annuleer
                    </Button>
                    <Button
                        variant="primary"
                        className="btn-dark"
                        type="submit"
                    >
                        {selectedLobby ? "Pas aan" : "Voeg email toe aan lobby"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}