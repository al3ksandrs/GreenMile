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

        const ctx = document.getElementById('myChart');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });


        var map = L.map('map').setView([52.360938, 4.890879], 16);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        var popup = L.popup();

        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(map);
        }

        map.on('click', onMapClick);

        var polygon = L.polygon([
            [52.364006, 4.8788],
            [52.363449, 4.879546],
            [52.362847, 4.880356],
            [52.362162, 4.881096],
            [52.361918, 4.881624],
            [52.361731, 4.882268],
            [52.361697, 4.883526],
            [52.361587, 4.884014],
            [52.360208, 4.886874],
            [52.360092, 4.886997],
            [52.359841, 4.887458],
            [52.359623, 4.887737],
            [52.358976, 4.888421],
            [52.358766, 4.88873],
            [52.358562, 4.889102],
            [52.358409, 4.889448],
            [52.358195, 4.890277],
            [52.358154, 4.890765],
            [52.358046, 4.891423],
            [52.357644, 4.898061],
            [52.357654, 4.898375],
            [52.35872, 4.903519],
            [52.358768, 4.904013],
            [52.358702, 4.904042],
            [52.358663, 4.903541],
            [52.3576, 4.898402],
            [52.357592, 4.89815],
            [52.357877, 4.892841],
            [52.357987, 4.891393],
            [52.358005, 4.89083],
            [52.358134, 4.890256],
            [52.35835, 4.889416],
            [52.358771, 4.88859],
            [52.359078, 4.888215],
            [52.359774, 4.887442],
            [52.360064, 4.886906],
            [52.360111, 4.886731],
            [52.360666, 4.885669],
            [52.36149, 4.883961],
            [52.361607, 4.883518],
            [52.361638, 4.882172],
            [52.361733, 4.881673],
            [52.362011, 4.881061],
            [52.362352, 4.880616],
            [52.362848, 4.880002],
            [52.363574, 4.878918],
            [52.363769, 4.87869],
            [52.363972, 4.878612]
        ], {
            color: 'green'
        }).addTo(map);
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
            this.#animateValue(valueBox,0,LKIvalue.LKI,500)
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
        this.#animateValue(treeAmountView,0,treeAmount,500)
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
            this.#animateValue(valueBox, 0, fineDustData.fineDust,500)
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
            this.#animateCircle(groenValue, this.#GROENEM2)
            this.#animateValue(valueBox,0,groenValue,500)
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
        this.#animateValue(valueBox,0,gevelValue,500)

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
        this.#graphTextBox.innerText = "/ Fijnstof";
        this.#infoTextBox.innerText = "/ Fijnstof"
        this.#infoContentBox.innerHTML = `<div class="p fw-bold">Fijnstof uitleg</div>
        <div class="p">>Hier is de actuele informatie van de hoeveelheid fijnstof in Stadhouderskade te zien voor vandaag. Of u van plan bent om te gaan wandelen, te sporten of gewoon wil weten wat voor hoeveelheid het is.</div>`;
    }

    #animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
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