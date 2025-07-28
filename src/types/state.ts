import {Tabs} from "webextension-polyfill";
import {Video} from "./video";
import Tab = Tabs.Tab;

export interface ExtState {
    loadingState: LoadingState;
    videos: Video[];
    currentTab: Tab;
    error?: string;
}

interface LoadingState {
    inProgress: boolean;
    // percentage: number;
    // steps: {
    //     current: number;
    //     total: number;
    //     designation: string;
    // }
}
