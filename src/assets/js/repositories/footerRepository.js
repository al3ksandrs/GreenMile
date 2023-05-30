import {NetworkManager} from "../framework/utils/networkManager.js";

export class footerRepository {
    #networkManager;
    #signUpRoutes;

    constructor() {
        this.#signUpRoutes = "/mailingList/signup/";

        this.#networkManager = new NetworkManager();
    }

    async signUp(email) {
        return await this.#networkManager.doRequest(this.#signUpRoutes, "POST", {
            "email": email
        })
    }
}