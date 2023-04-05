import BaseHeader from "@/components/header/baseHeader";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {getRoleDirection} from "@/lib/reroute";
import setSessionStorage from "@/lib/storage";
import {getCurrentUser} from "@/lib/user";
import MyCalendar from "@/components/calendar/calendar";
import AddEvent from "@/components/calendar/eventButton";

export default function Login() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // try and log in to the application using existing refresh token
    useEffect(() => {
        getCurrentUser().then(
            async (res) => {
                const user = res.data;
                const roleId = user.role;
                setSessionStorage(roleId, user.id);
                const direction = getRoleDirection(roleId, "dashboard");
                await router.push(direction);
            },
            (err) => {
                setLoading(false);
                console.error(err);
            }
        );
    }, [getCurrentUser]);

    return (
        <>
            <BaseHeader/>
            <div className="container-fluid">
                <div className="row">
                    <div className={`col-md-2 ${sidebarOpen ? "" : "d-none"} bg-light sidebar`}>
                        <div className="sidebar-sticky">
                            <ul className="nav flex-column">
                                <li className="nav-item">
                                    <button className="btn btn-primary btn-block mb-2">Button 1</button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-primary btn-block mb-2">Button 2</button>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-primary btn-block mb-2">Button 3</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className={`col-md-10 ${sidebarOpen ? "" : "col-md-12"}`}>
                        <button className="btn btn-primary mb-3" onClick={toggleSidebar}>
                            {sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                        </button>
                        <AddEvent/>
                        <MyCalendar/>
                    </div>
                </div>
            </div>
        </>
    );
}
