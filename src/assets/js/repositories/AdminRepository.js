import {NetworkManager} from "../framework/utils/networkManager.js";

export class AdminRepository {
    #networkmanager;
    #adminRoutes;
    #areaListRoute;
    #typeListRoute;
    #addGreenRoute;
    #removeGreenTypeRoute;
    #removeGreenAreaRoute;
    #greenObjectRoute;
    #removeGreenObjectRoute;

    constructor() {
        this.#networkmanager = new NetworkManager();
        this.#adminRoutes = "/admin";
        this.#areaListRoute = "/areaList"
        this.#typeListRoute = "/typeList"
        this.#addGreenRoute = "/adminAddGreen"
        this.#removeGreenTypeRoute = "/removeGreenTypeRoute"
        this.#removeGreenAreaRoute = "/removeGreenAreaRoute"
        this.#removeGreenObjectRoute = "/removeGreenObjectRoute"
        this.#greenObjectRoute = "/greenObjectList"
    }

    async removeGreenType(type){
        return await this.#networkmanager.doRequest(this.#removeGreenTypeRoute, "POST", {
            "type": type
        });
    }

    async removeGreenArea(area){
        return await this.#networkmanager.doRequest(this.#removeGreenAreaRoute, "POST", {
            "area": area
        });
    }

    async removeGreenObject(greenObject){
        return await this.#networkmanager.doRequest(this.#removeGreenObjectRoute, "POST", {
            "greenObject": greenObject
        });
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

    async getGreenObject() {
        return await this.#networkmanager.doRequest(this.#greenObjectRoute, "GET");
    }

    async addGreenType(type) {
        return await this.#networkmanager.doRequest(this.#adminRoutes, "POST", {
            "type": type
        });
    }

}