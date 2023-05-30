import {NetworkManager} from "../framework/utils/networkManager.js";

export class AmbitionRepository{
    #networkManager;
    #ambitionDatabaseRoute;
    #newsletterRoute;
    #gardenRoute
    #m2Route
    #deleteItemById;
    #submitRoadmapRoute;
    #changeRoadmapRoute;

    constructor() {
        this.#ambitionDatabaseRoute = "/timeline"
        this.#newsletterRoute = "/timeline/newsletter"
        this.#gardenRoute = "/timeline/garden"
        this.#m2Route = "/timeline/m2"
        this.#deleteItemById = "/roadmap/delete/"
        this.#submitRoadmapRoute = "/roadmap/submit"
        this.#changeRoadmapRoute = "/roadmap/editById"

        this.#networkManager = new NetworkManager();
    }
    getTimelineValues (){
        return this.#networkManager.doRequest(this.#ambitionDatabaseRoute, "GET")
    }

    findNewsletters (){
        return this.#networkManager.doRequest(this.#newsletterRoute, "GET")
    }
    findGarden (){
        return this.#networkManager.doRequest(this.#gardenRoute, "GET")
    }
    findM2(){
        return this.#networkManager.doRequest(this.#m2Route, "GET")
    }

    async removeItemById(id) {
        return await this.#networkManager.doRequest(this.#deleteItemById, "POST", {
            "id": id
        })
    }

    async submitItem(title, content) {
        return await this.#networkManager.doRequest(this.#submitRoadmapRoute, "POST", {
            "title": title,
            "content": content
        })
    }

    async changeItem(id, title, content) {
        return await this.#networkManager.doRequest(this.#changeRoadmapRoute, "POST", {
            "id": id,
            "title": title,
            "content": content
        })
    }
}