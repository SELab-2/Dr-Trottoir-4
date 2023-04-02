import React, {useEffect, useState} from "react";
import {getUserInfo, User} from "@/lib/user";
import {useRouter} from "next/router";
import styles from "@/styles/Login.module.css";
import AdminHeader from "@/components/header/adminHeader";
import {getAllRoles, Role} from "@/lib/role";
import {useTranslation} from "react-i18next";
import users from "@/pages/admin/data/users/index";

interface ParsedUrlQuery {
}

interface UserEditQuery extends ParsedUrlQuery {
    user?: number;
}

export default function AdminUserEdit() {
    const {t} = useTranslation();
    const router = useRouter();
    const query: UserEditQuery = router.query as UserEditQuery;
    const [userData, setUserData] = useState<User>();
    const [firstName, setFirstName] = useState<string>("");
    const [lastName, setLastName] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [allRoles, setAllRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("");

    useEffect(() => {
        if (!query.user) {
            return;
        }
        getUserInfo(query.user.toString()).then((res) => {
            const u: User = res.data;
            setUserData(u);
        });
        getAllRoles().then(res => {
            const roles: Role[] = res.data;
            setAllRoles(roles);
        });
    }, [router.isReady]);

    useEffect(() => {
        if (! userData || allRoles.length === 0) {
            return;
        }
        const r : Role = allRoles.find((r : Role) => r.id === userData.role)!
        setSelectedRole(r.name);
        console.log(r.name);
    }, [userData, allRoles]);

    return (
        <>
            <AdminHeader/>
            <div className="card-body p-4 p-lg-5 text-black">
                <form>
                    <div className="form-outline mb-4">
                        <label className="form-label">Voornaam</label>
                        <input type="text" className={`form-control form-control-lg ${styles.input}`} id="firstName"
                               value={userData ? userData.first_name : ""}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}/>
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Achternaam</label>
                        <input type="text" className={`form-control form-control-lg ${styles.input}`} id="lastName"
                               value={userData ? userData.last_name : ""}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}/>
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Email:</label>
                        <input type="text" readOnly className={`form-control form-control-lg ${styles.input}`}
                               id="email"
                               value={userData ? userData.email : ""}/>
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Telefoon:</label>
                        <input type="text" className={`form-control form-control-lg ${styles.input}`} id="phoneNumber"
                               value={userData ? userData.phone_number : ""}
                               onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}/>
                    </div>
                    <div className="form-outline mb-4">
                        <label className="form-label">Rol:</label>
                        <select className={`form-control form-control-lg ${styles.input}`}
                                value={selectedRole}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    const roleName: string = e.target.value;
                                    setSelectedRole(roleName);
                                }}>
                            {
                                allRoles.map((role: Role) => (
                                    <option value={role.name} key={role.name}>{t(role.name)}</option>))
                            }
                        </select>
                    </div>
                </form>
            </div>
        </>
    );
}
