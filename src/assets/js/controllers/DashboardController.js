import {Controller} from "./controller.js";
import {DashboardRepository} from "../repositories/DashboardRepository.js";

export class DashboardController extends Controller {
    #dashboardView;
    #dashboardRepository;
    #GEVELTUINEN = 0;
    #BOOMTUINEN = 1
    #GROENEM2 = 2;
    #LKI = 3;
    #DECIBEL = 4;
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
        this.#gevelData();
        this.#loadTreeAmount();

        this.#dashboardView.querySelector("#gevelData").addEventListener("click",() => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");this.#gevelData()})
        this.#dashboardView.querySelector("#boomData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow"); this.#boomData()})
        this.#dashboardView.querySelector("#groenData").addEventListener("click",() => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");this.#groenData()})
        this.#dashboardView.querySelector("#lkiData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow"); this.#lkiData()})
        this.#dashboardView.querySelector("#decibalData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow"); this.#decibelData()})

        // These are just dummy values, get this data through routes later.
        this.#animateCircle(57,this.#GEVELTUINEN)
        this.#animateCircle(48,this.#BOOMTUINEN)
        this.#animateCircle(68,this.#GROENEM2)
        this.#animateCircle(50,this.#DECIBEL)
    }

    async #loadLKIvalues() {
        const valueBox = this.#dashboardView.querySelector("#LKIvalue");
        try {
            valueBox.innerHTML = "";
            const LKIvalue = await this.#dashboardRepository.getLKIvalues();
            valueBox.innerHTML = LKIvalue.LKI;
            let circleValue = 10*LKIvalue.LKI;
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
    #decibelData() {
        this.#dashboardView.querySelector("#decibalData").classList.add("shadow")
        this.#graphTextBox.innerText = "/ Decibel";
        this.#infoTextBox.innerText = "/ Decibel"
        this.#infoContentBox.innerHTML = `<div class="p fw-bold">Decibel uitleg</div>
        <div class="p">De Stadhouderskade in Amsterdam heeft een hoog geluidsniveau dat bewoners en bezoekers negatief kan beïnvloeden. Om de leefbaarheid te verbeteren, worden maatregelen genomen om het geluidsniveau te verminderen en daarmee het welzijn van de inwoners te verhogen en de kade aantrekkelijker te maken.</div>`;
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