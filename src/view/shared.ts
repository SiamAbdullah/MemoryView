export interface IMemValue32or64 {
    cur: bigint;
    orig: bigint;
    bufferCur: Uint8Array;
    changed: boolean;
    stale: boolean;
    invalid: boolean;
    dataType: HexWordDataType;
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

export enum HexWordDataType {
    Byte = 'Byte',
    Int16 = 'Int16',
    Int32 = 'Int32',
    Int64 = 'Int64',
    Float32 = 'Float32',
    Float64 = 'Float64',
  }

export function getFloat32AsString(inputArray: Uint8Array, isLittleEndian: boolean): string {
    if (inputArray && inputArray.length >= 4) {
      const dataview = new DataView(inputArray.buffer);
      const float32 = dataview.getFloat32(0, isLittleEndian);
  
      let float32String = float32.toString();
      if (float32String !== 'NaN') {
        float32String = float32.toPrecision(9).toString();
      }
  
      return float32String;
    }
  
    return 'NaN';
}

export function getFloat64AsString(inputArray: Uint8Array, isLittleEndian: boolean): string {
    if (inputArray && inputArray.length >= 4) {
      const dataview = new DataView(inputArray.buffer);
      const float32 = dataview.getFloat64(0, isLittleEndian);
  
      let float32String = float32.toString();
      if (float32String !== 'NaN') {
        float32String = float32.toPrecision(9).toString();
      }
  
      return float32String;
    }
  
    return 'NaN';
}

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
