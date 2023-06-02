import {Controller} from "./controller.js";

export class faqController extends Controller {
    #createFAQView;

    constructor() {
        super();
        this.#setupView()
    }

    async #setupView() {
        this.#createFAQView = await super.loadHtmlIntoContent("html_views/FAQ.html")
    }
}