import { useEffect, useState } from "react";
import { useRouter } from "next/router";

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
            const storedRole = sessionStorage.getItem("role"); // Get the role stored in sessionStorage
            if (storedRole) {
                setRole(storedRole);
            } else {
                router.push("/no-access").then((_) => {
                    console.error("No access");
                });
            }
        }, []);

        useEffect(() => {
            if (role && !allowedRoles.includes(role)) {
                router.push("/no-access").then((_) => {
                    console.error("No access");
                });
            }
        }, [role]);

        if (allowedRoles.includes(role)) {
            return <WrappedComponent {...props} />;
        } else {
            return null;
        }
    };
};
