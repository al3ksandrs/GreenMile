import {NetworkManager} from "../framework/utils/networkManager.js";

export class AmbitionRepository{
    #networkManager;
    #ambitionDatabaseRoute;
    #newsletterRoute;

    constructor() {
        this.#ambitionDatabaseRoute = "/timeline"
        this.#newsletterRoute = "/newsletter"
        this.#networkManager = new NetworkManager();
    }
    getTimelineValues (){
        return this.#networkManager.doRequest(this.#ambitionDatabaseRoute, "GET")
    }

    findNewsletters (){
        return this.#networkManager.doRequest(this.#newsletterRoute, "GET")
    }
}