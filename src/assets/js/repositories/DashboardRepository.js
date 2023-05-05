import {NetworkManager} from "../framework/utils/networkManager.js";

export class DashboardRepository {
    #networkManager;

    #lkiRoute;
    #PM25ROute;
    #PM25TodayRoute;
    #treeAmountMonthRoute;
    #gevelAmountMonthRoute;
    #groenAmountMonthRoute;
    #dashboardDatabaseRoute;
    #dashboardAPIRoute;

    #mapGroenIDRoute;
    #mapXcoordinateRoute;
    #mapYcoordinateRoute;
    #mapGreenTypeRoute;
    #mapAreaRoute;

    constructor() {
        this.#lkiRoute = "/lki";
        this.#PM25ROute = "/fineDust";
        this.#PM25TodayRoute = "/PM25Today";
        this.#treeAmountMonthRoute = "/treeAmount/maand/"
        this.#gevelAmountMonthRoute = "/gevel/maand/"
        this.#groenAmountMonthRoute = "/groen/maand/"
        this.#dashboardDatabaseRoute = "/dashboard/database"
        this.#dashboardAPIRoute = "/dashboard/API/Luchtmeetnet";

        // map routes @author Aleksandrs
        this.#mapGroenIDRoute = "/map/ID";
        this.#mapXcoordinateRoute = "/map/Xcoordinate/";
        this.#mapYcoordinateRoute = "/map/Ycoordinate/";
        this.#mapGreenTypeRoute = "/map/greenType";
        this.#mapAreaRoute = "/map/area";

        this.#networkManager = new NetworkManager();
    }

    getDashboardValues() {
        return this.#networkManager.doRequest(this.#dashboardDatabaseRoute, "GET")
    }

    // map requests @author Aleksandrs
    getGroenID() {
        return this.#networkManager.doRequest(this.#mapGroenIDRoute, "GET")
    }

    getXcoordinate(id) {
        return this.#networkManager.doRequest(this.#mapXcoordinateRoute + id, "GET")
    }

    getYcoordinate(id) {
        return this.#networkManager.doRequest(this.#mapYcoordinateRoute  + id, "GET")
    }

    getGreenType() {
        return this.#networkManager.doRequest(this.#mapGreenTypeRoute, "GET")
    }

    getMapArea() {
        return this.#networkManager.doRequest(this.#mapAreaRoute, "GET")
    }

    getDashboardAPIValues() {
        return this.#networkManager.doRequest(this.#dashboardAPIRoute, "GET")
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