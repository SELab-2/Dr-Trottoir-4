/**
 * This returns a list of all the errors in the errorMessage.
 * @param error
 */
export function handleError(error: any): string[] {
    let errorRes = error.response;
    if (!errorRes || !errorRes.data) {
        return [];
    }
    if (errorRes.status === 400) {
        let errors = [];
        let data: [any, string[]][] = Object.entries(errorRes.data);
        for (const [_, errorValues] of data) {
            if (Array.isArray(errorValues)) {
                errors.push(...errorValues);
            } else {
                errors.push(errorValues);
            }
        }
        return errors;
    } else if (errorRes && errorRes.status === 403) {
        const errorData: [any, string][] = Object.entries(errorRes.data);
        return errorData.map((val) => val[1]);
    } else if (errorRes.status >= 500) {
        return ["Er zijn momenteel server problemen, probeer later opnieuw."];
    } else {
        return [];
    }
}