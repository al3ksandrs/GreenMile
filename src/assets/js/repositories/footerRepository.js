import {NetworkManager} from "../framework/utils/networkManager.js";

export class footerRepository {
    #networkManager;
    #signUpRoutes;

    constructor() {
        this.#signUpRoutes = "/mailingList/signup/";

        this.#networkManager = new NetworkManager();
    }

    signUp(email) {
        return this.#networkManager.doRequest(this.#signUpRoutes + email, "GET")
    }
}