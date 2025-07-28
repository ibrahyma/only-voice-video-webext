import {ExtensionMessage, ExtensionResponse} from "./types/video";
import {Runtime} from "webextension-polyfill";
import {ExtState} from "./types/state";

class VideoManager {
    public readonly BACKEND_BASEDOMAIN = "localhost:8000";
    private state!: ExtState;

    constructor() {
        this.initState();
        this.setupEventListeners();
    }

    private async initState() {
        this.state = {
            loadingState: {inProgress: false},
            videos: [],
            currentTab: (await browser.tabs.query({active: true, lastFocusedWindow: true}))[0]
        };


    }

    private setupEventListeners() {
        browser.tabs.onRemoved.addListener(tabId => {
            console.log(`Onglet ${tabId} fermé, suppression du cache`);

        });

        browser.tabs.onUpdated.addListener((_, changeInfo, tab) => {
            if (changeInfo.url) {
                this.state.currentTab = tab;
            }
        });

        browser.tabs.onActivated.addListener(async activeInfo => {
            this.state.currentTab = await browser.tabs.get(activeInfo.tabId);
        })

        browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
            const message = request as ExtensionMessage;
            this.handleExtensionMessage(message, sender, sendResponse);
            return true;
        });
    }

    private async handleExtensionMessage(
        request: ExtensionMessage,
        _: Runtime.MessageSender,
        sendResponse: (response?: ExtensionResponse) => void
    ) {
        try {

            if (request.destination !== 'background') {
                return;
            }

            switch (request.action) {
                case "getVideos":
                    if (!request.url) {
                        throw new Error("URL manquante");
                    }

                    await this.getVideosAPI(sendResponse);
                    break;

                case "getState":
                    sendResponse({success: true, upToDateState: this.state});
                    return;

                case "setState":
                    this.state = {...this.state, ...request.stateParamsToSet};
                    break;

                default:
                    throw new Error("Action inconnue");
            }
        } catch (error: any) {
            console.error("Erreur dans handleExtensionMessage", error);
            this.state.error = error.message;
        } finally {
            sendResponse({success: !this.state.error, upToDateState: this.state});
        }
    }

    private async getVideosAPI(
        sendResponse: (response?: ExtensionResponse) => void
    ) {
        this.state.loadingState.inProgress = true;
        this.state.videos = [];

        const currentUrl = this.state.currentTab.url as string;
        const message: ExtensionMessage = {
            action: "sendMessageTo", destination: "script",
            message: {type: "state", content: this.state}
        };

        await browser.runtime.sendMessage(message);

        try {
            const response = await fetch(`http://${this.BACKEND_BASEDOMAIN}/convert?url=${encodeURIComponent(currentUrl)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                }
            });

            if (response.status === 404) {
                throw new Error("Aucune vidéo trouvée");
            }

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const jsonResponse = await response.json();
            this.state.videos = jsonResponse.videos;

            if (jsonResponse.error) {
                throw new Error(jsonResponse.error);
            }
        }
        catch (error: any) {
            this.state.error = error.message;
        }
        finally {
            this.state.loadingState.inProgress = false;
            sendResponse({success: !this.state.error, upToDateState: this.state});
        }
    }
}

new VideoManager();
