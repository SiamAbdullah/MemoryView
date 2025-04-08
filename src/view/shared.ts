export interface IMemValue32or64 {
    cur: bigint;
    orig: bigint;
    changed: boolean;
    stale: boolean;
    invalid: boolean;
}

const odStyleChars = [
    'nul',
    'soh',
    'stx',
    'etx',
    'eot',
    'enq',
    'ack',
    'bel',
    'bs',
    'ht',
    'nl',
    'vt',
    'ff',
    'cr',
    'so',
    'si',
    'dle',
    'dc1',
    'dc2',
    'dc3',
    'dc4',
    'nak',
    'syn',
    'etb',
    'can',
    'em',
    'sub',
    'esc',
    'fs',
    'gs',
    'rs',
    'us',
    'sp'
];

export const charCodesLookup: string[] = [];
export const hexValuesLookup: string[] = [];

let initializedCharCode = false;
function initCharCodes(): void {
    if (initializedCharCode) {
        return;
    }

    initializedCharCode = true;
    for (let byte = 0; byte <= 255; byte++) {
        const v =
            byte < 32
                ? odStyleChars[byte]
                : byte === 127
                ? 'del'
                : byte > 127 && byte <= 159
                ? '.'
                : String.fromCharCode(byte);
        charCodesLookup.push(v);
        hexValuesLookup.push(byte.toString(16).padStart(2, '0'));
    }
}

// Initialize global data for view components
initCharCodes();
