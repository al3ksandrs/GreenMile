import {NetworkManager} from "../framework/utils/networkManager.js";

export class AdminRepository {
    #networkManager;
    #lkiRoute;

    constructor() {
        this.#lkiRoute = "/lki";
        this.#networkManager = new NetworkManager();
    }

    getLKIvalues() {
        return this.#networkManager.doRequest(this.#lkiRoute, "GET");
    }
}