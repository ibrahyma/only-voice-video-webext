import {ExtState} from "./state";

export interface Video {
    filename: string;
    url: string;
}

// export interface Cookie {
//     name: string;
//     hostOnly: boolean;
//     value: string;
//     domain: string;
//     path: string;
//     secure: boolean;
//     session?: boolean;
//     expirationDate?: number;
// }

export interface ExtensionMessage {
    action: 'getVideos' | 'getState' | 'setState' | 'sendMessageTo';
    destination: 'background' | 'script';
    stateParamsToSet?: Partial<ExtState>;
    // cookies?: Cookie[];
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
