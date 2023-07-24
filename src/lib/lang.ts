export const languages = ['de', 'en'] as const satisfies readonly string[];
type LANG = typeof languages[number];

export const dictionary: { [lang in LANG]: { [key: string]: string } } = {
    de: {
        'bin-status.open': 'Offen',
        'bin-status.closed': 'Geschlossen',
        'bin-link.copy': 'Kopieren',
        'incoming-requests': 'Eingehende Anfragen',
        'new-bin': 'Neuer Bin',
        'clear-bin': 'Leeren',
        'refresh-bin': 'Erneuern',
        'available-until': 'Dieser Request Bin ist verfügbar bis',
        'by': 'von',
        'theme-dark': 'Dunkel',
        'theme-light': 'Hell',
    },
    en: {
        'bin-status.open': 'Open',
        'bin-status.closed': 'Closed',
        'bin-link.copy': 'Copy',
        'incoming-requests': 'Incoming Requests',
        'new-bin': 'New Bin',
        'clear-bin': 'Clear',
        'refresh-bin': 'Renew',
        'available-until': 'This Request Bin will be available until',
        'by': 'by',
        'theme-dark': 'Dark',
        'theme-light': 'Light',
    }
}