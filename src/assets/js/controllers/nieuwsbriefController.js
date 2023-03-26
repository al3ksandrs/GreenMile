import {Controller} from "./controller.js";
import {nieuwsbriefRepository} from "../repositories/nieuwsbriefRepository.js";

export class nieuwsBriefController extends Controller {
    #nieuwsbriefRepository;

    constructor() {
        super();
        this.#nieuwsbriefRepository = new nieuwsbriefRepository();


    }

    #signUp() {

    }
}