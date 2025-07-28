import {ExtState} from "./state";

export interface Video {
    filename: string;
    url: string;
}

export interface ExtensionMessage {
    action: 'getVideos' | 'getState' | 'setState' | 'sendMessageTo';
    destination: 'background' | 'script';
    stateParamsToSet?: Partial<ExtState>;
    url?: string;
    message?: {
        type: string;
        content: any;
    };
}

export interface ExtensionResponse {
    success: boolean;
    upToDateState: ExtState;
}
