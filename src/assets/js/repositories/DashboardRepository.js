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

    #dashhboardSelectedTimespanTreegarden
    #dashbaordSelectedTimespanGreenery;

    #mapGreenRoute;
    #mapAreaRoute;

    #informationModalRoute

    constructor() {
        this.#lkiRoute = "/lki";
        this.#PM25ROute = "/fineDust";
        this.#PM25TodayRoute = "/PM25Today";
        this.#treeAmountMonthRoute = "/treeAmount/maand/"
        this.#gevelAmountMonthRoute = "/gevel/maand/"
        this.#groenAmountMonthRoute = "/groen/maand/"
        this.#dashboardDatabaseRoute = "/dashboard/database"
        this.#dashboardAPIRoute = "/dashboard/API/Luchtmeetnet";
        this.#dashhboardSelectedTimespanTreegarden = "/dashboard/timespan/"
        this.#dashbaordSelectedTimespanGreenery = "/dashboard/greenery/timespan/"

        this.#informationModalRoute = "/dashboard/information/"

        // map routes @author Aleksandrs
        this.#mapGreenRoute = "/map/getGroen";

        this.#networkManager = new NetworkManager();
    }

    getDashboardValues() {
        return this.#networkManager.doRequest(this.#dashboardDatabaseRoute, "GET")
    }

    // map requests @author Aleksandrs

    getGroen() {
        return this.#networkManager.doRequest(this.#mapGreenRoute, "GET")
    }

    getArea() {
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

    getModalInformation(id) {
        return this.#networkManager.doRequest(this.#informationModalRoute + id, "GET")
    }

    getSelectedTimespanTreeGardenData(timespan, type) {
        return this.#networkManager.doRequest(this.#dashhboardSelectedTimespanTreegarden + timespan + "/type/" + type, "GET")
    }

    getSelectedTimespanGreenery(timespan) {
        return this.#networkManager.doRequest(this.#dashbaordSelectedTimespanGreenery + timespan, "GET")
    }
}