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