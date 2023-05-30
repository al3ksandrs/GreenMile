/**
 *  Controller responsible for all events in login view
 *  @author Pim Meijer & Sakhi Anwari
 */

import {App} from "../app.js";
import {LoginSiteRepository} from "../repositories/loginSiteRepository.js";
import {Controller} from "./controller.js";


export class LoginsiteController extends Controller{
    //# is a private field in Javascript
    #loginSiteRepository
    #loginsiteView
    #app
    #setupview

    constructor() {
        super();
        this.#loginSiteRepository = new LoginSiteRepository();
        this.#setupView();
    }

    /**
     * Loads contents of desired HTML file into the index.html .content div
     * @returns {Promise<void>}
     */
    async #setupView() {
        //await for when HTML is loaded, never skip this method call in a controller
        this.#loginsiteView = await super.loadHtmlIntoContent("html_views/loginsite.html")

        //from here we can safely get elements from the view via the right getter
        this.#loginsiteView.querySelector(".submit-btn").addEventListener("click", (event) => this.#processLogin(event));

    }
    /**
     * Async function that does a login request via repository
     */
    async #processLogin(event) {
        event.preventDefault()
        //get the input field elements from the view and retrieve the value
        const email = this.#loginsiteView.querySelector("#email").value;
        const password = this.#loginsiteView.querySelector("#password").value;

        try{
            const user = await this.#loginSiteRepository.createLogin(email, password);

            //let the session manager know we are logged in by setting the email, never set the password in localstorage
            App.sessionManager.set("username", email);
            App.loadController(App.CONTROLLER_DASHBOARD);

            console.log("User: " + email + " logged in")
        } catch(error) {
            //if unauthorized error code, show error message to the user
            if(error.code === 401) {
                this.#loginsiteView.querySelector(".error").innerHTML = error.reason
            } else {
                console.error(error);
            }
        }
    }
}