import React, {useEffect, useState} from "react";
import {getCurrentUser, getUserRole, User} from "@/lib/user";
import styles from "@/styles/Login.module.css";
import PhoneInput from "react-phone-input-2";
import {useTranslation} from "react-i18next";
import {getAllRegions, Region} from "@/lib/region";
import AdminHeader from "@/components/header/adminHeader";
import StudentHeader from "@/components/header/studentHeader";
import SyndicHeader from "@/components/header/syndicHeader";

export default function UserProfile() {
    const {t} = useTranslation();
    const [user, setUser] = useState<User | null>(null);
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [selectedRegions, setSelectedRegions] = useState<number[]>([]);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [allRegions, setAllRegions] = useState<Region[]>();
    const [role, setRole] = useState<string>("");

    useEffect(() => {
        getCurrentUser().then(res => {
            const u: User = res.data;
            setRole(getUserRole(u.role.toString()));
            setUser(u);
            setFirstName(u.first_name);
            setLastName(u.last_name);
            setEmail(u.email);
            setPhoneNumber(u.phone_number);
            setSelectedRegions(u.region);
        }, err => {
            console.error(err);
        });
        getAllRegions().then((res) => {
            const regions: Region[] = res.data;
            setAllRegions(regions);
        })
    }, []);

    function handleSubmit() {

    }

    return (
        <>
            {
                (["Admin", "Superstudent"].includes(role)) && (<AdminHeader/>)
            }
            {
                ("Student" === role) && (<StudentHeader/>)
            }
            {
                ("Syndic" === role) && (<SyndicHeader/>)
            }
            <form onSubmit={handleSubmit}>
                <div className="d-flex align-items-center mb-3 pb-1">
                    <i className="fas fa-cubes fa-2x me-3"/>
                    <span className="h1 fw-bold mb-0">Profiel</span>
                </div>

                <div
                    className={
                        errorMessages.length !== 0 ? "visible alert alert-danger alert-dismissible fade show" : "invisible"
                    }
                >
                    <ul>
                        {errorMessages.map((err, i) => (
                            <li key={i}>{t(err)}</li>
                        ))}
                    </ul>
                    <button type="button" className="btn-close" data-bs-dismiss="alert"/>
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">Voornaam</label>
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
                    <label className="form-label">Achternaam</label>
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
                    <label className="form-label">E-mailadres</label>
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
                    <label className="form-label">Gsm-nummer</label>
                    <PhoneInput
                        country={"be"}
                        value={phoneNumber}
                        preferredCountries={["be", "nl"]}
                        onChange={(phone) => setPhoneNumber("+" + phone)}
                    />
                </div>

                <div className="form-outline mb-4">
                    <label className="form-label">Geselecteerde regio's:</label>
                    <label className="form-label small">* Dit geeft de regio's aan waar u wil werken.</label>
                    <select className="form-select" multiple aria-label="multiple select example"
                            value={selectedRegions.map(n => n.toString())}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                const options: HTMLOptionElement[] = Array.from(e.target.selectedOptions);
                                const values: number[] = options.map(option => Number(option.value));
                                console.log(values);
                                setSelectedRegions(values);
                            }}>
                        {
                            allRegions?.map((r: Region) => {
                                return (<option value={r.id} key={r.id}>{r.region}</option>)
                            })
                        }
                    </select>
                </div>

                <div className="pt-1 mb-4">
                    <button className={`btn btn-dark btn-lg btn-block ${styles.button}`} type="submit">
                        Pas aan
                    </button>
                </div>
            </form>
        </>
    );
}