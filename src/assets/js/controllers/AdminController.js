import {Controller} from "./controller.js";
import {AdminRepository} from "../repositories/adminRepository.js";
import {App} from "../app.js";

export class adminController extends Controller {
    #createAdminView;
    #adminRepository;

    constructor() {
        super();
        this.#adminRepository = new AdminRepository();
        this.#setupView();
    }

    async #setupView() {
        this.#createAdminView = await super.loadHtmlIntoContent("html_views/admin.html")

        this.#createAdminView.querySelector("#submitAddGreenTypeForm").addEventListener("click", (event) => this.#handleAddGreenType(event));

        this.#handleAreaRefresh(event);
    }

    #handleAddGreenType(event) {
        event.preventDefault();

        const type = this.#createAdminView.querySelector("#greenTypeName").value;

        console.log(type);

        this.#adminRepository.addGreenType(type);
    }

    #handleAreaRefresh(event){
        event.preventDefault();

        const areaList = this.#createAdminView.querySelector("#greenAreaList");
        const areaID = this.#adminRepository.getArea();

        console.log(areaID)
    }
}