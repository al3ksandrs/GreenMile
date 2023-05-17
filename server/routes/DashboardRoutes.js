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

    constructor(app) {
        this.#app = app;

        this.#getSelectMonthGroen();
        this.#getSelectMonthTree();
        this.#getSelectGevelMaand();
        this.#ValuesPM25Today();

        this.#getFacadeAndTreeGardenData()

        this.#getDashboardDatabaseValues();
        this.#getDashboardAPIValues();

        this.#getInfomation()

        this.#getGreeneryM2Data();

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

    /**
     * Function to get all of the PM25 values from today, from the luchtmeetnet API
     * @returns {Promise<void>}
     * @author beerstj
     */
    async #ValuesPM25Today() {
        this.#app.get("/PM25Today", async (req,res) => {
            let values = [];

            await fetch("https://api.luchtmeetnet.nl/open_api/measurements?" +
                "start=" + new Date(Date.now() - 106400000).toISOString() +
                "&end=" + new Date(Date.now()).toISOString() +
                "&station_number=NL49017&formula=PM25&page=1&order_by=timestamp_measured&order_direction=desc&", this.#requestOptions)
                .then (function (response) {
                    return response.json();
                }).then(function (data) {
                    values = data
                })

            res.status(this.#errorCodes.HTTP_OK_CODE).json(values)

        })
    }

    async #getFacadeAndTreeGardenData() {
        this.#app.get("/dashboard/timespan/:timespan/type/:type_id", async (req,res) => {
            let totalArray = []
            let totalNumber = 0;
            let today = new Date(Date.now())
            let weekNumber = Math.ceil((Math.floor((new Date() - (new Date((new Date()).getFullYear(), 0, 1))) / 86400000))/7);
            switch (req.params.timespan) {
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
                    } catch (e) { res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e}) }
                    break;
                case "weeks":
                    try {
                        for (let i = weekNumber - 16; i < weekNumber; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(datum) AS weekTotal FROM Groen WHERE WEEK(datum) = ? AND type_id = ?",
                                values:  [i, req.params.type_id]
                            })

                            totalNumber+= data[0].weekTotal
                            totalArray.push(totalNumber)
                        }
                    } catch (e) { res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e}) }
                    break;
                case "months":
                    try {
                        for (let i = 1; i < today.getMonth() + 1; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(datum) AS monthTotal FROM Groen WHERE MONTH(datum) = ? AND type_id = ?",
                                values:  [i, req.params.type_id]
                            })
                            totalNumber += data[0].monthTotal
                            totalArray.push(totalNumber)
                        }
                    } catch (e) {res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e})}
                    break;
            }
            res.status(this.#errorCodes.HTTP_OK_CODE).json({timespan: req.params.timespan, totals: totalArray})
        })
    }

    #getGreeneryM2Data() {
        this.#app.get("/dashboard/greenery/timespan/:timespan", async (req, res) => {
            let totalNumber = 0;
            let totalArray = [];
            let today = new Date(Date.now())
            let weekNumber = Math.ceil((Math.floor((new Date() - (new Date((new Date()).getFullYear(), 0, 1))) / 86400000))/7);

            switch(req.params.timespan) {
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
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({timespan: "days", totals: totalArray})

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
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({timespan: "week", totals: totalArray})

                    } catch (e) { res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e}) }
                    break;
                case "months":
                    try {
                        for (let i = 0; i < today.getMonth(); i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(groenem2) AS GroeneM2 FROM GroeneM2 WHERE MONTH(datum) = ?",
                                values: [i]
                            })
                            totalNumber += data[0].GroeneM2
                            totalArray.push(totalNumber)
                        }
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({timespan: "months", totals: totalArray})

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
}

module.exports = DashboardRoutes;