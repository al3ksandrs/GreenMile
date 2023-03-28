import {NetworkManager} from "../framework/utils/networkManager.js";

export class newsletterRepository {
    #networkManager;
    #submitNewsletterRoute;

    constructor() {
        this.#submitNewsletterRoute = "/mailinglist/submit/title/"

        this.#networkManager = new NetworkManager();
    }

    submitNewsLetter(title, content) {
        return this.#networkManager.doRequest(this.#submitNewsletterRoute + title + "/content/" + content, "GET")
    }

}