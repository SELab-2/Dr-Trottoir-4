import React, { useEffect, useState } from "react";
import { getCurrentUser, getUserRole, patchUser, User } from "@/lib/user";
import styles from "@/styles/Login.module.css";
import PhoneInput from "react-phone-input-2";
import { useTranslation } from "react-i18next";
import { getAllRegions, RegionInterface } from "@/lib/region";
import AdminHeader from "@/components/header/adminHeader";
import StudentHeader from "@/components/header/studentHeader";
import SyndicHeader from "@/components/header/syndicHeader";
import { getAndSetErrors } from "@/lib/error";

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
                console.log(res.data);
                const u: User = res.data;
                setUserInfo(u);
                setSuccessPatch(true);
            },
            (err) => {
                let errorRes = err.response;
                if (errorRes && errorRes.status === 400) {
                    getAndSetErrors(Object.entries(errorRes.data), setErrorMessages);
                } else if (errorRes && errorRes.status === 403) {
                    const errorData: [any, string][] = Object.entries(errorRes.data);
                    setErrorMessages(errorData.map((val) => val[1]));
                } else {
                    console.error(err);
                }
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
            <div className="d-flex align-items-center mb-3 pb-1">
                <i className="fas fa-cubes fa-2x me-3" />
                <span className="h1 fw-bold mb-0">Profiel</span>
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
                <label className="form-label">{`Rol : ${user ? t(getUserRole(user.role.toString())) : ""}`}</label>
            </div>

            <div className="form-outline mb-4">
                <label className="form-label">Regio's waarin u wilt werken:</label>
                <select
                    className="form-select"
                    multiple
                    aria-label="multiple select example"
                    title={"Dit is enkel van toepassing voor (super-)studenten/admins."}
                    value={selectedRegions.map((n) => n.toString())}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const options: HTMLOptionElement[] = Array.from(e.target.selectedOptions);
                        const values: number[] = options.map((option) => Number(option.value));
                        setSelectedRegions(values);
                    }}
                >
                    {allRegions?.map((r: RegionInterface) => {
                        return (
                            <option value={r.id} key={r.id}>
                                {r.region}
                            </option>
                        );
                    })}
                </select>
            </div>

            <div className="pt-1 mb-4">
                <button className={`btn btn-dark btn-lg btn-block ${styles.button}`} onClick={submit}>
                    Pas aan
                </button>
            </div>
        </>
    );
}
