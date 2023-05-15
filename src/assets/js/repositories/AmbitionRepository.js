import {NetworkManager} from "../framework/utils/networkManager.js";

export class AmbitionRepository{
    #networkManager;
    #ambitionDatabaseRoute;
    #newsletterRoute;
    #deleteItemById;

    constructor() {
        this.#ambitionDatabaseRoute = "/timeline"
        this.#newsletterRoute = "/newsletter"
        this.#deleteItemById = "/roadmap/delete/"

        this.#networkManager = new NetworkManager();
    }
    getTimelineValues (){
        return this.#networkManager.doRequest(this.#ambitionDatabaseRoute, "GET")
    }

    findNewsletters (){
        return this.#networkManager.doRequest(this.#newsletterRoute, "GET")
    }

    removeItemById(id) {
        return this.#networkManager.doRequest(this.#deleteItemById + id , "GET")
    }

    submitItem(title, content) {
        return this.@#networkManager.doRequest()
    }
}