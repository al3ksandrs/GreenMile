import {NetworkManager} from "../framework/utils/networkManager.js";

export class DashboardRepository {
    #networkManager;

    #dashboardDatabaseRoute;
    #dashboardAPIRoute;

    #dashhboardSelectedTimespanTreegarden
    #dashboardSelectedTimespanGreenery;
    #dashboardSelectedTimespanPM25;

    #informationModalRoute

    #mapGreenRoute;
    #mapAreaRoute;

    constructor() {
        this.#dashboardDatabaseRoute = "/dashboard/database"
        this.#dashboardAPIRoute = "/dashboard/API/Luchtmeetnet";
        this.#dashhboardSelectedTimespanTreegarden = "/dashboard/timespan/type"
        this.#dashboardSelectedTimespanGreenery = "/dashboard/greenery/timespan/"
        this.#dashboardSelectedTimespanPM25 = "/dashboard/database/PM25/timespan"

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
    async getSelectedPM25Data(timespan) {
        return await this.#networkManager.doRequest(this.#dashboardSelectedTimespanPM25, "POST", {
            "timespan": timespan
        });
    }

    async getSelectedTimespanTreeGardenData(timespan, type) {
        return await this.#networkManager.doRequest(this.#dashhboardSelectedTimespanTreegarden, "POST", {
            "timespan": timespan, "type_id": type
        })
    }

    async getSelectedTimespanGreenery(timespan) {
        return await this.#networkManager.doRequest(this.#dashboardSelectedTimespanGreenery, "POST", {
            "timespan": timespan
        })
    }

    // informations for the modal
    async getModalInformation(id) {
        return await this.#networkManager.doRequest(this.#informationModalRoute, "POST", {
            "id": id
        })
    }

    // map requests @author Aleksandrs
    getGroen() {
        return this.#networkManager.doRequest(this.#mapGreenRoute, "GET")
    }

    getArea() {
        return this.#networkManager.doRequest(this.#mapAreaRoute, "GET")
    }
}