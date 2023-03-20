import {Controller} from "./controller.js";
import {AdminRepository} from "../repositories/AdminRepository.js";

export class DashboardController extends Controller {
    #createDashboardView;
    #adminRepository;
    DECIBEL_CIRCLE = 0;
    LKI_CIRCLE = 1;

    constructor() {
        super();
        this.#setupView();
    }


    async #setupView() {
        this.#createDashboardView = await super.loadHtmlIntoContent("html_views/dashboard.html")
        this.#adminRepository = new AdminRepository();

        this.#loadLKIvalues();

        this.#animateCircle(50,this.DECIBEL_CIRCLE) // rework this one into routes

    }

    async #loadLKIvalues() {
        const valueBox = this.#createDashboardView.querySelector("#LKIvalue");
        try {
            valueBox.innerHTML = "";
            const LKIvalue = await this.#adminRepository.getLKIvalues();
            valueBox.innerHTML = LKIvalue.LKI;
            let circleValue = 10*LKIvalue.LKI;
            this.#animateCircle(circleValue, this.LKI_CIRCLE)
        } catch (e) {
            console.log(e)
        }
    }


    /**
     * Method is used to select how far the diagram should be.
     * @param value - value of the diagram (0%-100%)
     * @param circleSelector - select which circle you want to animate. the selectors are defined in the top of the class
     */
    #animateCircle(value,circleSelector) {
        let offsetValue = Math.floor(((100 - value) * parseInt(window.getComputedStyle(document.querySelectorAll(".foreground-circle svg circle")[circleSelector]).getPropertyValue("stroke-dasharray").replace("px", "")
        )) / 100);

        // This is to animate the circle
        document.querySelectorAll(".foreground-circle svg circle")[circleSelector].animate([{strokeDashoffset: parseInt(window.getComputedStyle(document.querySelectorAll(".foreground-circle svg circle")[circleSelector]).getPropertyValue("stroke-dasharray").replace("px", "")),}, {strokeDashoffset: offsetValue,},], {duration: 750,});

        // Without this, circle gets filled 100% after the animation
        document.querySelectorAll(".foreground-circle svg circle")[circleSelector].style.strokeDashoffset = offsetValue;
    }

}