import {NetworkManager} from "../framework/utils/networkManager.js";

export class newsletterRepository {
    #networkManager;
    #submitNewsletterRoute;
    #getUsersRoute
    #sendNewsletterRoute

    constructor() {
        this.#submitNewsletterRoute = "/mailinglist/submit/title/"
        this.#getUsersRoute = "/mailingList/emails/"
        this.#sendNewsletterRoute = "/mailingList/send/email/"

        this.#networkManager = new NetworkManager();
    }

    submitNewsLetter(title, content) {
        return this.#networkManager.doRequest(this.#submitNewsletterRoute + title + "/content/" + content, "GET")
    }

    getEmails() {
        return this.#networkManager.doRequest(this.#getUsersRoute, "GET")
    }

    sendNewsletter(email, title, content) {
        return this.#networkManager.doRequest(this.#sendNewsletterRoute + email + "/title/" + title + "/content/" + content, "POST")
    }
}