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
    #dashboardSelectedTimespanPM25;

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
        this.#dashboardSelectedTimespanPM25 = "/dashbaord/api/luchtmeetnet/PM25/timespan/"

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

    getSelectedPM25Data(timespan) {
        return this.#networkManager.doRequest(this.#dashboardSelectedTimespanPM25 + timespan, "GET")
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