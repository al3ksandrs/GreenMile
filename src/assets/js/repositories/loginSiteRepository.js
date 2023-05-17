    /**
    * Repository for logging in
    * @author Sakhi Anwari
    */
    import {NetworkManager} from "../framework/utils/networkManager.js";

    export class LoginSiteRepository {
        //# private atribute in javascript
        #networkManager
        #route
        #app


        constructor(app) {
            this.#app = app;
            this.#route = "/loginSite/createLogin";
            this.#networkManager = new NetworkManager();
        }


     async createLogin(email, password) {
         return await this.#networkManager.doRequest(this.#route, "POST", {email: email, password: password})
     }

}
