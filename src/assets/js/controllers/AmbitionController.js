import {Controller} from "./controller.js";

export class AmbitionController extends Controller {
    #createAmbitionView;

    constructor() {
        super();
        this.#setupView()
    }

    async #setupView() {
        this.#createAmbitionView = await super.loadHtmlIntoContent("html_views/ambition.html")
    }
}