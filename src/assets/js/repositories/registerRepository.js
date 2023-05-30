/**
 * repository for entity regiser also interacts with Networkmanager
 */
import {NetworkManager} from "../framework/utils/networkManager.js";

export class registerRepository {
    #networkManager;
    #route;

    constructor() {
        this.#route = "/register";
        this.#networkManager = new NetworkManager();
    }

    createAccount(rank, email, password, date) {
        return this.#networkManager.doRequest(this.#route,
            "POST", {rang: rank, email: email, password: password, registratieDatum: date})
    }
}