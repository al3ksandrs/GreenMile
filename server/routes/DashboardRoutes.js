const fetch = require("node-fetch");

class DashboardRoutes {
    #app
    #errorCodes = require("../framework/utils/httpErrorCodes");
    #databaseHelper = require("../framework/utils/databaseHelper");

    constructor(app) {
        this.#app = app;

        this.#getSelectMonthGroen();
        this.#getLKI();
        this.#getTemp();
        this.#getSelectMonthTree();
        this.#getSelectGevelMaand();
        this.#ValuesPM25Today();

        this.#getDashboardDatabaseValues();
        this.#getDashboardAPIValues();

        this.#getGroenID();
        this.#getXcoordinate();
        this.#getYcoordinate();
        this.#getGreenTypeID();
        this.#getMapAreaID();
        this.#getGreenType();
        this.#getArea();
    }

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

    async #getDashboardAPIValues() {
        this.#app.get("/dashboard/API/Luchtmeetnet", async (req,res) => {
            let requestOptions = {
                method: "GET",
                redirect: "Follow"
            }

            let today = new Date(Date.now()).toISOString();
            let yesterday = new Date(Date.now() - 7200001).toISOString();

            try {
                let AQI;
                let PM25;

                await fetch("https://api.luchtmeetnet.nl/open_api/lki?station_number=NL49017&" + "start=" + yesterday + "&end=" + today, requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data){
                        AQI = data.data[0].value;
                    })

                await fetch("https://api.luchtmeetnet.nl/open_api/measurements?" + "start=" + yesterday + "&end=" + today +
                    "&station_number=NL49017&formula=PM25&page=1&order_by=timestamp_measured&order_direction=desc", requestOptions)
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
     * Gets the current LKI value of the "Stadhouderskade" from the luchtmeetnet API
     * @returns {Promise<void>} - responds the values in JSON-Format
     */
    async #getLKI() {
        this.#app.get("/lki", async (req,res) => {
            try {
                let requestOptions = {
                    method: 'GET',
                    redirect: 'follow'
                };

                let LKIdata;
                const fetch = require("node-fetch");

                await fetch("https://api.luchtmeetnet.nl/open_api/lki?station_number=NL49017&" +
                    "start=" + new Date(Date.now() - 7200001).toISOString() +
                    "&end=" + new Date(Date.now()).toISOString(), requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data){
                        LKIdata = data.data[0].value;
                    })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({LKI: LKIdata});

            } catch(e) {

            }
        })
    }

    async #getTemp() {
        this.#app.get("/fineDust", async (req, res) => {
            try {
                let requestOptions = {
                    method: 'GET',
                    redirect: 'follow',
                };

                let fineDustData;
                const fetch = require("node-fetch");

                await fetch("https://api.luchtmeetnet.nl/open_api/measurements?" +
                    "start=" + new Date(Date.now() - 7200000).toISOString() +
                    "&end=" + new Date(Date.now()).toISOString() +
                    "&station_number=NL49017&formula=PM25&page=1&order_by=timestamp_measured&order_direction=desc", requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        fineDustData = data.data[0].value
                    })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({fineDust: fineDustData});

            } catch (e) {
                console.log(e)
            }
        });
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
                "&station_number=NL49017&formula=PM25&page=1&order_by=timestamp_measured&order_direction=desc&", reqOptions)
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

    async #getGroenID() {
        this.#app.get("/map/ID", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT id FROM groen"
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    async #getXcoordinate() {
        this.#app.get("/map/Xcoordinate", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT coordinaatX FROM groen;",
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    async #getYcoordinate() {
        this.#app.get("/map/Ycoordinate", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT coordinaatY FROM groen;",
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    async #getGreenTypeID() {
        this.#app.get("/map/greenTypeID", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT type_id FROM groen"
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    async #getMapAreaID() {
        this.#app.get("/map/areaID", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT gebied_id FROM groen"
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    async #getGreenType() {
        this.#app.get("/map/greenType", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT id, naam FROM type;"
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    async #getArea() {
        this.#app.get("/map/area", async (req,res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT Gebiedsnummer, opmerking FROM gebied"
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }


}

module.exports = DashboardRoutes;