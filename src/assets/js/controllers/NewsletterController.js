import {Controller} from "./controller.js";
import {newsletterRepository} from "../repositories/newsletterRepository.js";

export class NewsletterController extends Controller{
    #newsletterView;
    #newsletterRepository

    constructor() {
        super();

        this.#newsletterRepository = new newsletterRepository();

        this.#setupView()

    }

    async #setupView() {
        this.#newsletterView = await super.loadHtmlIntoContent("html_views/newsletters.html")
        this.#displayNewsletters()
    }

    async #displayNewsletters() {
        let newslettersContainer = this.#newsletterView.querySelector(".newsletters-letters-container")
        const newsletters = await this.#newsletterRepository.getNewsletters();
        for (let i = 0; i < newsletters.length; i++) {
            newslettersContainer.innerHTML += `
            <div class="card col-3 my-2 shadow mx-1" style="border-radius: 13px; height: fit-content">
            <div class="card-body">
                <h5 class="card-title">`+ newsletters[i].title +`</h5>
                <h6 class="card-subtitle mb-2 text-muted border-bottom">Invoerdatum:`+newsletters[i].date.substring(0,10)+`</h6>
                <p class="card-text">
                    `+newsletters[i].content.substring(0,950)+`
                </p>
            </div>
        </div>`
        }
    }
}