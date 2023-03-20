import { NetworkManager } from "../framework/utils/networkManager.js";

export class AdminRepository {
    #networkmanager;
    #adminRoutes;

    constructor() {
        this.#networkmanager = new NetworkManager();
        this.#adminRoutes = "/admin";
    }

    async addGreenType(type){
        return await this.#networkmanager.doRequest(this.#adminRoutes, "POST", {
            "type": type});
    }

}