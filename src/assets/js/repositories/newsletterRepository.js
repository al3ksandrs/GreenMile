import {NetworkManager} from "../framework/utils/networkManager.js";

export class newsletterRepository {
    #networkManager;
    #submitNewsletterRoute;
    #getUsersRoute
    #sendNewsletterRoute
    #getNewsletters

    constructor() {
        this.#submitNewsletterRoute = "/mailinglist/submit"
        this.#getUsersRoute = "/mailingList/emails/"
        this.#sendNewsletterRoute = "/mailingList/send"
        this.#getNewsletters = "/mailingList/getAll"

        this.#networkManager = new NetworkManager();
    }

    async submitNewsLetter(title, content) {
        return await this.#networkManager.doRequest(this.#submitNewsletterRoute, "POST", {
            "title": title,
            "content": content
        })
    }

    getEmails() {
        return this.#networkManager.doRequest(this.#getUsersRoute, "GET")
    }

    async sendNewsletter(email, title, content) {
        return await this.#networkManager.doRequest(this.#sendNewsletterRoute, "POST", {
            "email": email,
            "title": title,
            "content": content
        })
    }

    getNewsletters() {
        return this.#networkManager.doRequest(this.#getNewsletters, "GET")
    }
}