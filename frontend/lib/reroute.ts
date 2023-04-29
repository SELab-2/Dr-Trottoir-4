import {getUserRole} from "@/lib/user";

export function getSpecificDirection(role: string, direction: string): string {
    let path: string = role.toLowerCase();
    if (role == "Superstudent") {
        path = "admin";
    }

    return `${path}/${direction}`;
}

export function getRoleDirection(roleId: string, direction: string): string {
    const role: string = getUserRole(roleId);
    return getSpecificDirection(role, direction);
}

export default getSpecificDirection;
