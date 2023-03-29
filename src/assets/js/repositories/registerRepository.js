import { NetworkManager } from "../framework/utils/networkManager.js";

export class registerRepository {
    #networkmanager;
    #registerRoute;

    constructor() {
        this.#networkmanager = new NetworkManager();
        this.#registerRoute = "/register";
    }

    async addRegistration(type){
        return await this.#networkmanager.doRequest(this.#registerRoute, "POST", {
            "type": type});
    }

}