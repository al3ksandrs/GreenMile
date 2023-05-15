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

        this.#getDashboardDatabaseValues();
        this.#getDashboardAPIValues();

        this.#getInfomation()

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
     */
    async #ValuesPM25Today() {
        this.#app.get("/PM25Today", async (req,res) => {
            let reqOptions= {
                method: "GET",
                redirect: "follow",
            };

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


    /**
     * Selects the amount of trees planted in specified month. Used to create charts on dashboard
     * @returns {Promise<void>}
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