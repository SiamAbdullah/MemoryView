import * as vscode from 'vscode';
import querystring from 'node:querystring';
// import * as path from 'path';
import { DebugTrackerFactory } from './extension/debugTracker';
import { DebugTracker } from './debugTracker/exports';
import { /*MemviewDocumentProvider, */ MemViewPanelProvider } from './extension/memviewDocument';
import { registerCommands } from './extension/commmandRegistration';
import { MemviewUriOptions } from './extension/shared';
/**
 * It is best to add a new memory view when a debug session is active and in stopped
 * status. Otherwise, there has to be a lot of guessing and we may not always get it right
 * or get it right immediately.
 *
 * Note that once we match a memory view with a debug session, we start tracking it for
 * future invocations and automatically bind to a new session. Of course, this can fail
 * if the session name changes or workspace folder changes.
 */

export class MemViewExtension {
    static Extension: MemViewExtension;
    private tracker: DebugTrackerFactory;
    private toggleMemoryView() {
        const config = vscode.workspace.getConfiguration('memoryview', null);
        const isEnabled = !config.get('showMemoryPanel', true);
        const panelLocation = config.get('memoryViewLocation', 'panel');
        config.update('showMemoryPanel', isEnabled);
        const status = isEnabled ? `visible in the '${panelLocation}' area` : 'hidden';
        vscode.window.showInformationMessage(`Memory views are now ${status}`);
    }

    static async enableMemoryView() {
        const config = vscode.workspace.getConfiguration('memoryview', null);
        const isEnabled = config.get('showMemoryPanel', true);
        if (!isEnabled) {
            await config.update('showMemoryPanel', true);
            MemViewExtension.Extension.setContexts();
        }
    }

    private onSettingsChanged(_e: vscode.ConfigurationChangeEvent) {
        this.setContexts();
    }

    private setContexts() {
        const config = vscode.workspace.getConfiguration('memoryview', null);
        const isEnabled = config.get('showMemoryPanel', true);
        const panelLocation = config.get('memoryViewLocation', 'panel');
        vscode.commands.executeCommand('setContext', 'memoryview:showMemoryPanel', isEnabled);
        vscode.commands.executeCommand('setContext', 'memoryview:memoryPanelLocation', panelLocation);
    }

    onDeactivate() {
        MemViewPanelProvider.saveState();
    }

    constructor(public context: vscode.ExtensionContext) {
        MemViewExtension.Extension = this;
        const debugTracker = new DebugTracker(context);
        this.tracker = DebugTrackerFactory.register(context, debugTracker);
        // MemviewDocumentProvider.register(context);

        // intialize the memory view panel provider. MemViewPanelProvider.Provider
        MemViewPanelProvider.register(context);

        this.setContexts();

        // register the commands for the memoryview extensions.
        registerCommands(context, MemViewPanelProvider.Provider, this.tracker);

        context.subscriptions.push(
            vscode.workspace.onDidChangeConfiguration(this.onSettingsChanged.bind(this)),

            /**
             * HACK: I wish there was a way to detect when a new custom editor or a webview opens. We just monitor any changes
             * in tabs ans scan sor newly opened stuff. Please let me know if there is an alternate API
             */
            vscode.window.tabGroups.onDidChangeTabs(this.tabsChanged.bind(this))
        );
    }

    protected async tabsChanged(ev: vscode.TabChangeEvent) {
        if (!vscode.debug.activeDebugSession || !ev.opened || ev.opened.length === 0) {
            return;
        }
        const config = vscode.workspace.getConfiguration('memoryview', null);
        const trackingAllowed = config?.get('tracking.duplicateDebuggerMemoryViews', true);
        const trackAllowedSilent = config?.get('tracking.duplicateDebuggerMemoryViewsSilently', false);
        const closeHexEditorAfterDuplicating = config?.get('tracking.closeHexEditorAfterDuplicating', true);
        if (trackingAllowed || trackAllowedSilent) {
            for (const tab of ev.opened) {
                const tabType = tab.input as any;
                const viewType = tabType?.viewType as string;
                const origUri = tabType?.uri as vscode.Uri;
                if (origUri && viewType === 'hexEditor.hexedit' && origUri.scheme === 'vscode-debug-memory') {
                    // console.log('Tab: ', tab.label, origUri.toString());
                    const regEx = /\/(.*)\//;
                    const match = regEx.exec(origUri.path);
                    if (match) {
                        const memRef = match[1];
                        const options: MemviewUriOptions = {
                            expr: memRef
                        };
                        const newUri = vscode.Uri.from({
                            scheme: vscode.env.uriScheme,
                            authority: 'Debugger.memoryview',
                            path: '/' + encodeURIComponent(memRef),
                            query: querystring.stringify(options as any)
                        });
                        const existing = MemViewPanelProvider.Provider.findByUri(newUri);
                        if (!existing.doc) {
                            if (trackAllowedSilent) {
                                try {
                                    await MemViewPanelProvider.Provider.handleUri(newUri);
                                    if (closeHexEditorAfterDuplicating) {
                                        try {
                                            const newItem = MemViewPanelProvider.Provider.findByUri(newUri);
                                            if (newItem.doc) {
                                                vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                                            }
                                        } catch (e) {
                                            // Do nothing
                                        }
                                    }
                                } catch (e) {
                                    vscode.window.showErrorMessage(`newMemoryView failed: ${e}`);
                                }
                            } else {
                                // This will cause a prompt by VSCode
                                vscode.env.openExternal(newUri).then((success: boolean) => {
                                    if (success) {
                                        // console.log(`Operation URI open: success=${success}`);
                                        vscode.window.showInformationMessage(
                                            'Completed (hopefully) duplicating the HexEditor window. You can change our extension settings, to do this silently. And, optionally close the HexEditor'
                                        );
                                        if (closeHexEditorAfterDuplicating) {
                                            vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                                        }
                                    } else {
                                        vscode.window.showInformationMessage(
                                            'Failed to duplicate HexEditor window. Unknown reason. Try the silent method in this extension settings'
                                        );
                                    }
                                }),
                                    (e: any) => {
                                        console.error(e);
                                    };
                            }
                        } else if (closeHexEditorAfterDuplicating) {
                            vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                        }
                    }
                }
            }
        }
    }
}

export function activate(context: vscode.ExtensionContext) {
    new MemViewExtension(context);
}

// this method is called when your extension is deactivated
export function deactivate() {
    MemViewExtension.Extension.onDeactivate();
    console.log('Deactivating memview');
}
