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

        this.#createAdminView.querySelector("#submitGreenInputForm").addEventListener("click", (event) => this.#handleAddGreen(event));
        this.#createAdminView.querySelector("#submitAddGreenTypeForm").addEventListener("click", (event) => this.#handleAddGreenType(event));
        this.#createAdminView.querySelector("#submitRemoveGreenTypeForm").addEventListener("click", (event) => this.#removeGreenType(event));

        this.#handleAreaRefresh();
        this.#handleTypeRefresh();
    }

    #removeGreenType(){
        event.preventDefault();
        const removeTypeList = this.#createAdminView.querySelector("#removeTypeList");
        const selectedRemoveType = removeTypeList.selectedIndex;

        this.#adminRepository.removeGreenType(selectedRemoveType);
    }

    #handleAddGreen() {
        event.preventDefault();
        const coordinaatX = this.#createAdminView.querySelector("#coordinateX").value;
        const coordinaatY = this.#createAdminView.querySelector("#coordinateY").value;
        const gebied = this.#createAdminView.querySelector("#greenAreaList");
        const selectedGebied = gebied.selectedIndex;
        const type_id = this.#createAdminView.querySelector("#typeList");
        const selectedType = type_id.selectedIndex;

        this.#adminRepository.addGreen(coordinaatX, coordinaatY, selectedGebied, selectedType);
    }

    #handleAddGreenType() {

        const type = this.#createAdminView.querySelector("#greenTypeName").value;

        console.log(type);

        this.#adminRepository.addGreenType(type);
    }

    async #handleAreaRefresh(){

        const areaList = this.#createAdminView.querySelector("#greenAreaList");
        const areaID = await this.#adminRepository.getArea();

        for(let i = 0; areaID.data.length > i; i++){
            areaList.innerHTML += `<option value="` + areaID.data[i].opmerking + `" data="`+ areaID.data[i].Gebiedsnummer +`">` + areaID.data[i].opmerking + `</option>`
        }
    }

    async #handleTypeRefresh(){
        const typeList = this.#createAdminView.querySelector("#typeList");
        const removeTypeList = this.#createAdminView.querySelector("#removeTypeList");
        const typeID = await this.#adminRepository.getType();

        for(let i = 0; typeID.data.length > i; i++){
            typeList.innerHTML += `<option value="` + typeID.data[i].naam + `" data="`+ typeID.data[i].id +`">` + typeID.data[i].naam + `</option>`
            removeTypeList.innerHTML += `<option value="` + typeID.data[i].naam + `" data="`+ typeID.data[i].id +`">` + typeID.data[i].naam + `</option>`
        }
    }
}