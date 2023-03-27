import {Controller} from "./controller.js";
import {newsletterRepository} from "../repositories/newsletterRepository.js";

export class NewsletterController extends Controller {
    #newsletterView;
    #newsletterRepository;
    constructor() {
        super();

        this.#setupView();

        this.#newsletterRepository = new newsletterRepository();
    }

    async #setupView() {
        this.#newsletterView = await super.loadHtmlIntoContent("html_views/newsletter.html")


        this.#newsletterView.querySelector("#newsletter-submit").addEventListener("click", () => {
            this.#submitNewsLetter()
        })
    }

    async #submitNewsLetter() {
        let title = this.#newsletterView.querySelector("#newsletter-title")
        let contents = this.#newsletterView.querySelector("#newsletter-content");
        let errorBox = this.#newsletterView.querySelector("#newsletter-error");
        let succesBox = this.#newsletterView.querySelector("#newsletter-succes");

        if(title.value.length < 10 || contents.value.length < 50) {
            errorBox.innerText = "Let op! \nDe titel van de nieuwsbrief is te kort! (Min 10 karakters)\nOf de inhoud is te kort (min 50 karakters)"
            errorBox.classList.remove("visually-hidden");
        } else {
            errorBox.classList.add("visually-hidden")
            succesBox.classList.remove("visually-hidden")
            this.#newsletterRepository.submitNewsLetter(title.value,contents.value)
        }
    }
}

