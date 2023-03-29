/**
 * Controller class for the dashboard.
 * gets the data through the repository and api's and displays them on de dashboard page.
 * @authors
 *  -@beerstj
 */

import {Controller} from "./controller.js";
import {DashboardRepository} from "../repositories/DashboardRepository.js";

export class DashboardController extends Controller {
    #dashboardView;
    #dashboardRepository;
    #GEVELTUINEN = 0;
    #BOOMTUINEN = 1;
    #GROENEM2 = 2;
    #LKI = 3;
    #FINE_DUST = 4;
    #graphTextBox;
    #infoTextBox;
    #infoContentBox;

    constructor() {
        super();
        this.#setupView();
    }


    async #setupView() {
        this.#dashboardView = await super.loadHtmlIntoContent("html_views/dashboard.html")
        this.#dashboardRepository = new DashboardRepository();

        this.#graphTextBox = this.#dashboardView.querySelector(".graph-type-text");
        this.#infoTextBox = this.#dashboardView.querySelector(".info-type-text");
        this.#infoContentBox = this.#dashboardView.querySelector(".information-box-content")

        this.#loadLKIvalues();
        this.#loadGroenvalues();
        this.#loadTreeAmount();
        this.#loadFineDustValue();
        this.#loadGevelValues();

        this.#gevelData();

        // Adds the eventlisteners to switch betweens all of the types, adds shadows and changes the text boxes
        this.#dashboardView.querySelector("#gevelData").addEventListener("click",() => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");this.#gevelData()})
        this.#dashboardView.querySelector("#boomData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow"); this.#boomData()})
        this.#dashboardView.querySelector("#groenData").addEventListener("click",() => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");this.#groenData()})
        this.#dashboardView.querySelector("#lkiData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow"); this.#lkiData()})
        this.#dashboardView.querySelector("#tempData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow"); this.#tempData()})

