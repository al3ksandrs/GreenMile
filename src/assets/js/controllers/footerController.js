/**
 * Controller for the footer, in the footer there is a section to put in your email to sign up
 * for the newsletter
 * @author beerstj
 */
import {Controller} from "./controller.js";
import {footerRepository} from "../repositories/footerRepository.js";

export class footerController extends Controller {
    #footerRepository;
    #footerView;

    constructor() {
        super();
        this.#footerRepository = new footerRepository();
        this.#setupView();
    }

    async #setupView() {
        this.#footerView = await super.loadHtmlIntoFooter("html_views/footer.html")
        let emailField = this.#footerView.querySelector("#signup-field");
        let errorText = this.#footerView.querySelector("#errorText");

        this.#footerView.querySelector("#signup-button").addEventListener("click", () => {
            if(this.#validateEmail(emailField.value)) {
                this.#footerRepository.signUp(emailField)
                emailField.value = "";
                // errorText.classList.add("visually-hidden")
            } else {
                errorText.classList.remove("visually-hidden")
            }
        })
    }w

    #validateEmail(email) {
        let regex = /\S+@\S+\.\S+/;
        return regex.test(email);
    }
}