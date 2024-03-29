import { Button, Modal } from "react-bootstrap";
import styles from "@/styles/Login.module.css";
import React, { useEffect, useState } from "react";
import { UserView } from "@/types";
import { getAllRoles, Role } from "@/lib/role";
import { patchUser } from "@/lib/user";
import { useTranslation } from "react-i18next";
import { handleError } from "@/lib/error";
import ErrorMessageAlert from "@/components/errorMessageAlert";
import { RegionInterface } from "@/lib/region";
import Select from "react-select";

export function UserEditModal({
    show,
    closeModal,
    selectedUser,
    setSelectedUser,
}: {
    show: boolean;
    closeModal: () => void;
    selectedUser: UserView | null;
    setSelectedUser: (x: any) => void;
}) {
    const { t } = useTranslation();
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);

    useEffect(() => {
        getAllRoles().then((res) => {
            const roles: Role[] = res.data;
            setAllRoles(roles);
        });
    }, []);

    function editUser() {
        if (!selectedUser) {
            return;
        }
        const role: Role = allRoles.find((r: Role) => selectedUser.role === r.name)!;
        const roleId: number = role.id;
        patchUser(selectedUser.userId, {
            role: roleId,
            first_name: selectedUser.first_name,
            last_name: selectedUser.last_name,
            phone_number: selectedUser.phone_number,
            is_active: selectedUser.isActive,
        }).then(
            (_) => {
                setSelectedUser(null);
                setErrorMessages([]);
                closeModal();
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages(e);
            }
        );
    }

    return (
        <Modal show={show} onHide={() => closeModal}>
            <Modal.Header>
                <Modal.Title>Pas gebruiker aan</Modal.Title>
            </Modal.Header>
            <ErrorMessageAlert errorMessages={errorMessages} setErrorMessages={setErrorMessages} />
            <Modal.Body>
                <div className="card-body p-4 p-lg-5 text-black">
                    <form>
                        <div className="form-outline mb-4">
                            <label className="form-label">Voornaam</label>
                            <input
                                type="text"
                                className={`form-control form-control-lg ${styles.input}`}
                                id="firstName"
                                value={selectedUser ? selectedUser.first_name : ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setSelectedUser((prevState: UserView | null) =>
                                        prevState
                                            ? {
                                                  ...prevState,
                                                  first_name: e.target.value,
                                              }
                                            : null
                                    );
                                }}
                                required
                            />
                        </div>
                        <div className="form-outline mb-4">
                            <label className="form-label">Achternaam</label>
                            <input
                                type="text"
                                className={`form-control form-control-lg ${styles.input}`}
                                id="lastName"
                                value={selectedUser ? selectedUser.last_name : ""}
                                required
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setSelectedUser((prevState: UserView | null) =>
                                        prevState
                                            ? {
                                                  ...prevState,
                                                  last_name: e.target.value,
                                              }
                                            : null
                                    );
                                }}
                            />
                        </div>
                        <div className="form-outline mb-4">
                            <label className="form-label">Email:</label>
                            <input
                                type="text"
                                readOnly
                                className={`form-control form-control-lg ${styles.input}`}
                                id="email"
                                value={selectedUser ? selectedUser.email : ""}
                                onChange={() => {}}
                                required
                            />
                        </div>
                        <div className="form-outline mb-4">
                            <label className="form-label">Telefoon:</label>
                            <input
                                type="text"
                                className={`form-control form-control-lg ${styles.input}`}
                                id="phoneNumber"
                                value={selectedUser ? selectedUser.phone_number : ""}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    setSelectedUser((prevState: UserView | null) =>
                                        prevState
                                            ? {
                                                  ...prevState,
                                                  phone_number: e.target.value,
                                              }
                                            : null
                                    );
                                }}
                                required
                            />
                        </div>
                        <div className="form-outline mb-4">
                            <label className="form-label">Rol:</label>
                            <Select
                                options={allRoles.map((role: Role) => {
                                    return { value: role.name, label: t(role.name) as string };
                                })}
                                value={selectedUser ? { value: selectedUser.role, label: t(selectedUser.role) } : {}}
                                onChange={(s) => {
                                    if (s && s.value) {
                                        setSelectedUser((prevState: UserView | null) =>
                                            prevState
                                                ? {
                                                      ...prevState,
                                                      role: s.value,
                                                  }
                                                : null
                                        );
                                    }
                                }}
                                placeholder={"Selecteer rol"}
                            />
                        </div>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="switchCheckbox"
                                checked={selectedUser ? selectedUser.isActive : false}
                                onChange={() => {
                                    setSelectedUser((prevState: UserView | null) =>
                                        prevState
                                            ? {
                                                  ...prevState,
                                                  isActive: !prevState.isActive,
                                              }
                                            : null
                                    );
                                }}
                            />
                            <label className="form-check-label" htmlFor="switchCheckbox">
                                Actief
                            </label>
                        </div>
                    </form>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    className="btn-light"
                    onClick={() => {
                        setSelectedUser(null);
                        setErrorMessages([]);
                        closeModal();
                    }}
                >
                    Annuleer
                </Button>
                <Button
                    variant="primary"
                    className="btn-dark"
                    onClick={async () => {
                        editUser();
                    }}
                >
                    Pas aan
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
