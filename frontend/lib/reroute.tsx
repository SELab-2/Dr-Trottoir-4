
export function getSpecificDirection(role: string, direction: string): string {
    
    let path: string = role.toLowerCase();
    if (role == "Superstudent") {
        path = "admin";
    }

    return `${path}/${direction}`;
}

export default getSpecificDirection;