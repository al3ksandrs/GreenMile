import { NetworkManager } from "../framework/utils/networkManager.js";

export class adminRepository {
    #networkmanager;
    #adminRoute;

    constructor() {
        this.#networkmanager = new NetworkManager();
        this.#adminRoute = "/admin";
    }

    async addGreenType(type){
        return await this.#networkmanager.doRequest(this.#adminRoute, "POST", {
            "type": type})
    }

}