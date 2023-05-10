    /**
    * Repository for logging in
    * @author Sakhi Anwari
    */
    import {NetworkManager} from "../framework/utils/networkManager.js";

    export class LoginSiteRepository {
        #networkManager;
        #route;

        constructor {
        this.#route = "/loginSite";
        this.#networkManager = new NetworkManager();
    }

    createLogin(username, password) {
            this.#networkManager.doRequest(this.#route, "POST", {usernam: username, password: password})
    }


}
