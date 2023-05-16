/**
 * Controller-class for the newsletter page
 * @author @beerstj
 */

import {Controller} from "./controller.js";
import {newsletterRepository} from "../repositories/newsletterRepository.js";

export class SubmitNewslettersController extends Controller {
    #sumbitNewsletterView;
    #newsletterRepository;
    constructor() {
        super();

        this.#setupView();

        this.#newsletterRepository = new newsletterRepository();
    }

    /**
     * Makes the view for the newsletter page.
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #setupView() {
        this.#sumbitNewsletterView = await super.loadHtmlIntoContent("html_views/submitNewsletter.html")

        this.#sumbitNewsletterView.querySelector("#newsletter-submit").addEventListener("click", () => {
            this.#submitNewsLetter()
        })
    }

    /**
     * Creates a new newsletter in the database and uses the #sendNewsletter method to send everyone an email
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #submitNewsLetter() {
        let title = this.#sumbitNewsletterView.querySelector("#newsletter-title")
        let contents = this.#sumbitNewsletterView.querySelector("#newsletter-content");
        let errorBox = this.#sumbitNewsletterView.querySelector("#newsletter-error");
        let succesBox = this.#sumbitNewsletterView.querySelector("#newsletter-succes");

        if(title.value.length < 10 || contents.value.length < 50) {
            errorBox.innerText = "Let op! \nDe titel van de nieuwsbrief is te kort! (Min 10 karakters)\nOf de inhoud is te kort (min 50 karakters)"
            errorBox.classList.remove("visually-hidden");
        } else {
            errorBox.classList.add("visually-hidden")
            succesBox.classList.remove("visually-hidden")
            this.#newsletterRepository.submitNewsLetter(title.value,contents.value)
            await this.#sendNewsLetter(title.value, contents.value)
        }
    }

    /**
     * Gets all of de users from the mailing_list table in DB, and send all of them an emaik
     * @param title - title of the newsletter
     * @param content - contents of the newsletter
     * @author beerstj
     */
    async #sendNewsLetter(title, content) {
        const emails = await this.#newsletterRepository.getEmails();
        for (let i = 0; i < emails.length; i++) {
            this.#newsletterRepository.sendNewsletter(emails[i].email,title,content)
        }
    }
}

