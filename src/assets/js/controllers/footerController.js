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
                this.#signup(emailField.value)
                emailField.value = "";
                errorText.classList.add("visually-hidden")
            } else {
                errorText.classList.remove("visually-hidden")
            }
        })
    }

    #signup(email) {
        this.#footerRepository.signUp(email)
    }

    #validateEmail(email) {
        let re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
}