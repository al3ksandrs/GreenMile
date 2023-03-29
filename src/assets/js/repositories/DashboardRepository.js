import {NetworkManager} from "../framework/utils/networkManager.js";

export class DashboardRepository {
    #networkManager;

    #lkiRoute;
    #treeAmountRoute;
    #tempRoute;
    #groenRoute;
    #gevelRoute;

    constructor() {
        this.#lkiRoute = "/lki";
        this.#treeAmountRoute = "/treeAmountRoute";
        this.#tempRoute = "/fineDust";
        this.#groenRoute = "/groen";
        this.#gevelRoute = "/gevel";

        this.#networkManager = new NetworkManager();
    }

    getLKIvalues() {
        return this.#networkManager.doRequest(this.#lkiRoute, "GET");
    }

    // get amount of trees for the dashboard (@author Aleksandrs Soskolainens)
    getTreeAmount(){
        return this.#networkManager.doRequest(this.#treeAmountRoute, "GET");
    }

    getFineDustValue(){
        return this.#networkManager.doRequest(this.#tempRoute, "GET");
    }

    getGroenvalues() {
        return this.#networkManager.doRequest(this.#groenRoute, "GET");
    }

    getGevelValues(){
        return this.#networkManager.doRequest(this.#gevelRoute, "GET");
    }
}