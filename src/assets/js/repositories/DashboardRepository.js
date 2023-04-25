import {NetworkManager} from "../framework/utils/networkManager.js";

export class DashboardRepository {
    #networkManager;

    #lkiRoute;
    #treeAmountRoute;
    #PM25ROute;
    #PM25TodayRoute;
    #groenRoute;
    #gevelRoute;
    #treeAmountMonthRoute;
    #gevelAmountMonthRoute;
    #groenAmountMonthRoute;


    constructor() {
        this.#lkiRoute = "/lki";
        this.#treeAmountRoute = "/treeAmountRoute";
        this.#PM25ROute = "/fineDust";
        this.#PM25TodayRoute = "/PM25Today";
        this.#groenRoute = "/groen";
        this.#gevelRoute = "/gevel";
        this.#treeAmountMonthRoute = "/treeAmount/maand/"
        this.#gevelAmountMonthRoute = "/gevel/maand/"
        this.#groenAmountMonthRoute = "/groen/maand/"

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
        return this.#networkManager.doRequest(this.#PM25ROute, "GET");
    }

    getGroenvalues() {
        return this.#networkManager.doRequest(this.#groenRoute, "GET");
    }

    getGevelValues(){
        return this.#networkManager.doRequest(this.#gevelRoute, "GET");
    }

    getSelectedMonthTreeValues(monthId) {
        return this.#networkManager.doRequest(this.#treeAmountMonthRoute + monthId, "GET")
    }

    getPM25Today() {
        return this.#networkManager.doRequest(this.#PM25TodayRoute, "GET")
    }

    getSelectedMonthGevelValues(monthId) {
        return this.#networkManager.doRequest(this.#gevelAmountMonthRoute + monthId, "GET")
    }

    getSelectedMonthGroenValues(monthId) {
        return this.#networkManager.doRequest(this.#groenAmountMonthRoute + monthId, "GET")
    }
}