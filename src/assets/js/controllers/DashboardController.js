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

    #currentlyComparing;
    #currentGraphView;
    #chartCompareList

    #PM25days
    #PM25weeks
    #PM25months

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

        const elements = ["#facadeGardenCircle", "#treeGardenCircle", "#greeneryCircle", "#aqiCircle", "#PM25Circle"];
        const texts = ["/ Geveltuinen", "/ Boomtuinen", "/ Groene M²", "/ LKI", "/ Fijnstof"];
        const infoContent = [
            `<div class="p">Geveltuinen aan de Stadhouderskade in Amsterdam zijn groene ruimten aan de voorgevels van gebouwen. Ze verbeteren de luchtkwaliteit, verminderen geluidsoverlast en bevorderen de biodiversiteit. Geveltuinen zijn een geweldige manier om de leefbaarheid van de stad te verbeteren door de gemeenschap te betrekken.</div>`,
            `<div class="p">Boomtuinen zijn groene ruimten rond bomen in steden. Ze verbeteren de luchtkwaliteit, verminderen hitte-eilanden en stimuleren de biodiversiteit. Boomtuinen brengen mensen samen en betrekken hen bij het verbeteren van hun omgeving. Ze zijn ook een belangrijk onderdeel van stadsvergroening en duurzaamheidsbeleid in steden als Amsterdam</div>`,
            ` <div class="p">Een smalle strook groen langs wegen of gebouwen, groenstroken verbeteren de lucht- en geluidskwaliteit, bieden ontspanningsruimten en fungeren als buffers. Groenstroken zijn belangrijk voor stedenbouw en de vergroening van steden.</div>`,
            `<div class="p">LKI staat voor "Luchtkwaliteitsindex" en een lage LKI-waarde is goed omdat dit betekent datde luchtkwaliteit relatief goed is en een hoge waarde kan leiden tot gezondheidsproblemen. Het is belangrijkom de LKI-waarde in jouw regio te controleren en maatregelen te nemen om de blootstelling aan vervuilendestoffen te verminderen.</div>`,
            `<div class="p">Hier is de actuele informatie van de hoeveelheid fijnstof in Stadhouderskade te zien voor vandaag. Of u van plan bent om te gaan wandelen, te sporten of gewoon wil weten wat voor hoeveelheid het is. Als de grafiek niet helemaal gevuld is, komt dit doordat de luchtmeetnet API er een tijdje uit heeft geleden.</div>`];

        this.#graphTextBox.innerText = texts[0];
        this.#infoTextBox.innerText = texts[0];
        this.#infoContentBox.innerHTML = infoContent[0];

        await this.#loadDashboardValues()

        await this.#map();

        //Initializes the main chart.
        this.#dashboardChart = new Chart(this.#chartTarget, {
            type: 'line',
            data: {
                labels: ["Januari", "Februari", "Maart", "April"],
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

        this.#currentlyComparing = false;
        this.#chartCompareList = []

        this.#dashboardView.querySelector("#compare-box").addEventListener("click",() => {
            this.#compareSwitch();
        })

        this.#dashboardView.querySelector("#modal-show").addEventListener("click", () => {
            this.#showInformationModal()
        })

        this.#dashboardView.querySelector("#hide-modal").addEventListener("click", () => {
            this.#hideInformationModal()
        })

        if(!this.#currentlyComparing) {
            elements.forEach((element, index) => {
                this.#dashboardView.querySelector(element).addEventListener("click", () => {
                    this.#dashboardView.querySelector(".shadow").classList.remove("shadow");
                    this.#dashboardView.querySelector(element).classList.add("shadow")
                    this.#graphTextBox.innerText = texts[index];
                    this.#infoTextBox.innerText = texts[index];
                    this.#infoContentBox.innerHTML = infoContent[index];
                    this.#addSelectedChart(this.#dashboardView.querySelector(".shadow").id);
                });
            });
        }

        this.#graphViewEventListeners()

        await this.#preloadPM25Values()
    }

    /**
     * Gets the values on the dashboard through the luchtmeetnet API and our database
     * Displays these values on the dashboard.
     * @author beerstj
     */
    async #loadDashboardValues() {
        // gets dashboard values from the luchtmeetnet API and the database
        try {
            const apiValues = await this.#dashboardRepository.getDashboardAPIValues();
            const databaseValues = await this.#dashboardRepository.getDashboardValues();

            this.#animateCircleAndValues(this.#LKI, apiValues.AQI)
            this.#animateCircleAndValues(this.#FINE_DUST, apiValues.PM25)

            this.#animateCircleAndValues(this.#TREEGARDENINDEX, databaseValues.data[0].treeGarden)
            this.#animateCircleAndValues(this.#FACADEGARDENINDEX, databaseValues.data[0].facadeGarden)
            this.#animateCircleAndValues(this.#GREENERYINDEX, databaseValues.data[0].greenery)
        } catch (e) {
            console.log("Luchtmeetnet API  or database is currently unavailable")
            console.log(e)
        }
    }

    /**
     * Method to start or end a comparison. Switches between these based on the currentlyComparing boolean
     * @author beerstj
     */
    #compareSwitch() {
        switch(this.#currentlyComparing) {
            case true:
                this.#currentlyComparing = false;
                this.#stopCompare();
                break;
            case false:
                this.#currentlyComparing = true;
                this.#startCompare();
                break;
        }
    }

    /**
    * Method to start a comparison between multiple graphs.
    * @author beerstj
     * */
    #startCompare() {
        // Changes the color of the compare button to indidcate that the comparisons started
        console.log("Start Compare")
        this.#dashboardView.querySelector("#chart-view-container").classList.add("hidden")
        this.#dashboardView.querySelector("#comparison-impossible").classList.remove("hidden")
        this.#dashboardView.querySelector("#compare-box").classList.add("invert-compare-button")
        this.#dashboardView.querySelector("#compare-box").classList.remove("compare-button")
        this.#dashboardView.querySelector("#compare-title").style.color = "#058C42";

        // Array of every circle diagram on the page.
        let circles = this.#dashboardView.querySelectorAll(".progress-bar-container")

        // attaches eventlisteners to every circle diagram on the dashboard
        for (let i = 0; i < circles.length; i++) {
            circles[i].addEventListener("click", () => { // Adds a listener to every circle, and puts it in an array
                if(!this.#chartCompareList.includes(circles[i].id)) {
                    this.#chartCompareList.push(circles[i].id) // If the circle diagram is not yet in the array, its puts it in there.
                }
                console.log(this.#chartCompareList)
            })
        }

    }

    /**
     * Stops the comparisons, changes the compare box to indicate the comparisons has stopped,
     * Removes all the datasets from the chart and updates it aswell
     * @author beerstj
     */
    #stopCompare() {
        console.log("Stop Comparing")
        this.#dashboardView.querySelector("#chart-view-container").classList.remove("hidden")
        this.#dashboardView.querySelector("#comparison-impossible").classList.add("hidden")
        this.#dashboardView.querySelector("#compare-box").classList.remove("invert-compare-button")
        this.#dashboardView.querySelector("#compare-box").classList.add("compare-button")
        this.#dashboardView.querySelector("#compare-title").style.color="white";
        this.#chartCompareList = [];
    }


    /**
     * Gets the currently selected chart, loads the correct data for the database and updates the chart accordingly
     * @author beerstj
     */
    #addSelectedChart(selectedType) {
        // After this, there is a switch to check the selectedType, inside this switch all of the data is
        // requested through the repository and the database. When the data is collected, the chart is updated
        switch (selectedType) {
            case "facadeGardenCircle":
                this.#dashboardRepository.getSelectedTimespanTreeGardenData(this.#currentGraphView, 2)
                    .then(result => {
                        this.#updateChart(result)
                    })
                break;
            case "treeGardenCircle":
                this.#dashboardRepository.getSelectedTimespanTreeGardenData(this.#currentGraphView, 1)
                    .then(result => {
                        this.#updateChart(result)
                    })
                break;
            case "greeneryCircle":
                this.#dashboardRepository.getSelectedTimespanGreenery(this.#currentGraphView)
                    .then(result => {
                        this.#updateChart(result)
                    })
                break;
            case "PM25Circle":
                // Because the data for our PM25 chart is preloaded, we also have a switch for the current view
                // selected of the chart.
                switch (this.#currentGraphView) {
                    case "days":
                        this.#updateChart(this.#PM25days);
                        break;
                    case "weeks":
                        this.#updateChart(this.#PM25weeks);
                        break;
                    case "months":
                        this.#updateChart(this.#PM25months);
                }
                break;
            default:
                console.log("Graph not yet supported")
                break;
        }

        console.log(selectedType + ": " + this.#currentGraphView)
    }

    /**
     * Because the website and luchtmeet API connection can be quite slow, we preload the data. So we can just load it into the charts
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #preloadPM25Values() {
        await this.#dashboardRepository.getSelectedPM25Data("days").then(daysResult => {
            this.#PM25days = daysResult;
            console.log("PM25 Data preloaded (Days)");
        })

        await this.#dashboardRepository.getSelectedPM25Data("weeks").then(weekResult => {
            this.#PM25weeks = weekResult;
            console.log("PM25 Data preloaded (Weeks)");
        })

        await this.#dashboardRepository.getSelectedPM25Data("months").then(monthResult => {
            this.#PM25months = monthResult;
            console.log("PM25 Data preloaded (Months)");
        })
    }

    /**
     * Updates the chart's labels, data and label
     * @param object - object that contains all of the data
     */
    #updateChart(object) {
        this.#dashboardChart.data.datasets[0].data = object.data; // data in the chart
        this.#dashboardChart.data.datasets[0].label = object.label; // label (title) of the graph

        this.#dashboardChart.data.labels = object.labels // labels under the graph
        this.#dashboardChart.update()
    }

    /**
     * Animates both the circle and the number value in one function.
     * @param target - the html element you want to animate
     * @param value - the value to what number the animation should go.
     * @author beerstj
     */
    #animateCircleAndValues(target, value) {
        let startTimestamp = null;
        let start = 0;
        let duration = 500;
        const valueTargetList = this.#dashboardView.getElementsByClassName("green-value");
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            valueTargetList[target].innerHTML = Math.floor(progress * (value - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);

        let offsetValue = Math.floor(((100 - value) * parseInt(window.getComputedStyle(document.querySelectorAll(".progress-circle svg circle")[target]).getPropertyValue("stroke-dasharray").replace("px", ""))) / 100);

        // This is to animate the circle
        document.querySelectorAll(".progress-circle svg circle")[target].animate([{strokeDashoffset: parseInt(window.getComputedStyle(document.querySelectorAll(".progress-circle svg circle")[target]).getPropertyValue("stroke-dasharray").replace("px", "")),}, {strokeDashoffset: offsetValue,},], {duration: 500,});

        // Without this, circle gets filled 100% after the animation
        document.querySelectorAll(".progress-circle svg circle")[target].style.strokeDashoffset = offsetValue;
    }

    /**
     * Adds eventlisteners to the different views of the chart (days, weeks, months). And changes the style of the currently
     * selected chartView
     * @author beerstj
     */
    #graphViewEventListeners() {
        let days = this.#dashboardView.querySelector("#days")
        let weeks = this.#dashboardView.querySelector("#weeks")
        let months = this.#dashboardView.querySelector("#months")
        this.#currentGraphView = "days"

        days.addEventListener("click", () => {
            this.#dashboardView.querySelector(".graph-view-active").classList.remove("graph-view-active")
            days.classList.add("graph-view-active")
            this.#currentGraphView = "days"
            this.#addSelectedChart(this.#dashboardView.querySelector(".shadow").id)
        })
        weeks.addEventListener("click", () => {
            this.#dashboardView.querySelector(".graph-view-active").classList.remove("graph-view-active")
            weeks.classList.add("graph-view-active")
            this.#currentGraphView = "weeks"
            this.#addSelectedChart(this.#dashboardView.querySelector(".shadow").id)
        })
        months.addEventListener("click", () => {
            this.#dashboardView.querySelector(".graph-view-active").classList.remove("graph-view-active")
            months.classList.add("graph-view-active")
            this.#currentGraphView = "months"
            this.#addSelectedChart(this.#dashboardView.querySelector(".shadow").id)
        })
    }

    /**
     * Checks the selected data type from which you want to see more information.
     * @author beerstj
     */
    #showInformationModal() {
        console.log("Show Modal: " + this.#dashboardView.querySelector(".shadow").id)
        this.#dashboardView.querySelector("#modal").classList.remove("hidden")

        this.#dashboardRepository.getModalInformation(this.#dashboardView.querySelector(".shadow").id)
            .then(function (result) {
                this.#dashboardView.querySelector("#definitionType").innerText = result.data[0].definitionType.substring(0, 600)
                this.#dashboardView.querySelector("#whyChange").innerText = result.data[0].whyChange.substring(0, 600)
                this.#dashboardView.querySelector("#howChange").innerText = result.data[0].howChange.substring(0, 600)
            }.bind(this))
    }

    /**
     * Hides the information modal
     * @author beerstj
     */
    #hideInformationModal() {
        console.log("Hide modal: " + this.#dashboardView.querySelector(".shadow").id)
        this.#dashboardView.querySelector("#modal").classList.add("hidden")
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