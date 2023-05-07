/**
 * Controller class for the dashboard.
 * gets the data through the repository and api's and displays them on de dashboard page.
 * @authors
 *  -@beerstj
 */


//['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December']

import {Controller} from "./controller.js";
import {DashboardRepository} from "../repositories/DashboardRepository.js";

export class DashboardController extends Controller {
    #dashboardView;
    #dashboardRepository;
    #FACADEGARDENINDEX = 0;
    #TREEGARDENINDEX = 1;
    #GREENERYINDEX = 2;
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

        this.#loadDashboardValues()
        this.#gevelData();
        this.#map();

        this.#gevelTuinGrafiek()
        // Adds the eventlisteners to switch betweens all of the types, adds shadows and changes the text boxes
        this.#dashboardView.querySelector("#gevelData").addEventListener("click",() => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#gevelData()
            this.#gevelTuinGrafiek()
        })
        this.#dashboardView.querySelector("#boomData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#boomData();
            this.#boomtuinGrafiekData();
        })
        this.#dashboardView.querySelector("#groenData").addEventListener("click",() => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#groenData();
            this.#groenGraphData();
        })
        this.#dashboardView.querySelector("#lkiData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#lkiData()
        })

        this.#dashboardView.querySelector("#tempData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#tempData()
            this.#PM25TodayGraph()
        })
    }

    async #loadDashboardValues() {
        const databaseValues = await this.#dashboardRepository.getDashboardValues();
        const apiValues = await this.#dashboardRepository.getDashboardAPIValues();

        this.#animateCircleAndValues(this.#TREEGARDENINDEX, databaseValues.data[0].treeGarden)
        this.#animateCircleAndValues(this.#FACADEGARDENINDEX, databaseValues.data[0].facadeGarden)
        this.#animateCircleAndValues(this.#GREENERYINDEX, databaseValues.data[0].greenery)
        this.#animateCircleAndValues(this.#LKI, apiValues.AQI)
        this.#animateCircleAndValues(this.#FINE_DUST, apiValues.PM25)
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

    async #boomtuinGrafiekData() {
        this.#clearCanvas();

        const targetBox = this.#dashboardView.querySelector("#myChart")
        let month;
        let amounts = []
        let total = 0;

        for (let i = 1; i < new Date(Date.now()).getMonth() + 2; i++) {
            month = await this.#dashboardRepository.getSelectedMonthTreeValues(i)
            total += month.data[0].TreeAmount;
            amounts.push(month.data[0].TreeAmount)
        }

        new Chart(targetBox, {
            type: 'line',
            data: {
                labels: this.#getMonthsArray(4),
                datasets: [{
                    label: 'Boomtuinen in deze maand',
                    data: amounts,
                },]
            },
            options: {
                scales: {y: {beginAtZero: true}},
                borderColor: '#058C42'
            }
        });
    }

    async #groenGraphData() {
        this.#clearCanvas();

        const targetBox = this.#dashboardView.querySelector("#myChart")
        let month;
        let amounts = []
        let total = 0;

        for (let i = 1; i < new Date(Date.now()).getMonth() + 2; i++) {
            month = await this.#dashboardRepository.getSelectedMonthGroenValues(i)
            total += month.data[0].GroeneM2;
            amounts.push(month.data[0].GroeneM2)
        }

        new Chart(targetBox, {
            type: 'line',
            data: {
                labels: this.#getMonthsArray(4),
                datasets: [{
                    label: 'Boomtuinen in deze maand',
                    data: amounts,
                },]
            },
            options: {
                scales: {y: {beginAtZero: true}},
                borderColor: '#058C42'
            }
        });
    }

    async #gevelTuinGrafiek() {
        this.#clearCanvas();

        const targetBox = this.#dashboardView.querySelector("#myChart")
        let month;
        let amounts = []
        let total = 0;

        for (let i = 1; i < new Date(Date.now()).getMonth() + 2; i++) {
            month = await this.#dashboardRepository.getSelectedMonthGevelValues(i)
            total += month.data[0].GevelAmount;
            amounts.push(month.data[0].GevelAmount)
        }

        new Chart(targetBox, {
            type: 'line',
            data: {
                labels: this.#getMonthsArray(4),
                datasets: [{
                    label: 'Boomtuinen in deze maand',
                    data: amounts,
                },]
            },
            options: {
                scales: {y: {beginAtZero: true}},
                borderColor: '#058C42'
            }
        });
    }

    async #PM25TodayGraph() {
        this.#clearCanvas();
        let values = await this.#dashboardRepository.getPM25Today();
        let array = []
        const targetBox = this.#dashboardView.querySelector("#myChart")

        for (let i = 0; i <24; i++) {
            array.push(values.data[i].value)
        }

        new Chart(targetBox, {
            type: 'line',
            data: {
                labels: this.#getPast24Hours(),
                datasets: [{
                    label: 'Fijnstof waarde aan het begin van elk uur',
                    data: array,
                },]
            },
            options: {
                scales: {y: {beginAtZero: true}},
                borderColor: '#058C42'
            }
        });
    }

    /**
     * Gets the past 24 hours in a array (For example, if its 16:00, you will get:
     * ['15:00 ', '14:00 ', '13:00 ', '12:00 ', '11:00 ', '10:00 ', '9:00 ', '8:00 ', '7:00 ', '6:00 ', '5:00 ', '4:00 ', '3:00 ', '2:00 ', '1:00 ', '24:00 ', '23:00 ', '22:00 ', '21:00 ', '20:00 ', '19:00 ', '18:00 ', '17:00 ', '16:00 ']
     * Used for the labels in today charts.
     * @returns array of past 24 hours.
     */
    #getPast24Hours() {
        let curHour = new Date(Date.now()).toISOString().substring(11,13);
        let hoursArray = [];

        curHour++;
        curHour++;
        curHour++;

        for (let i = 0; i < 24; i++) {
            curHour = curHour - 1;

            if(curHour === 0) {
                curHour = 24;
            }
            let inArray = curHour + ":00 "
            hoursArray.push(inArray)
        }
        return hoursArray;
    }

    /**
     * Gets the amount of selected
     * @param amount
     * @returns {*[]}
     */
    #getMonthsArray(amount) {
        const months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
        let values = [];

        for (let i = 0; i < amount; i++) {
            values.push(months[i])
        }

        return values;
    }

    /**
     * Clears the canvas thats filled with the chart.
     * used for the charts
     */
    #clearCanvas() {
        this.#dashboardView.querySelector("#chartbox").innerHTML = ""
        this.#dashboardView.querySelector("#chartbox").innerHTML = "<canvas id=\"myChart\"></canvas>"
    }

    /**
     * Animates both the circle and the number value in one function.
     * @param target - the html element you want to animate
     * @param value - the value to what number the animation should go.
     */
    #animateCircleAndValues(target, value) {
        this.#animateValues(target,value)
        this.#animateCircle(value, target)
    }

    /**
     * Animates the values, that counts up.
     * @param value_selector - which html element you want to animate
     * @param end - value at which you want the animation to stop.
     */
    #animateValues(value_selector, end) {
        let startTimestamp = null;
        let start = 0;
        let duration = 500;
        const valueTargetList= this.#dashboardView.getElementsByClassName("green-value");
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            valueTargetList[value_selector].innerHTML = Math.floor(progress * (end - start) + start);
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
        let offsetValue = Math.floor(((100 - value) * parseInt(window.getComputedStyle(document.querySelectorAll(".progress-circle svg circle")[circleSelector]).getPropertyValue("stroke-dasharray").replace("px", ""))) / 100);

        // This is to animate the circle
        document.querySelectorAll(".progress-circle svg circle")[circleSelector].animate([{strokeDashoffset: parseInt(window.getComputedStyle(document.querySelectorAll(".progress-circle svg circle")[circleSelector]).getPropertyValue("stroke-dasharray").replace("px", "")),}, {strokeDashoffset: offsetValue,},], {duration: 500,});

        // Without this, circle gets filled 100% after the animation
        document.querySelectorAll(".progress-circle svg circle")[circleSelector].style.strokeDashoffset = offsetValue;
    }


    ///////////////////////////////////////// MAP ////////////////////////////////////////////


    async #map() {

        // map setup @author Aleksandrs
        var map = L.map('map').setView([52.360938, 4.890879], 16);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // get coordinates when clicking on map
        var popup = L.popup();
        function onMapClick(e) {
            popup
                .setLatLng(e.latlng)
                .setContent("You clicked the map at " + e.latlng.toString())
                .openOn(map);

        }

        map.on('click', onMapClick);

        // Stadhouderskade area on map @author Aleksandrs
        var polygon = L.polygon([
            [52.364006, 4.8788], [52.363449, 4.879546], [52.362847, 4.880356], [52.362162, 4.881096], [52.361918, 4.881624], [52.361731, 4.882268], [52.361697, 4.883526],
            [52.361587, 4.884014], [52.360208, 4.886874], [52.360092, 4.886997], [52.359841, 4.887458], [52.359623, 4.887737], [52.358976, 4.888421], [52.358766, 4.88873],
            [52.358562, 4.889102], [52.358409, 4.889448], [52.358195, 4.890277], [52.358154, 4.890765], [52.358046, 4.891423], [52.357644, 4.898061], [52.357654, 4.898375],
            [52.35872, 4.903519], [52.358768, 4.904013], [52.358702, 4.904042], [52.358663, 4.903541], [52.3576, 4.898402], [52.357592, 4.89815], [52.357877, 4.892841],
            [52.357987, 4.891393], [52.358005, 4.89083], [52.358134, 4.890256], [52.35835, 4.889416], [52.358771, 4.88859], [52.359078, 4.888215], [52.359774, 4.887442],
            [52.360064, 4.886906], [52.360111, 4.886731], [52.360666, 4.885669], [52.36149, 4.883961], [52.361607, 4.883518], [52.361638, 4.882172], [52.361733, 4.881673],
            [52.362011, 4.881061], [52.362352, 4.880616], [52.362848, 4.880002], [52.363574, 4.878918], [52.363769, 4.87869], [52.363972, 4.878612]
        ], {
            color: 'green'
        }).addTo(map);

        //icon for the green map icon object
        var greenIcon = L.icon({
            iconUrl: 'assets/pictures/map/green-icon.png',
            iconSize:     [30, 40], // size of the icon
        });

        const groenID = await this.#dashboardRepository.getGroenID();
        const coordinateX = await this.#dashboardRepository.getXcoordinate();
        const coordinateY = await this.#dashboardRepository.getYcoordinate();
        const typeID = await this.#dashboardRepository.getGreenTypeID();
        const type = await this.#dashboardRepository.getGreen();
        const areaID = await this.#dashboardRepository.getMapAreaID();
        const area = await this.#dashboardRepository.getArea();

        console.log(typeID)
        console.log(areaID)
        console.log(type)
        console.log(area)

        // place green icon on map with data from database @author Aleksandrs
        for (let i = 0; i < groenID.data.length; i++) {
            var groenMapObject = L.marker([coordinateX.data[i].coordinaatX, coordinateY.data[i].coordinaatY], {
                title: type.data[typeID.data[i].type_id].naam,
                icon: greenIcon,
            }).addTo(map).bindPopup("<b>Type: </b>" + type.data[typeID.data[i].type_id].naam + "<br><b>Gebied: </b>" + area.data[areaID.data[i].gebied_id].opmerking);
        }
    }
}