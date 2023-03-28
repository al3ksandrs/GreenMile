import {NetworkManager} from "../framework/utils/networkManager.js";

export class DashboardRepository {
    #networkManager;
    #lkiRoute;
    #treeAmountRoute;

    constructor() {
        this.#lkiRoute = "/lki";
        this.#treeAmountRoute = "/treeAmountRoute";
        this.#networkManager = new NetworkManager();
    }

    getLKIvalues() {
        return this.#networkManager.doRequest(this.#lkiRoute, "GET");
    }

    // get amount of trees for the dashboard (@author Aleksandrs Soskolainens)
    getTreeAmount(){
        return this.#networkManager.doRequest(this.#treeAmountRoute, "GET");
    }
}