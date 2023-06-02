/**
 * @author Anwaris2
 * This is the register controller used for registering an account.
 */

import {Controller} from "./controller.js";
import {registerRepository} from "../repositories/registerRepository.js";
import {App} from "../app.js";

export class registerController extends Controller {
    #createRegisterView;
    #registerRepository

    constructor() {
        super();
        this.#registerRepository = new registerRepository();
        this.#setupView()
    }

    /**
     *
     * @return {Promise<void>}
     */
    async #setupView() {
        this.#createRegisterView = await super.loadHtmlIntoContent("html_views/register.html")
        this.#createRegisterView.querySelector(".submit-btn").addEventListener("click", (event) => this.#processRegister(event));
    }

    /**
     *
     * @param event
     * @return {Promise<void>}
     */
    async #processRegister(event) {
        event.preventDefault();
        const rank = this.#createRegisterView.querySelector("#rank").value;
        const email = this.#createRegisterView.querySelector("#emailRegister").value;
        const password = this.#createRegisterView.querySelector("#passwordRegister").value;
        const registerDate = this.#createRegisterView.querySelector("#registerDate").value;
        const errorBox = this.#createRegisterView.querySelector(".error");
        const passBox = this.#createRegisterView.querySelector(".pass");
        //Checks if email contains an @.
        const emailRegex =/\S+@\S+\.\S+/;

        let checkEmail = emailRegex.test(email);


        if (email.length === 0 || password.length === 0 || !checkEmail) {
            errorBox.innerHTML = "Velden mogen niet leeg zijn! of email is incorrect!"
            return;
        }

        try {
            const data = await this.#registerRepository.createAccount(rank, email, password, registerDate);
            console.log(data);
            passBox.innerHTML = "Account succesvol aangemaakt!"
        } catch (e) {

        }
    }
}