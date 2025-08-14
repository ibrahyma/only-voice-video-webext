import {ExtensionMessage, ExtensionResponse, Video} from "../../types/video";
import {ExtState} from "../../types/state";
import {Tabs} from "webextension-polyfill";
import Tab = Tabs.Tab;
import {getUrlDomain} from "../../utils/functions";

class HomePopupUI {
    private extState!: ExtState;
    private videosSection!: HTMLElement;
    private footerTag!: HTMLElement;
    private mainTag!: HTMLElement;
    private fetchVideosButton!: HTMLButtonElement;

    constructor() {

        const construct = async () => {
            await this.load();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', construct);
        }
        else {
            construct();
        }

        browser.runtime.onMessage.addListener(this.handleMessage);
    }

    private async load() {
        await this.getState();

        const { loadingState, videos, error } = this.extState;
        const existingVideosSection = document.querySelector("#videos") as HTMLElement;

        this.mainTag = document.querySelector("main") as HTMLElement;
        this.footerTag = document.querySelector("footer") as HTMLElement;

        if (!!existingVideosSection) {
            this.videosSection = existingVideosSection;
        }
        else {
            this.videosSection = document.createElement("section");
            this.videosSection.id = "videos";
        }

        this.fetchVideosButton = document.getElementById("btn-fetch-videos") as HTMLButtonElement;
        this.fetchVideosButton.addEventListener("click", () => {
            this.fetchVideos();
        });


        if (loadingState.inProgress) {
            await this.processLoading();
        }
        else {
            await this.stopLoading();
        }

        if (videos.length > 0) {
            this.putVideosToUI();
        }

        if (error) {
            this.showErrorMessage();
        }
    }

    private handleMessage = async (message: any) => {
        const receivedMessage = message as ExtensionMessage;
        if (receivedMessage.destination !== "script") return;

        if (receivedMessage.message) {
            const { type, content } = receivedMessage.message!;

            if (type === "state") {
                this.extState = content;
            }
        }

        await this.load();
    }

    private async getState() {
        const message: ExtensionMessage = { action: "getState", destination: "background" };
        const response: ExtensionResponse = (await browser.runtime.sendMessage(message)) as ExtensionResponse;
        this.extState = response.upToDateState;
    }


    private async setState(stateParamsToSet: Partial<ExtState>) {
        const message: ExtensionMessage = {
            action: "setState", destination: "background",
            stateParamsToSet: stateParamsToSet
        };

        const response: ExtensionResponse = (await browser.runtime.sendMessage(message)) as ExtensionResponse;

        this.extState = response.upToDateState;
    }

    private async fetchVideos() {
        const currentTab = this.extState.currentTab as Tab;
        // const cookies = await browser.cookies.getAll({ domain: getUrlDomain(this.extState.currentTab.url!)});

        const message: ExtensionMessage = {
            action: "getVideos", destination: "background",
            url: currentTab.url/*, cookies*/ };

        const response = (await browser.runtime.sendMessage(message)) as ExtensionResponse;

        this.extState = response.upToDateState;
        await this.load();
    }

    private putVideosToUI() {
        this.videosSection.innerHTML = "";
        this.extState.videos.forEach((video: Video) => {
            this.videosSection.append(this.generateVideoContainerItem(video));
        });
        this.mainTag.appendChild(this.videosSection);
    }

    private async processLoading() {
        this.videosSection.remove();
        this.footerTag.innerHTML = "";
        this.fetchVideosButton.disabled = true;
        this.fetchVideosButton.textContent = "En cours de conversion...";
        this.footerTag.insertAdjacentHTML("beforeend", `<div class="loader"></div>`);
    }

    private async stopLoading() {
        this.fetchVideosButton.disabled = false;
        this.fetchVideosButton.textContent = "Convertir les vidéos";
        this.footerTag.querySelector(".loader")?.remove();
    }

    private generateVideoContainerItem(video: Video): HTMLDivElement {
        const videoContainer = document.createElement("div");
        videoContainer.oncontextmenu = () => false;
        videoContainer.className = "video-container";
        videoContainer.innerHTML = `
            <video src="${video.url}"></video>
            <span title="${video.filename}">${video.filename}</span>
            <a href="${video.url}" target="_blank" title="Ouvrir dans un nouvel onglet" class="btn-link">
                <svg width="172" height="172" viewBox="0 0 172 172" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="-7.62939e-06" y="20" width="20" height="152" rx="6" fill="white"/>
                    <rect x="-7.62939e-06" y="172" width="20" height="152" rx="6" transform="matrix(0 -1 1 0 -172 172)" fill="white"/>
                    <rect x="132" y="96" width="20" height="76" rx="6" fill="white"/>
                    <rect x="-7.62939e-06" y="40" width="20" height="76" rx="6" transform="matrix(0 -1 1 0 -40 40)" fill="white"/>
                    <rect x="96" y="20" width="20" height="76" rx="6" transform="rotate(-90 96 20)" fill="white"/>
                    <path d="M152 6C152 2.68629 154.686 0 158 0L166 0C169.314 0 172 2.68629 172 6V70C172 73.3137 169.314 76 166 76H158C154.686 76 152 73.3137 152 70V6Z" fill="white"/>
                    <rect x="91.1421" y="94.7523" width="20" height="114" rx="6" transform="rotate(-135 91.1421 94.7523)" fill="white"/>
                </svg>
            </a>
            <a href="${video.url}" download target="_self" title="Ouvrir dans un nouvel onglet" class="btn-link">
                <svg width="109" height="166" viewBox="0 0 109 166" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="94.0104" y="56.5815" width="20" height="76" rx="6" transform="rotate(45 94.0104 56.5815)" fill="white"/>
                    <path d="M64.3119 106.079C66.6551 108.422 66.6551 112.221 64.3119 114.564L58.6551 120.221C56.3119 122.564 52.5129 122.564 50.1698 120.221L4.91496 74.9663C2.57181 72.6231 2.57181 68.8241 4.91496 66.481L10.5718 60.8241C12.915 58.481 16.7139 58.481 19.0571 60.8241L64.3119 106.079Z" fill="white"/>
                    <rect x="44.5876" y="0.288574" width="20" height="114" rx="6" fill="white"/>
                    <rect x="1" y="166" width="20" height="107" rx="6" transform="rotate(-90 1 166)" fill="white"/>
                </svg>
            </a>
        `;
        return videoContainer;
    }

    private showErrorMessage() {
        this.footerTag.innerHTML = "";
        const errorMessage = document.createElement("span");
        errorMessage.innerText = this.extState.error!;
        errorMessage.className = "error";
        errorMessage.addEventListener("click", async (e) => {
            await this.setState({ error: undefined });
            (e.target as HTMLElement).remove();
        });
        this.footerTag.append(errorMessage);
    }
}

new HomePopupUI();


