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

    async #setupView() {
        this.#createRegisterView = await super.loadHtmlIntoContent("html_views/register.html")
        this.#createRegisterView.querySelector(".submit-btn").addEventListener("click", (event) => this.#processRegister(event));
    }

    async #processRegister(event) {
        event.preventDefault();
        const rank = this.#createRegisterView.querySelector("#rank").value;
        const email = this.#createRegisterView.querySelector("#emailRegister").value;
        const password = this.#createRegisterView.querySelector("#passwordRegister").value;
        const registerDate = this.#createRegisterView.querySelector("#registerDate").value;
        const errorBox = this.#createRegisterView.querySelector(".error");

        if (email.length === 0 || password.length === 0) {
            errorBox.innerHTML = "Velden mogen niet leeg zijn!"
            return;
        }

        try {
            const data = await this.#registerRepository.createAccount(rank, email, password, registerDate);
            console.log(data);
        } catch (e) {

        }
    }
}