        // These are just dummy values, get this data through routes later.
        this.#animateCircle(48,this.#BOOMTUINEN)
        this.#animateCircle(68,this.#GROENEM2)
    }

    // gets the LKi values through the repository. Display this data on the dashboard
    async #loadLKIvalues() {
        const valueBox = this.#dashboardView.querySelector("#LKIvalue");
        try {
            const LKIvalue = await this.#dashboardRepository.getLKIvalues();
            valueBox.innerHTML = LKIvalue.LKI;
            // * 10 because the progress bar goes from 0 - 100% and nog 0-10
            let circleValue = 10 * LKIvalue.LKI;
            this.#animateCircle(circleValue, this.#LKI)
        } catch (e) {
            console.log(e)
        }
    }

    // get amount of trees for the dashboard (@author Aleksandrs Soskolainens)
    async #loadTreeAmount(){

        const treeAmountView = this.#dashboardView.querySelector("#treeAmount");
        let treeAmount = 0;
        const getTreeAmount = await this.#dashboardRepository.getTreeAmount();

        //for each tree in database add one to the variable
        for(let i = 0; getTreeAmount.data.length > i; i++){
            treeAmount += 1;
        }

        //update circle diagram with new amount of trees
        this.#animateCircle(treeAmount, this.#BOOMTUINEN)

        //add amount of trees to HTML view
        treeAmountView.innerHTML = treeAmount;
    }


    async #loadFineDustValue(){
        const valueBox = this.#dashboardView.querySelector("#tempValue");
        try {
            valueBox.innerHTML = "";
            const fineDustData = await this.#dashboardRepository.getFineDustValue();
            valueBox.innerHTML = fineDustData.fineDust;
            let circleValue = 3*fineDustData.fineDust;
            this.#animateCircle(circleValue, this.#FINE_DUST)
        } catch (e) {
            console.log(e)
        }
    }


    async #loadGroenvalues() {
        const valueBox = this.#dashboardView.querySelector("#groenValue");
        try {
            valueBox.innerHTML = "";
            const groen = await this.#dashboardRepository.getGroenvalues();
            const groenValue = groen.data[0].GroenM2
            valueBox.innerHTML = groenValue;
        } catch (e) {
            console.log(e)
        }
    }

    async #loadGevelValues(){

        const valueBox = this.#dashboardView.querySelector("#gevelValue");
        let gevelValue = 0;
        const getGevelValues = await this.#dashboardRepository.getGevelValues();

        //for each tree in database add one to the variable
        for(let i = 0; getGevelValues.data.length > i; i++){
            gevelValue += 1;
        }

        let circleValue = (gevelValue / 130 )* 100;

        //update circle diagram with new amount of trees
        this.#animateCircle(circleValue, this.#GEVELTUINEN)

        //add amount of trees to HTML view
        valueBox.innerHTML = gevelValue;
    }

    #gevelData() {
        this.#dashboardView.querySelector("#gevelData").classList.add("shadow")
        this.#graphTextBox.innerText = "/ Geveltuinen";
        this.#infoTextBox.innerText = "/ Geveltuinen"
        this.#infoContentBox.innerHTML = `<div class="p fw-bold">Geveltuin uitleg</div>
        <div class="p">Geveltuinen aan de Stadhouderskade in Amsterdam zijn groene ruimten aan de voorgevels van gebouwen. Ze verbeteren de luchtkwaliteit, verminderen geluidsoverlast en bevorderen de biodiversiteit. Geveltuinen zijn een geweldige manier om de leefbaarheid van de stad te verbeteren door de gemeenschap te betrekken.</div>`;
    }
    #boomData() {
        this.#dashboardView.querySelector("#boomData").classList.add("shadow")
        this.#graphTextBox.innerText = "/ Boomtuinen";
        this.#infoTextBox.innerText = "/ Boomtuinen"
        this.#infoContentBox.innerHTML = `<div class="p fw-bold">Boom uitleg</div>
        <div class="p">Boomtuinen zijn groene ruimten rond bomen in steden. Ze verbeteren de luchtkwaliteit, verminderen hitte-eilanden en stimuleren de biodiversiteit. Boomtuinen brengen mensen samen en betrekken hen bij het verbeteren van hun omgeving. Ze zijn ook een belangrijk onderdeel van stadsvergroening en duurzaamheidsbeleid in steden als Amsterdam</div>`;
    }
    #groenData() {
        this.#dashboardView.querySelector("#groenData").classList.add("shadow")
        this.#graphTextBox.innerText = "/ Groene M²";
        this.#infoTextBox.innerText = "/ Groene M²"
        this.#infoContentBox.innerHTML = `<div class="p fw-bold">Groen uitleg</div>
        <div class="p">Een smalle strook groen langs wegen of gebouwen, groenstroken verbeteren de lucht- en geluidskwaliteit, bieden ontspanningsruimten en fungeren als buffers. Groenstroken zijn belangrijk voor stedenbouw en de vergroening van steden.</div>`;
    }
    #lkiData() {
        this.#dashboardView.querySelector("#lkiData").classList.add("shadow")
        this.#graphTextBox.innerText = "/ LKI";
        this.#infoTextBox.innerText = "/ LKI"
        this.#infoContentBox.innerHTML = `<div class="p fw-bold">LKI uitleg</div>
        <div class="p">LKI staat voor "Luchtkwaliteitsindex" en een lage LKI-waarde is goed omdat dit betekent datde luchtkwaliteit relatief goed is en een hoge waarde kan leiden tot gezondheidsproblemen. Het is belangrijkom de LKI-waarde in jouw regio te controleren en maatregelen te nemen om de blootstelling aan vervuilendestoffen te verminderen.</div>`;
    }
    #tempData() {
        this.#dashboardView.querySelector("#tempData").classList.add("shadow")
        this.#graphTextBox.innerText = "/ Temperatuur";
        this.#infoTextBox.innerText = "/ Temperatuur"
        this.#infoContentBox.innerHTML = `<div class="p fw-bold">Temperatuur uitleg</div>
        <div class="p">Hier is de actuele temperatuur van de Stadhouderskade te zien voor vandaag. Of u van plan bent om te gaan wandelen, te sporten of gewoon wil weten wat voor weer het is.</div>`;
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

        // Without this, circle gets filled 100% after the animation
        document.querySelectorAll(".progress-circle svg circle")[circleSelector].style.strokeDashoffset = offsetValue;
    }
}