import {Controller} from "./controller.js";
import {AdminRepository} from "../repositories/adminRepository.js";
import {App} from "../app.js";
import {DashboardRepository} from "../repositories/DashboardRepository.js";

export class adminController extends Controller {
    #createAdminView;
    #adminRepository;
    #dashboardRepository;

    constructor() {
        super();
        this.#adminRepository = new AdminRepository();
        this.#dashboardRepository = new DashboardRepository();
        this.#setupView();
    }

    async #setupView() {
        this.#createAdminView = await super.loadHtmlIntoContent("html_views/admin.html")

        this.#createAdminView.querySelector("#submitGreenInputForm").addEventListener("click", (event) => this.#handleAddGreen(event));
        this.#createAdminView.querySelector("#submitAddGreenTypeForm").addEventListener("click", (event) => this.#handleAddGreenType(event));
        this.#createAdminView.querySelector("#submitRemoveGreenTypeForm").addEventListener("click", (event) => this.#removeGreenType(event));
        this.#createAdminView.querySelector("#submitremoveGreenAreaForm").addEventListener("click", (event) => this.#removeGreenArea(event));
        this.#createAdminView.querySelector("#submitremoveGreenObjectForm").addEventListener("click", (event) => this.#removeGreenObject(event));


        this.#handleAreaRefresh();
        this.#handleTypeRefresh();
        this.#handleGreenObjectRefresh();
        await this.#loadmap();

    }

    // remove green object @author Aleksandrs
    #removeGreenObject(){
        const removeGreenObjectList = this.#createAdminView.querySelector("#removeGreenObjectList");
        const selectedRemoveGreenObject = removeGreenObjectList.selectedIndex;

        this.#adminRepository.removeGreenObject(selectedRemoveGreenObject);
    }

    // remove green type @author Aleksandrs
    #removeGreenType(){
        const removeTypeList = this.#createAdminView.querySelector("#removeTypeList");
        const selectedRemoveType = removeTypeList.selectedIndex;

        this.#adminRepository.removeGreenType(selectedRemoveType);
    }

    // remove green area @author Aleksandrs
    #removeGreenArea(){
        const removeGreenList = this.#createAdminView.querySelector("#removeGreenAreaList");
        const selectedRemoveArea = removeGreenList.selectedIndex;

        this.#adminRepository.removeGreenArea(selectedRemoveArea);
    }

    // add green object form @author Aleksandrs
    #handleAddGreen() {
        const coordinaatX = this.#createAdminView.querySelector("#coordinateX").value;
        const coordinaatY = this.#createAdminView.querySelector("#coordinateY").value;
        const gebied = this.#createAdminView.querySelector("#greenAreaList");
        const selectedGebied = gebied.selectedIndex;
        const type_id = this.#createAdminView.querySelector("#typeList");
        const selectedType = type_id.selectedIndex;

        this.#adminRepository.addGreen(coordinaatX, coordinaatY, selectedGebied, selectedType);
    }

    // add green type @author Aleksandrs
    #handleAddGreenType() {
        const type = this.#createAdminView.querySelector("#greenTypeName").value;

        console.log(type);

        this.#adminRepository.addGreenType(type);
    }

    // refresh areas for lists @author Aleksandrs
    async #handleAreaRefresh(){

        const areaList = this.#createAdminView.querySelector("#greenAreaList");
        const removeAreaList = this.#createAdminView.querySelector("#removeGreenAreaList");
        const areaID = await this.#adminRepository.getArea();

        for(let i = 0; areaID.data.length > i; i++){
            areaList.innerHTML += `<option value="` + areaID.data[i].opmerking + `" data="`+ areaID.data[i].Gebiedsnummer +`">` + areaID.data[i].opmerking + `</option>`
            removeAreaList.innerHTML += `<option value="` + areaID.data[i].opmerking + `" data="`+ areaID.data[i].Gebiedsnummer +`">` + areaID.data[i].opmerking + `</option>`
        }
    }

    // refresh green types for lists @author Aleksandrs
    async #handleTypeRefresh(){
        const typeList = this.#createAdminView.querySelector("#typeList");
        const removeTypeList = this.#createAdminView.querySelector("#removeTypeList");
        const typeID = await this.#adminRepository.getType();

        for(let i = 0; typeID.data.length > i; i++){
            typeList.innerHTML += `<option value="` + typeID.data[i].naam + `" data="`+ typeID.data[i].id +`">` + typeID.data[i].naam + `</option>`
            removeTypeList.innerHTML += `<option value="` + typeID.data[i].naam + `" data="`+ typeID.data[i].id +`">` + typeID.data[i].naam + `</option>`
        }
    }

    // refresh green objects for lists @author Aleksandrs
    async #handleGreenObjectRefresh(){
        const removeGreenObjectList = this.#createAdminView.querySelector("#removeGreenObjectList");
        const greenObjectID = await this.#adminRepository.getGreenObject();

        for(let i = 0; greenObjectID.data.length > i; i++){
            removeGreenObjectList.innerHTML += `<option value="`+ greenObjectID.data[i].id +`" data="`+ greenObjectID.data[i].id +`"><b>ID:</b> ` + greenObjectID.data[i].id + ` Coordinaat X: ` + greenObjectID.data[i].coordinaatX + `  CoordinaatY: ` + greenObjectID.data[i].coordinaatY +`  Gebied: ` + greenObjectID.data[i].gebied_id +`  Type: ` + greenObjectID.data[i].type_id +`  Datum: ` + greenObjectID.data[i].datum +`</option>`
        }
    }

    async #loadmap() {

        // map setup @author Aleksandrs
        var map = L.map('add-object-map').setView([52.360938, 4.890879], 16);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // get coordinates when clicking on map
        var popup = L.popup();

        function onMapClick(e) {
            var X = e.latlng.lat;
            var Y = e.latlng.lng;
            popup
                .setLatLng(e.latlng)
                .setContent("Coordinaten: " + e.latlng.toString() + " zijn ingevuld op de invulform.")
                .openOn(map);
            document.getElementById('coordinateX').value = X;
            document.getElementById('coordinateY').value = Y;
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

        // map legend so its easier to see what things on the map mean @author Aleksandrs
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

        // add green objects from database to the map @author Aleksandrs
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