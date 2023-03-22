import {Controller} from "./controller.js";

export class adminController extends Controller {
    #createAdminView;

    constructor() {
        super();
        this.#setupView();
    }

    async #setupView() {
        this.#createAdminView = await super.loadHtmlIntoContent("html_views/admin.html")
    }
}

const count = document.getElementById()