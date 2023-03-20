import {Controller} from "./controller.js";

export class DashboardController extends Controller {
    #createDashBoardView;

    DECIBEL_CIRCLE = 0;
    LKI_CIRCLE = 1;

    constructor() {
        super();
        this.#setupView();
    }


    async #setupView() {
        this.#createDashBoardView = await super.loadHtmlIntoContent("html_views/dashboard.html")
        this.animateCircle(50,this.DECIBEL_CIRCLE)
        this.animateCircle(10,this.LKI_CIRCLE)
    }


    animateCircle(value,circleSelector) {
        let offsetValue = Math.floor(((100 - value) * parseInt(window.getComputedStyle(document.querySelectorAll(".foreground-circle svg circle")[circleSelector]).getPropertyValue("stroke-dasharray").replace("px", "")
        )) / 100);

        // This is to animate the circle
        document.querySelectorAll(".foreground-circle svg circle")[circleSelector].animate([{strokeDashoffset: parseInt(window.getComputedStyle(document.querySelectorAll(".foreground-circle svg circle")[circleSelector]).getPropertyValue("stroke-dasharray").replace("px", "")),}, {strokeDashoffset: offsetValue,},], {duration: 750,});

        // Without this, circle gets filled 100% after the animation
        document.querySelectorAll(".foreground-circle svg circle")[circleSelector].style.strokeDashoffset = offsetValue;
    }

}