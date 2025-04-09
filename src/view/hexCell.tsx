import * as React from 'react';
import { DualViewDoc } from '../extension/dualViewDoc';
import { SelContext } from '../extension/selection';
import { hexValuesLookup, charCodesLookup } from './shared';
import { IMemValue } from '../extension/shared';

export const HexCellValueHeader: React.FunctionComponent<{
    value: number;
    bytesPerCell: number;
}> = ({ value, bytesPerCell }) => {
    const classNames = `hex-cell hex-cell-value-header hex-cell-value-header${bytesPerCell} `;
    let valueStr = hexValuesLookup[(value >>> 0) & 0xff];
    if (bytesPerCell !== 1) {
        if (DualViewDoc.currentDoc?.endian === 'big') {
            valueStr = valueStr + '-' + hexValuesLookup[((value + bytesPerCell - 1) >>> 0) & 0xff];
        } else {
            valueStr = hexValuesLookup[((value + bytesPerCell - 1) >>> 0) & 0xff] + '-' + valueStr;
        }
    }
    return <span className={classNames}>{valueStr}</span>;
};

export const HexCellEmptyHeader: React.FunctionComponent<{
    length?: number;
    fillChar?: string;
    cls?: string;
}> = ({ length = 1, fillChar = ' ', cls = '' }) => {
    const classNames = `hex-cell hex-cell-char-header ${cls}`;
    const valueStr = fillChar.repeat(length);
    return <span className={classNames}>{valueStr}</span>;
};

export const HexCellEmpty: React.FunctionComponent<{
    length: number;
    fillChar?: string;
    cls?: string;
}> = ({ length = 1, fillChar = ' ', cls = '' }) => {
    const classNames = 'hex-cell ' + cls;
    const valueStr = fillChar.repeat(length);
    return <span className={classNames}>{valueStr}</span>;
};

export const HexCellAddress: React.FC<{ address: bigint; cls?: string }> = ({ address, cls }) => {
    const [copied, setCopied] = React.useState(false);
    const classNames = 'hex-cell hex-cell-address ' + cls;
    const valueStr = address.toString(16).padStart(16, '0').padEnd(18, ' ');
    // const id = `hex-cell-address-${address}`;

    const copyToClipboard = (text: string) => {
        let value = text.trim();
        if (!value.startsWith('0x')) {
            value = '0x' + value;
        }

        void navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 1000); // reset copied state after 1 seconds
        });
    };

    return (
        <div>
            <span data-tooltip className={classNames} onClick={() => copyToClipboard(valueStr)}>
                {valueStr}
            </span>
            {copied && <span className='tooltip'>Copied!</span>}
        </div>
    );
};

export const HexCellChar: React.FunctionComponent<{
    address: bigint;
    byteInfo: IMemValue;
}> = ({ address, byteInfo }) => {
    const val = byteInfo.cur;
    const origVal = byteInfo.orig;
    const valueStr = val >= 0 ? charCodesLookup[val] : '~~';
    let classNames = 'hex-cell hex-cell-char' + (val !== origVal || byteInfo.changed ? ' hex-cell-char-changed' : '');
    if (SelContext.isSelected(address)) {
        classNames += ' selected-char';
    }
    return <span className={classNames}>{valueStr}</span>;
};
