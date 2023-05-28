import {NetworkManager} from "../framework/utils/networkManager.js";

export class DashboardRepository {
    #networkManager;

    #dashboardDatabaseRoute;
    #dashboardAPIRoute;

    #dashhboardSelectedTimespanTreegarden
    #dashbaordSelectedTimespanGreenery;
    #dashboardSelectedTimespanPM25;

    #informationModalRoute

    #mapGreenRoute;
    #mapAreaRoute;

    constructor() {
        this.#dashboardDatabaseRoute = "/dashboard/database"
        this.#dashboardAPIRoute = "/dashboard/API/Luchtmeetnet";
        this.#dashhboardSelectedTimespanTreegarden = "/dashboard/timespan/"
        this.#dashbaordSelectedTimespanGreenery = "/dashboard/greenery/timespan/"
        this.#dashboardSelectedTimespanPM25 = "/dashboard/database/PM25/timespan/"

        this.#informationModalRoute = "/dashboard/information/"

        // map routes @author Aleksandrs
        this.#mapGreenRoute = "/map/getGroen";

        this.#networkManager = new NetworkManager();
    }

    // Values for the dashboard
    getDashboardValues() {
        return this.#networkManager.doRequest(this.#dashboardDatabaseRoute, "GET")
    }

    getDashboardAPIValues() {
        return this.#networkManager.doRequest(this.#dashboardAPIRoute, "GET")
    }

    // Values for the charts
    getSelectedPM25Data(timespan) {
        return this.#networkManager.doRequest(this.#dashboardSelectedTimespanPM25 + timespan, "GET")
    }

    getSelectedTimespanTreeGardenData(timespan, type) {
        return this.#networkManager.doRequest(this.#dashhboardSelectedTimespanTreegarden + timespan + "/type/" + type, "GET")
    }

    getSelectedTimespanGreenery(timespan) {
        return this.#networkManager.doRequest(this.#dashbaordSelectedTimespanGreenery + timespan, "GET")
    }

    // informations for the modal
    getModalInformation(id) {
        return this.#networkManager.doRequest(this.#informationModalRoute + id, "GET")
    }

    // map requests @author Aleksandrs
    getGroen() {
        return this.#networkManager.doRequest(this.#mapGreenRoute, "GET")
    }

    getArea() {
        return this.#networkManager.doRequest(this.#mapAreaRoute, "GET")
    }
}