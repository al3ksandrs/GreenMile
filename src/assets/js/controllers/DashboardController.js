import {Controller} from "./controller.js";
import {AdminRepository} from "../repositories/AdminRepository.js";

export class DashboardController extends Controller {
    #createDashboardView;
    #adminRepository;

    #GEVELTUINEN_CIRCLE = 0;
    #BOOMTUINEN_CIRCLE = 1
    #GROENEM2_CIRCLE = 2;
    #LKI_CIRCLE = 3;
    #DECIBEL_CIRCLE = 4;


    constructor() {
        super();
        this.#setupView();
    }


    async #setupView() {
        this.#createDashboardView = await super.loadHtmlIntoContent("html_views/dashboard.html")
        this.#adminRepository = new AdminRepository();

        this.#loadLKIvalues();

        // These are just dummy values, get this data through routes later.
        this.#animateCircle(92,this.#GEVELTUINEN_CIRCLE)
        this.#animateCircle(48,this.#BOOMTUINEN_CIRCLE)
        this.#animateCircle(68,this.#GROENEM2_CIRCLE)
        this.#animateCircle(50,this.#DECIBEL_CIRCLE) // rework this one into routes

    }

    async #loadLKIvalues() {
        const valueBox = this.#createDashboardView.querySelector("#LKIvalue");
        try {
            valueBox.innerHTML = "";
            const LKIvalue = await this.#adminRepository.getLKIvalues();
            valueBox.innerHTML = LKIvalue.LKI;
            let circleValue = 10*LKIvalue.LKI;
            this.#animateCircle(circleValue, this.#LKI_CIRCLE)
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
        let offsetValue = Math.floor(((100 - value) * parseInt(window.getComputedStyle(document.querySelectorAll(".progress-circle svg circle")[circleSelector]).getPropertyValue("stroke-dasharray").replace("px", "")
        )) / 100);

        // This is to animate the circle
        document.querySelectorAll(".progress-circle svg circle")[circleSelector].animate([{strokeDashoffset: parseInt(window.getComputedStyle(document.querySelectorAll(".progress-circle svg circle")[circleSelector]).getPropertyValue("stroke-dasharray").replace("px", "")),}, {strokeDashoffset: offsetValue,},], {duration: 500,});

        console.log(offsetValue + " " + circleSelector)

        // Without this, circle gets filled 100% after the animation
        document.querySelectorAll(".progress-circle svg circle")[circleSelector].style.strokeDashoffset = offsetValue;
    }

}