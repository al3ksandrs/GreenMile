import {NetworkManager} from "../framework/utils/networkManager.js";

export class AmbitionRepository{
    #networkManager;
    #ambitionDatabaseRoute;


    constructor() {
        this.#ambitionDatabaseRoute = "/timeline"
        this.#networkManager = new NetworkManager();
    }
    getTimelineValues (){
        return this.#networkManager.doRequest(this.#ambitionDatabaseRoute, "GET")
    }
}