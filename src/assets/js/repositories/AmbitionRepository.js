import {NetworkManager} from "../framework/utils/networkManager.js";

export class AmbitionRepository{
    #networkManager;
    #ambitionDatabaseRoute;
    #newsletterRoute;
    #deleteItemById;
    #submitRoadmapRoute;
    #changeRoadmapRoute;

    constructor() {
        this.#ambitionDatabaseRoute = "/timeline"
        this.#newsletterRoute = "/newsletter"
        this.#deleteItemById = "/roadmap/delete/"
        this.#submitRoadmapRoute = "/roadmap/submit/title/"
        this.#changeRoadmapRoute = "/roadmap/id/"

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
        return this.#networkManager.doRequest(this.#submitRoadmapRoute + title + "/content/" + content, "GET")
    }

    changeItem(id, title, content) {
        return this.#networkManager.doRequest(this.#changeRoadmapRoute + id + "/title/" + title + "/content/" + content, "GET")
    }
}