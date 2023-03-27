import {NetworkManager} from "../framework/utils/networkManager.js";

export class AdminRepository {
    #networkmanager;
    #adminRoutes;
    #areaListRoute;
    #typeListRoute;
    #addGreenRoute;

    constructor() {
        this.#networkmanager = new NetworkManager();
        this.#adminRoutes = "/admin";
        this.#areaListRoute = "/areaList"
        this.#typeListRoute = "/typeList"
        this.#addGreenRoute = "/adminAddGreen"
    }

    async addGreen(coordinaatX, coordinaatY, gebied_id, type_id) {
        return await this.#networkmanager.doRequest(this.#addGreenRoute, "POST", {
            "coordinaatX": coordinaatX, "coordinaatY": coordinaatY, "gebied_id" : gebied_id, "type_id" : type_id
        });
    }

    async getArea() {
        return await this.#networkmanager.doRequest(this.#areaListRoute, "GET");
    }

    async getType() {
        return await this.#networkmanager.doRequest(this.#typeListRoute, "GET");
    }

    async addGreenType(type) {
        return await this.#networkmanager.doRequest(this.#adminRoutes, "POST", {
            "type": type
        });
    }

}