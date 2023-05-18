import {getUserRole} from "@/lib/user";

export default function setSessionStorage(roleId: string, userId: string) {
    const role: string = getUserRole(roleId);

    sessionStorage.setItem("id", userId);
    sessionStorage.setItem("role", role);
}
