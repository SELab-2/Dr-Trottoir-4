import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { verifyToken } from "@/lib/authentication";
import setSessionStorage from "@/lib/storage";
import { getRoleDirection } from "@/lib/reroute";
import { getCurrentUser, getUserRole, User } from "@/lib/user";

/**
 * This wraps a component where authorisation is required
 * @param WrappedComponent The component that requires wrapping (authorisation is necessary to access this page)
 * @param allowedRoles The allowed roles, this needs to be a list of strings.
 */
export const withAuthorisation = (WrappedComponent: any, allowedRoles: string[]) => {
    return (props: any) => {
        const router = useRouter();
        const [role, setRole] = useState("");

        useEffect(() => {
            // Verify if there is a valid token
            verifyToken().then(
                () => {
                    const storedRole = sessionStorage.getItem("role");
                    // If the role was saved in sessionStorage, set the role
                    if (storedRole) {
                        setRole(storedRole);
                    } else {
                        // If not, set the current user by doing a request
                        getCurrentUser().then(
                            async (res) => {
                                const user: User = res.data;
                                setSessionStorage(user.role.toString(), user.id.toString());
                                setRole(getUserRole(user.role.toString()));
                            },
                            (err) => {
                                console.error(err);
                            }
                        );
                    }
                },
                (err) => {
                    router.push("/login").then((_) => {
                        console.error(err);
                    });
                }
            );
        }, []);

        useEffect(() => {
            if (role && !allowedRoles.includes(role)) {
                router.replace("/no-access").then((_) => {
                    console.error("No access");
                });
            }
        }, [role]);

        return <>{allowedRoles.includes(role) ? <WrappedComponent {...props} /> : null}</>;
    };
};
