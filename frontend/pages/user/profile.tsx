import React, { useEffect, useState } from "react";
import { getCurrentUser, getUserRole, patchUser, User } from "@/lib/user";
import styles from "@/styles/Login.module.css";
import { useTranslation } from "react-i18next";
import { getAllRegions, RegionInterface } from "@/lib/region";
import AdminHeader from "@/components/header/adminHeader";
import StudentHeader from "@/components/header/studentHeader";
import SyndicHeader from "@/components/header/syndicHeader";
import { handleError } from "@/lib/error";

export default function UserProfile() {
    const { t } = useTranslation();
    const [user, setUser] = useState<User | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
    const [allRegions, setAllRegions] = useState<RegionInterface[]>();
    const [role, setRole] = useState<string>("");

    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [succesPatch, setSuccessPatch] = useState<boolean>(false);

    useEffect(() => {
        getCurrentUser().then(
            (res) => {
                const u: User = res.data;
                setUserInfo(u);
            },
            (err) => {
                console.error(err);
            }
        );
        getAllRegions().then((res) => {
            const regions: RegionInterface[] = res.data;
            setAllRegions(regions);
        });
    }, []);

    function setUserInfo(u: User) {
        setRole(getUserRole(u.role.toString()));
        setUser(u);
        setFirstName(u.first_name);
        setLastName(u.last_name);
        setEmail(u.email);
        setPhoneNumber(u.phone_number);
        setSelectedRegions(u.region);
    }

    function submit() {
        if (!user) {
            return;
        }
        const patchBody: { [name: string]: string | number | number[] } = {};
        if (firstName !== user?.first_name) {
            patchBody["first_name"] = firstName;
        }
        if (lastName !== user?.last_name) {
            patchBody["last_name"] = lastName;
        }
        if (email !== user?.email) {
            patchBody["email"] = email;
        }
        if (phoneNumber !== user?.phone_number) {
            patchBody["phone_number"] = phoneNumber;
        }
        if (selectedRegions !== user?.region) {
            patchBody["region"] = JSON.stringify(selectedRegions); // convert list to string
        }
        patchUser(user.id, patchBody).then(
            (res) => {
                const u: User = res.data;
                setUserInfo(u);
                setSuccessPatch(true);
            },
            (err) => {
                const e = handleError(err);
                setErrorMessages(e);
            }
        );
    }

    return (
        <>
            {["Admin", "Superstudent"].includes(role) && <AdminHeader />}
            {"Student" === role && <StudentHeader />}
            {"Syndic" === role && <SyndicHeader />}
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
            {succesPatch && (
                <div className={"visible alert alert-success alert-dismissible fade show"}>
                    <strong>Succes!</strong> Uw profiel werd met succes gewijzigd!
                    <button type="button" className="btn-close" onClick={() => setSuccessPatch(false)}></button>
                </div>
            )}
            <form className="ms-2 mt-2 me-2">
                <div className="d-flex align-items-center mb-3 pb-1">
                    <i className="fas fa-cubes fa-2x me-3" />
                    <span className="h1 fw-bold mb-0">Profiel</span>
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">Voornaam:</label>
                    <input
                        type="text"
                        className={`form-control form-control-lg ${styles.input}`}
                        value={firstName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setFirstName(e.target.value);
                            e.target.setCustomValidity("");
                        }}
                        onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.target.setCustomValidity("Voornaam is verplicht.");
                        }}
                        required
                    />
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">Achternaam:</label>
                    <input
                        type="text"
                        className={`form-control form-control-lg ${styles.input}`}
                        value={lastName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setLastName(e.target.value);
                            e.target.setCustomValidity("");
                        }}
                        onInvalid={(e: React.ChangeEvent<HTMLInputElement>) => {
                            e.target.setCustomValidity("Achternaam is verplicht.");
                        }}
                        required
                    />
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">E-mailadres:</label>
                    <input
                        type="email"
                        className={`form-control form-control-lg ${styles.input}`}
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setEmail(e.target.value);
                        }}
                        required
                    />
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">Telefoon:</label>
                    <input
                        value={phoneNumber}
                        type="text"
                        className={`form-control form-control-lg ${styles.input}`}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
                    />
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">{`Rol : ${user ? t(getUserRole(user.role.toString())) : ""}`}</label>
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">Regio's waarin u wilt werken:</label>
                    {allRegions?.map((r: RegionInterface) => {
                        return (
                            <div className="form-check" key={r.id}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    value={r.id}
                                    id={r.id.toString()}
                                    checked={selectedRegions.some((n: number) => n === r.id)}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const regionId = Number(e.target.value);
                                        const regions = [...selectedRegions];
                                        if (
                                            e.target.checked &&
                                            !selectedRegions.find((el: number) => el === regionId)
                                        ) {
                                            regions.push(regionId);
                                            setSelectedRegions(regions);
                                        } else if (
                                            !e.target.checked &&
                                            selectedRegions.find((el: number) => el === regionId)
                                        ) {
                                            const i = regions.indexOf(regionId);
                                            if (i > -1) {
                                                regions.splice(i, 1);
                                            }
                                            setSelectedRegions(regions);
                                        }
                                    }}
                                />
                                <label className="form-check-label" htmlFor={r.id.toString()}>
                                    {r.region}
                                </label>
                            </div>
                        );
                    })}
                </div>
            </form>
            <div>
                <button className={`btn btn-dark btn-lg btn-block ${styles.button}`} onClick={submit}>
                    Pas aan
                </button>
            </div>
        </>
    );
}
