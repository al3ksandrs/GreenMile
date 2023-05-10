/**
 * @author Anwaris2
 * This is the log in controller used for the site.
 */

import {UsersRepository} from "../repositories/usersRepository.js";
import {App} from "../app.js";
import {Controller} from "./controller.js";
// import {Login}

export class LoginsiteController extends Controller {
    #usersRepository;
    #loginsiteView;
    #loginSiteRepository;

    constructor() {
        super();

        this.#setupview();
        this.#loginSiteRepository= new LoginSiteController();
        this.#usersRepository = new UsersRepository();
    }


    async #setupview() {
        this.#loginsiteView = await super.loadHtmlIntoContent("html_views/loginsite.html");
        this.#loginsiteView.querySelector("#loginButton").addEventListener("click", (event) => this.#processLogin(event));
    }


    #processLogin(event) {
        event.preventDefault();

        const username = this.#loginsiteView.querySelector("#username").value;
        const password = this.#loginsiteView.querySelector("#password").value;

        const errorBox = this.#loginsiteView.querySelector(".error")
        if(username.length ===0 || password.length === 0 ) {
            errorBox.innerHTML = "Gebruikersnaam en wachtwoord moeten ingevuld zijn!";
        } else {
            errorBox.innerHTML = "" ;
        }

        console.log(username + " " + password)


    }
}
