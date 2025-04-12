import * as vscode from 'vscode';
import { MemViewPanelProvider } from './memviewDocument';
import { EndianType, RowFormatType } from './shared';
import { DualViewDoc } from './dualViewDoc';

const OneByteIntMemoryViewPanelCommandName = 'memoryview.1_byte_Int_View';
const FourBytesIntMemoryViewPanelCommandName = 'memoryview.4_byte_Int_View';
const EightBytesIntMemoryViewPanelCommandName = 'memoryview.8_byte_Int_View';
const LittleEndianMemoryViewPanelCommandName = 'memoryview.Little_Endian_View';
const BigEndianMemoryViewPanelCommandName = 'memoryview.Big_Endian_View';

export function registerCommands(
    context: vscode.ExtensionContext,
    memoryViewPanelProvider: MemViewPanelProvider
): void {
    rightClickContextMenuHandler(context, memoryViewPanelProvider);
}

function rightClickContextMenuHandler(context: vscode.ExtensionContext, memoryViewPanelProvider: MemViewPanelProvider) {
    context.subscriptions.push(
        vscode.commands.registerCommand(OneByteIntMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '1-byte');
        }),
        vscode.commands.registerCommand(FourBytesIntMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '4-byte');
        }),
        vscode.commands.registerCommand(EightBytesIntMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '8-byte');
        }),
        vscode.commands.registerCommand(LittleEndianMemoryViewPanelCommandName, () => {
            updateEndianTypeSettings(memoryViewPanelProvider, 'little');
        }),
        vscode.commands.registerCommand(BigEndianMemoryViewPanelCommandName, () => {
            updateEndianTypeSettings(memoryViewPanelProvider, 'big');
        })
    );
}

function updateRowFormatTypeSettings(memoryViewPanelProvider: MemViewPanelProvider, dataFormat: RowFormatType) {
    // Check if the current document is already in the desired format
    if (DualViewDoc.currentDoc?.format === dataFormat) {
        return;
    }

    memoryViewPanelProvider.updateCurrentMemoryViewSettings(dataFormat, undefined);
}

function updateEndianTypeSettings(memoryViewPanelProvider: MemViewPanelProvider, endianType: EndianType) {
    // Check if the current document is already in the desired format
    if (DualViewDoc.currentDoc?.endian === endianType) {
        return;
    }

    memoryViewPanelProvider.updateCurrentMemoryViewSettings(undefined, endianType);
}
