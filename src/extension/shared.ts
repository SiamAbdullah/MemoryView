import { IMemPages } from './dualViewDoc';

export const UnknownDocId = 'Unknown';

export interface MemviewUriOptions {
    /**
     * `memoryReference` is what a debug adapter provides. It is an opaque string representing a location in memory.
     * If this exists, we use it if the there is no `expr`, or if you have an `expr` as a fallback memory location.
     * This is generally provided by automated tools and not something to be manually entered.
     */
    memoryReference?: string;

    /**
     * `expr` can be a constant memory address or an expression resulting in an address by debugger using evaluate().
     * URI path is used if no expr is specified
     */
    expr?: string;

    /**
     * We try to derive most of the following if not specified. If sessionId is specified, it should
     * be a currently running debugger (may not be active session). When we can't match the active
     * debug session with what the sessionId given, we may defer to until later.
     */
    sessionId?: string | 'current'; // Undefined also means 'current' if there is an active session

    /** If not supplied, use expr or the URI path */
    displayName?: string;

    /**
     * Following to can be used for better matching of an inactive memory view with a later active
     * debug session. Unfortunately, that only works when the debugger starts a new session
     */

    /** Session name for better matching with a future debug session. */
    sessionName?: string;

    /** Workspace folder associated with the debug session for better matching with a future debug session. */
    wsFolder?: string; // Must be a Uri.toString() of an actual wsFolder for the session
}

export enum CmdType {
    GetDocuments = 'GetDocuments',
    GetMemory = 'GetMemory',
    SetByte = 'GetMemory',
    DebugerStatus = 'DebuggerStatus',
    GetDebuggerSessions = 'DebuggerSessions',
    NewDocument = 'NewDocument',
    SaveClientState = 'SaveClientState',
    GetStartAddress = 'GetBaseAddress',
    ButtonClick = 'ButtonClick',
    SettingsChanged = 'SettingsChanged'
}

export interface IMessage {
    type: 'response' | 'command' | 'notice';
    seq: number;
    command: CmdType;
    body: any;
}

export interface ICmdBase {
    type: CmdType;
    seq?: number; // Must be filled in before sending
    sessionId: string; // Leave empty where session does not matter
    docId: string;
}

export interface ICmdGetDocuments extends ICmdBase {
    documents: IWebviewDocXfer[];
}

export interface MsgResponse {
    request: ICmdBase;
    resolve: (arg: any) => void;
    resonse?: any;
}

export interface IMemviewDocumentOptions {
    bytes: Uint8Array;
    uriString: string;
    fsPath: string;
    isReadonly?: boolean;
    memoryReference?: string;
    expression?: string;
    isFixedSize?: boolean;
    initialSize?: number;
}
export interface ICmdGetMemory extends ICmdBase {
    addr: string;
    count: number;
}

export interface ICmdGetStartAddress extends ICmdBase {
    expr: string;
    def: string;
}

export interface ICmdSetMemory extends ICmdGetMemory {
    bytes: Uint8Array;
}

export interface ICmdSetByte extends ICmdBase {
    addr: string;
    value: number; // Positive number is new value, neg is deletion
}

export interface IMemValue {
    changed?: boolean; // Changed on reload (different from edited)
    cur: number;
    orig: number;
    stale: boolean;
    inRange: boolean;
}

export type RowFormatType = '1-byte'| '2-byte' | '4-byte' | '8-byte' | '4-byte-float' | '8-byte-float';
export type EndianType = 'little' | 'big';
export type FormatByteNumber = 1 | 2 | 4 | 8;

export const BytesPerWordForFormatType: Record<string, FormatByteNumber> = {
  '1-byte': 1,
  '2-byte': 2,
  '4-byte': 4,
  '8-byte': 8,
  '4-byte-float': 4,
  '8-byte-float': 8,
};

export interface IModifiableProps {
    expr: string;
    displayName: string;
    endian: EndianType;
    format: RowFormatType;
}
export interface IWebviewDocInfo {
    displayName: string;
    sessionId: string;
    docId: string;
    sessionStatus: string;
    isModified: boolean;
    isCurrent: boolean;
    baseAddress: bigint;
    startAddress: bigint;
}

export interface ICmdSettingsChanged extends ICmdBase {
    settings: IModifiableProps;
}

export type ModifiedXferMap = { [addr: string]: number };
export interface IWebviewDocXfer {
    docId: string;
    sessionId: string; // The debug session ID, also the document Id
    sessionName: string; // The debug session name
    displayName: string;
    expr: string;
    wsFolder: string;
    startAddress: string;
    isReadOnly: boolean; // Where to start reading.
    format: RowFormatType;
    endian: EndianType;
    isCurrentDoc?: boolean;
    maxBytes?: number;
    modifiedMap?: ModifiedXferMap;
    memory?: IMemPages;
    baseAddressStale: boolean;
    clientState: { [key: string]: any };
}

export interface ICmdClientState extends ICmdBase {
    state: { [key: string]: any };
}

export type CmdButtonName =
    | 'close'
    | 'new'
    | 'select'
    | 'refresh'
    | 'settings'
    | 'copy-all-to-clipboard'
    | 'copy-all-to-file';
export interface ICmdButtonClick extends ICmdBase {
    button: CmdButtonName;
}

export interface IMemoryInterfaceCommands {
    getStartAddress(arg: ICmdGetStartAddress): Promise<string>;
    getMemory(arg: ICmdGetMemory): Promise<Uint8Array>;
    setMemory(arg: ICmdSetMemory): Promise<boolean>;
}

export type DebugSessionStatusSimple = 'initializing' | 'started' | 'running' | 'stopped' | 'terminated' | 'unknown';

export interface ITrackedDebugSessionXfer {
    sessionId: string;
    sessionName: string;
    sessionType: string;
    wsFolder: string;
    canWriteMemory: boolean;
    canReadMemory: boolean;
    status: DebugSessionStatusSimple;
    frameId?: number;
}
