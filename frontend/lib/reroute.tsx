export const getPageTag = (role: string): string => {
    // const role: string = sessionStorage.getItem("role") || "Default";
    let path: string = role.toLowerCase();
    if (role == "Superstudent") {
        path = "admin";
    }

    return path;
}

export default getPageTag;