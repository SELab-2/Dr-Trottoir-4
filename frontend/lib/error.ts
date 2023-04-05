export function getAndSetErrors(errorData : [any, string[]][], callback : (value : any) => any) {
    let errors = [];
    for (const [_, errorValues] of errorData) {
        errors.push(...errorValues);
    }
    callback([...errors]);
}