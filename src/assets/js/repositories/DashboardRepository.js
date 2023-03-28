import {NetworkManager} from "../framework/utils/networkManager.js";

export class DashboardRepository {
    #networkManager;

    #lkiRoute;
    #groenRoute

    constructor() {
        this.#lkiRoute = "/lki";
        this.#groenRoute = "/groen";
        
        this.#networkManager = new NetworkManager();
    }

    getLKIvalues() {
        return this.#networkManager.doRequest(this.#lkiRoute, "GET");
    }

    getGroenvalues() {
        return this.#networkManager.doRequest(this.#groenRoute, "GET");
    }
}