/**
 * @author Anwaris2
 * This is the log in controller used for the site.
 */
import {Controller} from "./controller.js";
import {LoginSiteRepository} from "../repositories/loginSiteRepository.js";
import {App} from "../app.js";


// import {Login}

export class LoginsiteController extends Controller {
    #loginsiteView;
    #loginSiteRepository;

    constructor() {
        super();
        this.#loginSiteRepository = new LoginSiteRepository();
        this.#setupview();
    }


    async #setupview() {
        this.#loginsiteView = await super.loadHtmlIntoContent("html_views/loginsite.html");
        this.#loginsiteView.querySelector("#loginButton").addEventListener("click", (event) => this.#processLogin(event));
    }


    async #processLogin(event) {
        event.preventDefault();

        const email = this.#loginsiteView.querySelector("#username").value;
        const password = this.#loginsiteView.querySelector("#password").value;

        const errorBox = this.#loginsiteView.querySelector(".error")
        if (username.length === 0 || password.length === 0) {
            errorBox.innerHTML = "Gebruikersnaam en wachtwoord moeten ingevuld zijn!";
        } else {
            errorBox.innerHTML = "";
        }

        
        let response = await this.#loginSiteRepository.createLogin(email, password)
        console.log(response)



    }
}
