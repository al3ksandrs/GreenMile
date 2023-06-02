import {Controller} from "./controller.js";

export class PartnerController extends Controller {
    #createPartnersView;

    constructor() {
        super();
        this.#setupView()
    }

    async #setupView() {
        this.#createPartnersView = await super.loadHtmlIntoContent("html_views/partners.html")
    }
}