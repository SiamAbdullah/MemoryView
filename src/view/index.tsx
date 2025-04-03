import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { globalsInit, myGlobals, vscodePostCommand } from '../extension/webviewGlobals';
import * as Utils from '../extension/utils';
import { RecoilRoot } from 'recoil';
import './index.css';

import { HexTableVirtual2 } from './hexTableVirtual';
import { MemViewToolbar } from './topPanel';
import { DualViewDoc } from '../extension/dualViewDoc';
import {
    ICmdGetMemory,
    ICmdGetStartAddress,
    IMemoryInterfaceCommands,
    CmdType,
    ICmdBase,
    ICmdSetMemory
} from '../extension/shared';

class MemoryInterfaceFromVSCode implements IMemoryInterfaceCommands {
    getStartAddress(arg: ICmdGetStartAddress): Promise<string> {
        return vscodePostCommand(arg);
    }

    getMemory(arg: ICmdGetMemory): Promise<Buffer> {
        return vscodePostCommand(arg);
    }
    setMemory(arg: ICmdSetMemory): Promise<boolean> {
        return vscodePostCommand(arg);
    }
}

const timer = new Utils.Timekeeper();
// console.log('initializing webview');

function doStartup() {
    globalsInit();
    DualViewDoc.init(new MemoryInterfaceFromVSCode());

    const promises = [];
    const msg: ICmdBase = {
        type: CmdType.GetDocuments,
        seq: 0,
        sessionId: '',
        docId: ''
    };
    promises.push(vscodePostCommand(msg));
    msg.type = CmdType.GetDebuggerSessions;
    promises.push(vscodePostCommand(msg));

    Promise.all(promises)
        .catch((e) => {
            console.error('Failed to do startup sequence', e);
        })
        .finally(() => {
            startRender();
        });
}

function startRender() {
    ReactDOM.render(
        <RecoilRoot>
            <MemViewToolbar junk='abcd'></MemViewToolbar>
            <HexTableVirtual2 />
        </RecoilRoot>,
        document.getElementById('root')
    );

    myGlobals.vscode?.postMessage({ type: 'started' });
    false && console.log(`HexTable:render ${timer.deltaMs()}ms`);
}

doStartup();
