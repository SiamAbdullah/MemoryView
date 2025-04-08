import * as React from 'react';
import { DualViewDoc } from '../extension/dualViewDoc';
import { HexCellValueHeader, HexCellEmptyHeader, HexCellEmpty, HexCellAddress } from './hexCell';

export interface IHexHeaderRow {
    style?: any;
    cls?: string;
}

export function HexHeaderRow(props: IHexHeaderRow): JSX.Element {
    const fmt = DualViewDoc.currentDoc?.format;
    const bytesPerCell = fmt === '1-byte' ? 1 : fmt === '4-byte' ? 4 : 8;
    const classNames = `hex-header-row scrollHorizontalSync ${props.cls || ''}`;
    const addrCells: JSX.Element[] = [];
    const bytesInRow = bytesPerCell === 1 ? 16 : 32;

    let key = 2;
    for (let ix = 0; ix < bytesInRow; ix += bytesPerCell) {
        addrCells.push(<HexCellValueHeader key={key++} value={ix % bytesInRow} bytesPerCell={bytesPerCell} />);
    }
    const decodedTextCells: JSX.Element[] = [];
    if (bytesPerCell === 1) {
        const tmp = 'Decoded Bytes'.padEnd(16, ' ');
        let decodedText = '';
        for (let ix = 0; ix < bytesInRow; ix += 16) {
            decodedText += tmp;
        }
        const asList = decodedText.split('');
        for (let ix = 0; ix < bytesInRow; ix++) {
            const v = asList[ix];
            decodedTextCells.push(<HexCellEmptyHeader key={key++} fillChar={v} />);
        }
    }
    return (
        <div className={classNames} style={props.style || {}}>
            <HexCellAddress key={100} cls='header-cell-address' address={DualViewDoc.currentDoc?.startAddress ?? 0n} />
            {addrCells}
            <HexCellEmpty key={101} length={1} fillChar='.' cls='hex-cell-invisible' />
            {decodedTextCells}
        </div>
    );
}
