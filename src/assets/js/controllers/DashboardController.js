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
    #dashboardChart
    #chartTarget
    #comparing;

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
        this.#chartTarget = this.#dashboardView.querySelector("#myChart")

        await this.#loadDashboardValues()
        this.#gevelData();

        await this.#map();



        this.#dashboardChart = new Chart(this.#chartTarget, {
            type: 'line',
            data: {
                labels: this.#getMonthsArray(4),
                datasets: [{
                    label: 'Geveltuinen in deze maand',
                    data: [1, 25, 60, 87],
                },]
            },
            options: {
                scales: {y: {beginAtZero: true}},
                borderColor: '#058C42'
            }
        });

        this.#comparing = false;
        this.#dashboardView.querySelector("#compare-box").addEventListener("click",() => {
            this.#compareSwitch();
        })

        // Adds the eventlisteners to switch betweens all of the types, adds shadows and changes the text boxes
        this.#dashboardView.querySelector("#gevelData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#gevelData()

            this.#getFacadeGardenData().then(function (result) {
                this.#updateChart(result, "Geveltuinen geplant in deze maand");
            }.bind(this)); // ask why this works lmao
        })
        this.#dashboardView.querySelector("#boomData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#boomData();
            this.#getTreeGardenData().then(function (result) {
                this.#updateChart(result, "Boomtuinen geplant in deze maand");
            }.bind(this));
        })
        this.#dashboardView.querySelector("#groenData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#groenData();
            this.#getGreeneryData().then(function (result) {
                this.#updateChart(result, "GroeneM2 geplant in deze maand");
            }.bind(this));
        })
        this.#dashboardView.querySelector("#lkiData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#lkiData()
        })
        this.#dashboardView.querySelector("#tempData").addEventListener("click", () => {
            this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
            this.#PM25info()

            this.#dashboardChart.data.labels = this.#getPast24Hours(2) // todo fix after presentation (no hard-coded)

            this.#PM25TodayGraph().then(function(result) {
                this.#updateChart(result, "PM25 Uurwaarden aan het begin van elk uur")
                this.#dashboardChart.data.labels = this.#getMonthsArray(4)
            }.bind(this))

        })
    }

    #compareSwitch() {
        switch(this.#comparing) {
            case true:
                this.#stopCompare();
                break;
            case false:
                this.#startCompare();
                break;
        }
    }

    #startCompare() {
        console.log("---------------- \nStart Comparing: \n----------------")
        this.#dashboardView.querySelector("#compare-box").classList.add("invert-compare-button")
        this.#dashboardView.querySelector("#compare-box").classList.remove("compare-button")
        this.#dashboardView.querySelector("#compare-title").style.color="#058C42";
        this.#comparing = true;

        console.log(this.#dashboardView.querySelector(".shadow"))
    }

    #stopCompare() {
        console.log("---------------- \nStop Comparing: \n----------------")
        this.#dashboardView.querySelector("#compare-box").classList.remove("invert-compare-button")
        this.#dashboardView.querySelector("#compare-box").classList.add("compare-button")
        this.#dashboardView.querySelector("#compare-title").style.color="white";
        this.#comparing = false;
    }


    /**
     * Gets the values on the dashboard through the luchtmeetnet APi and our database
     * Displays these values on the dashboard.
     * @author @beerstj
     */
    async #loadDashboardValues() {
        // Gets dashboard data from the database
        const databaseValues = await this.#dashboardRepository.getDashboardValues();

        this.#animateCircleAndValues(this.#TREEGARDENINDEX, databaseValues.data[0].treeGarden)
        this.#animateCircleAndValues(this.#FACADEGARDENINDEX, databaseValues.data[0].facadeGarden)
        this.#animateCircleAndValues(this.#GREENERYINDEX, databaseValues.data[0].greenery)

        // gets dashboard values from the luchtmeetnet API
        try {
            const apiValues = await this.#dashboardRepository.getDashboardAPIValues();
            this.#animateCircleAndValues(this.#LKI, apiValues.AQI)
            this.#animateCircleAndValues(this.#FINE_DUST, apiValues.PM25)
        } catch (e) {
            console.log("Luchtmeetnet API is unavailable")
            console.log(e)
        }
    }

    async #getTreeGardenData() {
        let month;
        let amounts = []

        for (let i = 1; i < new Date(Date.now()).getMonth() + 2; i++) {
            month = await this.#dashboardRepository.getSelectedMonthTreeValues(i)
            amounts.push(month.data[0].TreeAmount)
        }

        return amounts;
    }

    async #getGreeneryData() {
        let month;
        let amounts = []

        for (let i = 1; i < new Date(Date.now()).getMonth() + 2; i++) {
            month = await this.#dashboardRepository.getSelectedMonthGroenValues(i)
            amounts.push(month.data[0].GroeneM2)
        }

        return amounts;
    }

    async #getFacadeGardenData() {
        let month;
        let amounts = []

        for (let i = 1; i < new Date(Date.now()).getMonth() + 2; i++) {
            month = await this.#dashboardRepository.getSelectedMonthGevelValues(i)
            amounts.push(month.data[0].GevelAmount)
        }

        return amounts;
    }

    async #PM25TodayGraph() {
        let values = await this.#dashboardRepository.getPM25Today();
        let array = []
        const targetBox = this.#dashboardView.querySelector("#myChart")

        for (let i = 0; i < 2; i++) {
            array.push(values.data[i].value)
        }

        return array;
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

    #PM25info() {
        this.#dashboardView.querySelector("#tempData").classList.add("shadow")
        this.#graphTextBox.innerText = "/ Fijnstof";
        this.#infoTextBox.innerText = "/ Fijnstof"
        this.#infoContentBox.innerHTML = `<div class="p fw-bold">Fijnstof uitleg</div>
        <div class="p">>Hier is de actuele informatie van de hoeveelheid fijnstof in Stadhouderskade te zien voor vandaag. Of u van plan bent om te gaan wandelen, te sporten of gewoon wil weten wat voor hoeveelheid het is.</div>`;
    }

    /**
     * Functions to update the values and labels of the chart when yyou want to switch the chart.
     * @param data - data to place in the chart
     * @param label - label to display above the chart.
     */
    #updateChart(data, label) {
        this.#dashboardChart.data.datasets[0].data = data
        this.#dashboardChart.data.datasets[0].label = label;

        this.#dashboardChart.update()
    }

    /**
     * Gets the past 24 hours in a array (For example, if its 16:00, you will get:
     * ['15:00 ', '14:00 ', '13:00 ', '12:00 ', '11:00 ', '10:00 ', '9:00 ', '8:00 ', '7:00 ', '6:00 ', '5:00 ', '4:00 ', '3:00 ', '2:00 ', '1:00 ', '24:00 ', '23:00 ', '22:00 ', '21:00 ', '20:00 ', '19:00 ', '18:00 ', '17:00 ', '16:00 ']
     * Used for the labels in today charts.
     * @returns array of past 24 hours.
     */
    #getPast24Hours(amount) {
        let curHour = new Date(Date.now()).toISOString().substring(11, 13);
        let hoursArray = [];

        curHour++;
        curHour++;
        curHour++;

        for (let i = 0; i < amount; i++) {
            curHour = curHour - 1;

            if (curHour === 0) {
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
     * Animates both the circle and the number value in one function.
     * @param target - the html element you want to animate
     * @param value - the value to what number the animation should go.
     */
    #animateCircleAndValues(target, value) {
        this.#animateValues(target, value)
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
        const valueTargetList = this.#dashboardView.getElementsByClassName("green-value");
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
    #animateCircle(value, circleSelector) {
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

        // Stadhouderskade area on map @Sakhi Anwari
        //Gebied 1 huisnummer 1-40
        var gebied1 = L.polygon([
            [52.364006, 4.8788], [52.3641, 4.879245], [52.363813, 4.879509], [52.363275, 4.881027], [52.362041, 4.881809], [52.361856, 4.88234], [52.361712, 4.884001],
            [52.36165, 4.884218], [52.361149, 4.88521], [52.361008, 4.884972], [52.361448, 4.88399], [52.361578, 4.883518], [52.361568, 4.882268], [52.361987, 4.881061],
            [52.3628, 4.879992], [52.363577, 4.878849]
        ], {
            color: 'red'
        }).addTo(map);

        //Gebied 2 huisnummer 40-80
        var gebied2 = L.polygon([
            [52.360989, 4.885025], [52.361135, 4.885242],
            [52.360364, 4.886762], [52.359794, 4.887781],
            [52.35909, 4.888564], [52.358825, 4.888977],
            [52.35854, 4.889519], [52.358248, 4.890592], [52.358068, 4.893242],
            [52.357786, 4.893188], [52.357963, 4.890753], [52.358382, 4.889143],
            [52.359038, 4.88814], [52.359804, 4.887148], [52.360921, 4.885083]
        ], {
            color: 'green'
        }).addTo(map);

        //Gebied 3 huisnummer 80-120
        var gebied3 = L.polygon([
            [52.357785, 4.893225], [52.358062, 4.893286],
            [52.357802, 4.898071], [52.357923, 4.899026],
            [52.357689, 4.899187], [52.357517, 4.898364],
            [52.357778, 4.893225]
        ], {
            color: 'blue'
        }).addTo(map);

        //Gebied 4 huisnummer 120-160
        var gebied4 = L.polygon([
            [52.357684, 4.899211], [52.357914, 4.899067],
            [52.358423, 4.901529], [52.35851, 4.901939],
            [52.358911, 4.90394], [52.358644, 4.904085],
            [52.3586, 4.903618], [52.357717, 4.899461]
        ], {
            color: 'magenta'
        }).addTo(map);


        //icon for the green map icon object
        var greenIcon = L.icon({
            iconUrl: 'assets/pictures/map/green-icon.png',
            iconSize: [30, 40], // size of the icon
        });

        //map legend
        var legend = L.control({position: "bottomleft"});

        legend.onAdd = function (map) {
            var div = L.DomUtil.create("div", "legend");
            div.innerHTML += "<h4>Legenda</h4>";
            div.innerHTML += '<i style="background: red"></i><span>Stadhouderskade 1-40</span><br>';
            div.innerHTML += '<i style="background: green"></i><span>Stadhouderskade 40-80</span><br>';
            div.innerHTML += '<i style="background: blue"></i><span>Stadhouderskade 80-120</span><br>';
            div.innerHTML += '<i style="background: magenta"></i><span>Stadhouderskade 120-160</span><br>';
            div.innerHTML += '<i class="icon" style="background-image: url(https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Map_pin_icon_green.svg/94px-Map_pin_icon_green.svg.png);background-repeat: no-repeat; background-size: 18px 18px;"></i><span>Groen locatie</span><br>';
            return div;
        };

        legend.addTo(map);

        const groenData = await this.#dashboardRepository.getGroen();


        for (let i = 0; i < groenData.data.length; i++) {
            let groen = groenData.data[i]
            var groenMapObject = L.marker([groen.coordinaatX, groen.coordinaatY], {
                title: groen.naam,
                icon: greenIcon,
            }).addTo(map).bindPopup("<b>Type: </b>" + groen.naam + "<br><b>Gebied: </b>" + groen.opmerking);
        }

    }
}