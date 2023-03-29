import {NetworkManager} from "../framework/utils/networkManager.js";

export class AdminRepository {
    #networkmanager;
    #adminRoutes;
    #areaListRoute;
    #typeListRoute;
    #addGreenRoute;
    #removeGreenTypeRoute;
    #addGreenGarden;
    #addGreenM2;
    constructor() {
        this.#networkmanager = new NetworkManager();
        this.#adminRoutes = "/admin";
        this.#addGreenGarden = "/greenGarden"
        this.#addGreenM2 = "/greenM2"
        this.#areaListRoute = "/areaList"
        this.#typeListRoute = "/typeList"
        this.#addGreenRoute = "/adminAddGreen"
        this.#removeGreenTypeRoute = "/removeGreenTypeRoute"
    }

    async addGreenType(type) {
        return await this.#networkmanager.doRequest(this.#adminRoutes, "POST", {
            "type": type
        });
    }
    async addGreenGarden(boomtuin) {
        return await this.#networkmanager.doRequest(this.#addGreenGarden, "POST", {
            "boomtuin": boomtuin
        });
    }

    // async addGreenM2(boomtuin) {
    //     return await this.#networkmanager.doRequest(this.#addGreenm2, "POST", {
    //         "gebied": groeneM2
    //     });
    // }
















    async removeGreenType(type){
        return await this.#networkmanager.doRequest(this.#removeGreenTypeRoute, "DELETE", {
            "type": type
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



}