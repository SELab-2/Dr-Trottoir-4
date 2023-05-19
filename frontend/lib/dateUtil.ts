
// Example output: "vrijdag 12 mei 2023 om 02:00 CEST"
export function convertToSensibleDateLong(date: Date | string ): string {
    return new Date(date + "").toLocaleString('nl-BE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        timeZone: 'Europe/Brussels',
        timeZoneName: 'short'
    });
}

export function convertToSensibleDateShort(date: Date | string ): string {
    return new Date(date + "").toLocaleString('nl-BE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

