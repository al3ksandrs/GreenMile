import {Controller} from "./controller.js";

export class registerController extends Controller {
    #createRegistratie;

    constructor() {
        super();
        this.#setupView()
    }

    async #setupView() {
        this.#createRegistratie = await super.loadHtmlIntoContent("html_views/register.html")
    }
}