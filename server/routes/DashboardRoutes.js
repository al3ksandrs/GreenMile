/**
 * Class that contains all of the routes for the dashboard
 * @authors
 *  - beerstj
 */

class DashboardRoutes {
    #app
    #errorCodes = require("../framework/utils/httpErrorCodes");
    #databaseHelper = require("../framework/utils/databaseHelper");
    #requestOptions
    #greenType;
    #avgArray

    constructor(app) {
        this.#app = app;

        this.#getSelectMonthGroen();
        this.#getSelectMonthTree();
        this.#getSelectGevelMaand();

        this.#getFacadeAndTreeGardenData()

        this.#getDashboardDatabaseValues();
        this.#getDashboardAPIValues();

        this.#getInfomation()

        this.#getGreeneryM2Data();

        this.#getpm25Chart()

        // map routes
        this.#getGroen();
         this.#requestOptions = {
            method: "GET",
            redirect: "follow"
        }

    }

    /**
     * Gets the values that we want to display on the dashbaord through our database
     * @returns promise that contains the data
     * @author beerstj
     */
    async #getDashboardDatabaseValues() {
        this.#app.get("/dashboard/database", async (req,res) => {
            try {
                let allValues = await this.#databaseHelper.handleQuery({
                    query: "SELECT " +
                                "SUM(CASE WHEN type_id = 1 THEN 1 ELSE 0 END) AS treeGarden, " +
                                "SUM(CASE WHEN type_id = 2 THEN 1 ELSE 0 END) AS facadeGarden, " +
                                 "(SELECT COUNT(*) FROM GroeneM2) AS greenery " +
                            "FROM Groen"
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data: allValues})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * Gets the data we want to display from the luchtmeetnet API
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #getDashboardAPIValues() {
        this.#app.get("/dashboard/API/Luchtmeetnet", async (req,res) => {
            let today = new Date(Date.now()).toISOString();
            let yesterday = new Date(Date.now() - 72000001).toISOString();

            try {
                let AQI;
                let PM25;

                await fetch("https://api.luchtmeetnet.nl/open_api/lki?station_number=NL49017&" +
                    "start=" + yesterday +
                    "&end=" + today, this.#requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data){
                        AQI = data.data[0].value;
                    })

                await fetch("https://api.luchtmeetnet.nl/open_api/measurements?" +
                    "start=" + yesterday +
                    "&end=" + today +
                    "&station_number=NL49017&formula=PM25&page=1&order_by=timestamp_measured&order_direction=desc", this.#requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        PM25 = data.data[0].value
                    })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({AQI: AQI, PM25: PM25})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    async #getpm25Chart() {
        this.#app.get("/dashbaord/api/luchtmeetnet/PM25/timespan/:timespan", async (req,res) => {
            let date1 = new Date(Date.now())
            let date2 = new Date();
            this.#avgArray = []

            switch(req.params.timespan) {
                case "days":

                    for (let i = 0; i < 31; i++) { // Loops through everyday of the timespan selected
                        date2.setDate(date1.getDate() - 1)
                        await this.#calculateAverageFromResult(i, date1, date2)
                        date1.setDate(date1.getDate() - 1)
                    }

                    res.status(this.#errorCodes.HTTP_OK_CODE).json({data: this.#avgArray, label: "Dag gemiddelden van de fijnstof (PM2.5) waardes van de afgelopen 30 dagen.", labels: this.#getLabels(req.params.timespan).reverse()})
                    break;

                case "weeks":
                    for (let i = 0; i < 16; i++) {
                        date2.setDate(date1.getDate()-7)
                        await this.#calculateAverageFromResult(i, date1, date2)
                        date1.setDate(date2.getDate())
                    }
                    res.status(this.#errorCodes.HTTP_OK_CODE).json({data: this.#avgArray, label: "Week gemiddelden van de fijnstof (PM2.5) waardes van de afgelopen 15 weken.", labels: this.#getLabels(req.params.timespan).reverse()})
                    break;

                case "months":
                    let hardcode = [23.52, 31.33, 24.10, 20.79]
                    let total = 0;

                    let days = new Date(Date.now());
                    let weeks = Math.floor(days.getDate() / 7)

                    let date3 = new Date(days.getFullYear(), days.getMonth(), 1)
                    let date4 = new Date()

                    for (let i = 0; i < weeks; i++) {
                        date4.setDate(date3.getDate() + 7)
                        await this.#calculateAverageFromResult(i, date4, date3)
                        date3.setDate(date4.getDate())
                    }
                    await this.#calculateAverageFromResult(new Date(Date.now()).getMonth(),date4, date3)

                    for (let i = 0; i < this.#avgArray.length; i++) {
                        total += this.#avgArray[i]
                    }

                    hardcode.push(total / this.#avgArray.length)
                    res.status(this.#errorCodes.HTTP_OK_CODE).json({data: hardcode, label: "Maand gemiddelden van de fijnstof (PM2.5) waardes tot het begin van het jaar.", labels: this.#getLabels(req.params.timespan)})
                    break;
            }

        })
    }

    async #calculateAverageFromResult(i, date1, date2) {
        await fetch("https://api.luchtmeetnet.nl/open_api/measurements?" +
            "start=" + date2.toISOString() + "&end=" + date1.toISOString() +
            "&station_number=NL49017&formula=PM25&page=1&order_by=timestamp_measured&order_direction=desc", this.#requestOptions)
            .then(function (response) { return response.json();})
            .then(function (data) {
                if(typeof data !== 'undefined') { // If no data exists for curDay, push 0 to array
                    let total = 0
                    for (let curHour = 0; curHour < data.data.length; curHour++) { // loops through every hour of the day
                        if(typeof data.data[i] !== 'undefined') { total += data.data[i].value } // Checks if curHour is undefined.
                    }
                    // console.log("Progress: " + i + " Current Average: "+ total / data.data.length)
                    if(total === 0) {
                        this.#avgArray.push(null)
                    } else {
                        this.#avgArray.push(total/data.data.length)
                    }
                } else return null
            }.bind(this))
    }

    async #getFacadeAndTreeGardenData() {
        this.#app.get("/dashboard/timespan/:timespan/type/:type_id", async (req,res) => {
            switch (req.params.type_id) {
                case "1": // String because req.params.type_id is a string
                    this.#greenType = "Boomtuinen"
                    break;
                case "2":
                    this.#greenType = "Geveltuinen"
                    break;
                default:
                    break;
            }

            let totalArray = []
            let totalNumber = 0;
            let today = new Date(Date.now())
            let weekNumber = Math.ceil((Math.floor((new Date() - (new Date((new Date()).getFullYear(), 0, 1))) / 86400000))/7);
            const timespan = req.params.timespan

            switch (timespan) {
                case "days":
                    try {
                        for (let i = 0; i < 31; i++) {
                            let data = await this.#databaseHelper.handleQuery( {
                                query: "SELECT COUNT(datum) as dayTotal FROM Groen WHERE DAY(datum) = ? AND type_id = ? AND MONTH(DATUM) = 3;",
                                values: [i, req.params.type_id]
                            })

                            totalNumber += data[0].dayTotal
                            totalArray.push(totalNumber)
                        }
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({label: "Totalen van gemaakte " + this.#greenType + " de de afgelopen 30 dagen", data: totalArray, labels: this.#getLabels(timespan)})
                    } catch (e) { res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e}) }
                    break;
                case "weeks":
                    try {
                        for (let i = weekNumber - 15; i < weekNumber +1; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(datum) AS weekTotal FROM Groen WHERE WEEK(datum) = ? AND type_id = ?",
                                values:  [i, req.params.type_id]
                            })

                            totalNumber+= data[0].weekTotal
                            totalArray.push(totalNumber)
                        }
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({label: "Totalen van gemaakte " + this.#greenType + " de de afgelopen 15 weken", data: totalArray, labels: this.#getLabels(timespan).reverse()})
                    } catch (e) { res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e}) }
                    break;
                case "months":
                    try {
                        for (let i = 1; i < today.getMonth() + 2; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(datum) AS monthTotal FROM Groen WHERE MONTH(datum) = ? AND type_id = ?",
                                values:  [i, req.params.type_id]
                            })
                            totalNumber += data[0].monthTotal
                            totalArray.push(totalNumber)
                        }
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({label: "Totalen van gemaakte " + this.#greenType + " aan het begin van elke maand sinds het begin van het jaar", data: totalArray, labels: this.#getLabels(timespan).reverse()})
                    } catch (e) {res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e})}
                    break;
            }
        })
    }

    #getGreeneryM2Data() {
        this.#app.get("/dashboard/greenery/timespan/:timespan", async (req, res) => {
            let totalNumber = 0;
            let totalArray = [];
            let today = new Date(Date.now())
            let weekNumber = Math.ceil((Math.floor((new Date() - (new Date((new Date()).getFullYear(), 0, 1))) / 86400000))/7);
            const timespan = req.params.timespan

            switch(timespan) {
                case "days":
                    try {
                        for (let i = 0; i < 31; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(groenem2) AS GroeneM2 FROM GroeneM2 WHERE DAY(datum) = ? AND MONTH(datum) = 1",
                                values: [i]
                            })
                            totalNumber += data[0].GroeneM2
                            totalArray.push(totalNumber)
                        }
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({label: "Totalen van geplante Groene M2 de de afgelopen 30 dagen", data: totalArray, labels: this.#getLabels(timespan)})

                    } catch(e) {res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e})}
                    break;
                case "weeks":
                    try {
                        for (let i = weekNumber - 16; i < weekNumber; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT SUM(groeneM2) AS weekTotal FROM GroeneM2 WHERE WEEK(datum) = ?",
                                values:  [i]
                            })

                            totalNumber+= data[0].weekTotal
                            totalArray.push(totalNumber)
                        }
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({label: "Totalen van geplante Groene M2 de de afgelopen 15 weken", data: totalArray, labels: this.#getLabels(timespan)})

                    } catch (e) { res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e}) }
                    break;
                case "months":
                    try {
                        for (let i = 0; i < today.getMonth() +1; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(groenem2) AS GroeneM2 FROM GroeneM2 WHERE MONTH(datum) = ?",
                                values: [i]
                            })
                            totalNumber += data[0].GroeneM2
                            totalArray.push(totalNumber)
                        }
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({label: "Totalen van geplante Groene M2 aan het begin van elke maand sinds het begin van het jaar", data: totalArray, labels: this.#getLabels(timespan)})

                    } catch(e) {res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e})}
                    break;
            }
        })
    }

    /**
     * Selects the amount of trees planted in specified month. Used to create charts on dashboard
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #getSelectMonthTree() {
        this.#app.get("/treeAmount/maand/:id", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "SELECT COUNT(datum) AS TreeAmount FROM Groen WHERE MONTH(datum) = ? AND type_id = 1",
                    values: [req.params.id]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e})
            }
        })
    }

    async #getSelectGevelMaand() {
        this.#app.get("/gevel/maand/:id", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "SELECT COUNT(datum) AS GevelAmount FROM Groen WHERE MONTH(datum) = ? AND type_id = 2",
                    values: [req.params.id]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e})
            }
        })
    }

    /**
     * Gets the amount of greenery M2 that was added in a specified month from our database.
     * Used in the dashboard controller to one of the graphs.
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #getSelectMonthGroen() {
        this.#app.get("/groen/maand/:id", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "SELECT COUNT(groenem2) AS GroeneM2 FROM GroeneM2 WHERE MONTH(datum) = ?",
                    values: [req.params.id]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    // map routes @author Aleksandrs
    async #getGroen() {
        this.#app.get("/map/getGroen", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT result.opmerking, result.datum, result.coordinaatX, result.coordinaatY, type.naam FROM (SELECT * FROM gebied inner join groen ON gebied.Gebiedsnummer = groen.gebied_id) as result INNER JOIN type ON result.type_id = type.id"
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * Gets all of the information for the modal on the dashboard from our database
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #getInfomation() {
        this.#app.get("/dashboard/information/:id", async (req, res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM informationModal WHERE id = ?",
                    values: [req.params.id]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data: data})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    #getLabels(timespan) {
        const months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
        let weekNumber = Math.ceil((Math.floor((new Date() - (new Date((new Date()).getFullYear(), 0, 1))) / 86400000))/7);
        let labelArray = [];

        switch(timespan) {
            case "days":
                for (let i = 0; i < 31; i++) {
                    let date = new Date();
                    date.setDate(date.getDate() - i);
                    let dayNumber = date.getDate()
                    let month = months[date.getMonth()]
                    labelArray.push(dayNumber + " " + month);
                }
                labelArray.reverse()
                break;
            case "weeks":
                for (let i = weekNumber - 15; i < weekNumber +1; i++) {
                    labelArray.push("Week " + i)
                }

                break;
            case "months":
                for (let i = 0; i < new Date(Date.now()).getMonth() + 1; i++) {
                    labelArray.push(months[i])
                }
                break;
            default:
                break;
        }

        return labelArray;
    }
}

module.exports = DashboardRoutes;