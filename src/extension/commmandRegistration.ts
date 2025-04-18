import * as vscode from 'vscode';
import querystring from 'node:querystring';
import { MemViewPanelProvider } from './memviewDocument';
import { DebugTrackerFactory } from './debugTracker';
import { EndianType, RowFormatType, MemviewUriOptions } from './shared';
import { DualViewDoc } from './dualViewDoc';

const ToggleMemoryViewCommandName = 'Debugger.memoryview.toggleMemoryView';
const UriTestCommandName = 'Debugger.memoryview.uriTest';
const AddMemViewPanelCommandName = 'Debugger.memoryview.addMemoryView';

const OneByteIntMemoryViewPanelCommandName = 'memoryview.1_byte_Int_View';
const TwoByteIntMemoryViewPanelCommandName = 'memoryview.2_byte_Int_View';
const FourBytesIntMemoryViewPanelCommandName = 'memoryview.4_byte_Int_View';
const EightBytesIntMemoryViewPanelCommandName = 'memoryview.8_byte_Int_View';

const FourBytesFloatMemoryViewPanelCommandName='memoryview.4_byte_Float_View';
const EightBytesFloatMemoryViewPanelCommandName='memoryview.8_byte_Float_View';

const LittleEndianMemoryViewPanelCommandName = 'memoryview.Little_Endian_View';
const BigEndianMemoryViewPanelCommandName = 'memoryview.Big_Endian_View';

export function registerCommands(
    context: vscode.ExtensionContext,
    memoryViewPanelProvider: MemViewPanelProvider,
    tracker: DebugTrackerFactory
): void {
    registerRightClickContextMenuCommands(context, memoryViewPanelProvider);
    registerDebuggerCommands(context, tracker);
}

// This function registers the commands for the debugger
// It allows the user to toggle the memory view visibility and test the URI
// by executing the appropriate command from the command palette
function registerDebuggerCommands(context: vscode.ExtensionContext, tracker: DebugTrackerFactory) {
    context.subscriptions.push(
        vscode.commands.registerCommand(ToggleMemoryViewCommandName, () => {
            toggleMemoryView();
        }),
        vscode.commands.registerCommand(UriTestCommandName, () => {
            uriTestCommnad();
        }),
        // The following will add a memory view. If no arguments are present then the user will be prompted for an expression
        vscode.commands.registerCommand(
            AddMemViewPanelCommandName,
            (constOrExprOrMemRef?: string, opts?: MemviewUriOptions) => {
                if (tracker.isActive()) {
                    MemViewPanelProvider.newMemoryView(constOrExprOrMemRef, opts);
                } else {
                    vscode.window.showErrorMessage(
                        'Cannot execute this command as the debug-tracker-vscode extension did not connect properly'
                    );
                }
            }
        )
    );
}

// This function registers the commands for the right-click context menu in the memory view panel
// It allows the user to change the row format type and endian type of the memory view
// by selecting the appropriate command from the context menu
function registerRightClickContextMenuCommands(
    context: vscode.ExtensionContext,
    memoryViewPanelProvider: MemViewPanelProvider
) {
    context.subscriptions.push(
        vscode.commands.registerCommand(OneByteIntMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '1-byte');
        }),
        vscode.commands.registerCommand(TwoByteIntMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '2-byte');
        }),
        vscode.commands.registerCommand(FourBytesIntMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '4-byte');
        }),
        vscode.commands.registerCommand(EightBytesIntMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '8-byte');
        }),
        vscode.commands.registerCommand(FourBytesFloatMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '4-byte-float');
        }),
        vscode.commands.registerCommand(EightBytesFloatMemoryViewPanelCommandName, () => {
            updateRowFormatTypeSettings(memoryViewPanelProvider, '8-byte-float');
        }),
        vscode.commands.registerCommand(LittleEndianMemoryViewPanelCommandName, () => {
            updateEndianTypeSettings(memoryViewPanelProvider, 'little');
        }),
        vscode.commands.registerCommand(BigEndianMemoryViewPanelCommandName, () => {
            updateEndianTypeSettings(memoryViewPanelProvider, 'big');
        })
    );
}

function toggleMemoryView() {
    const config = vscode.workspace.getConfiguration('memoryview', null);
    const isEnabled = !config.get('showMemoryPanel', true);
    const panelLocation = config.get('memoryViewLocation', 'panel');
    config.update('showMemoryPanel', isEnabled);
    const status = isEnabled ? `visible in the '${panelLocation}' area` : 'hidden';
    vscode.window.showInformationMessage(`Memory views are now ${status}`);
}

function uriTestCommnad() {
    const options: MemviewUriOptions = {
        expr: '&buf'
    };

    if (vscode.debug.activeDebugSession) {
        options.sessionId = vscode.debug.activeDebugSession.id;
    }

    const uri = vscode.Uri.from({
        scheme: vscode.env.uriScheme,
        authority: 'Debugger.memoryview',
        path: '/' + encodeURIComponent('&buf'),
        query: querystring.stringify(options as any)
    });

    console.log('Opening URI', uri.toString());
    vscode.env.openExternal(uri).then((success: boolean) => {
        console.log(`Operation URI open: success=${success}`);
    }),
        (e: any) => {
            console.error(e);
        };
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
