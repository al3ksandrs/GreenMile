/**
 * Class that contains all of the routes for the dashboard
 * @authors
 *  - beerstj
 */
const fetch = require("node-fetch");
class DashboardRoutes {
    #app
    #errorCodes = require("../framework/utils/httpErrorCodes");
    #databaseHelper = require("../framework/utils/databaseHelper");
    #requestOptions
    #greenType;
    #avgArray

    constructor(app) {
        this.#app = app;

        this.#getFacadeAndTreeGardenData()

        this.#getDashboardDatabaseValues();
        this.#getDashboardAPIValues();

        this.#getInfomation()

        this.#getGreeneryM2Data();

        this.#writePM25ToDatabase()
        this.#requestPM25FromDatabase()

        // map routes
        this.#getGroen();

        // sets the requestOptions to be the same all the time, and we can use in the whole class.
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
        this.#app.get("/dashboard/database", async (req, res) => {
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
        this.#app.get("/dashboard/API/Luchtmeetnet", async (req, res) => {
            let today = new Date(Date.now()).toISOString();
            let yesterday = new Date(Date.now() - 72000001).toISOString();

            try {
                let AQI;
                let PM25;

                await fetch("https://api.luchtmeetnet.nl/open_api/lki?station_number=NL49017&" +
                    "start=" + yesterday + "&end=" + today, this.#requestOptions)
                    .then(function (response) {
                        return response.json();
                    }).then(function (data) {
                        AQI = data.data[0].value;
                    })

                await fetch("https://api.luchtmeetnet.nl/open_api/measurements?" +
                    "start=" + yesterday + "&end=" + today +
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
     * Gets the PM25 data from the database, for the selected timespan. Used on the dashbaoard
     * @returns {Promise<void>}
     * Responds an object containing every item we use in the chart
     *      label: title of the chart
     *      data: data in the chart
     *      labels: labels under the chart
     *      color: color of the line (only used when comparing)
     */
    async #requestPM25FromDatabase() {
        this.#app.post("/dashboard/database/PM25/timespan", async (req, res) => {
            let timespan = req.body.timespan;
            let text = ""

            // Switch to get the selected timespan and put it in a string format
            switch(timespan) {
                case "days":
                    text = "30 dagen"
                    break
                case "weeks":
                    text = "15 weken"
                    break
                case "months":
                    text = (new Date().getMonth() + 1) + " maanden tot aan het van dit jaar"
            }

            let array = []
            // Gets the values from the database with the selected timespan
            let values = this.#databaseHelper.handleQuery({
                query: "SELECT value FROM PM25 WHERE timespan = ?",
                values: [timespan]
            })

            values.then(result => {
                // Create an array with the values (because values is promise
                for (let i = 0; i < result.length; i++) {
                    array.push(result[i].value)
                }

                // Responds to the request, with the labels, label, data and color.
                res.status(this.#errorCodes.HTTP_OK_CODE).json({
                    label: "Fijnstof (PM25) gemiddelde van de afgelopen " + text,
                    data: array,
                    labels: this.#getLabels(timespan),
                    color: "#FFD100"
                })
            })
        })
    }

    /**
     * Method to write data from PM25 data to the database, for selected timespan.
     * @param timespan: timespan you want the data for.
     * @returns {Promise<void>} state of request
     */
    async #writePM25ToDatabase() {
        this.#app.post("/dashboard/API/write/timespan", async (req, res) => {
            // Create two dates so we don't have to do it with each timespan.
            let date1 = new Date(Date.now())
            let date2 = new Date();

            // First, all  the data of the selected timespan is deleted so we can write new values to the database
            let deleteData = this.#databaseHelper.handleQuery({
                query: "DELETE FROM PM25 WHERE timespan = ?",
                values: [req.body.timespan]
            })

            this.#avgArray = []
            switch (req.body.timespan) {
                case "days":
                    // Loops through the last 31 days, calculates the average of every day and adds all of these to the array
                    // (this.#avgArray
                    for (let i = 0; i < 31; i++) { // Loops through everyday of the timespan selected
                        date2.setDate(date1.getDate() - 1)
                        await this.#calculateAverageFromFetch(i, date1, date2) // This function adds the value of this day to this.#avgArray
                        date1.setDate(date1.getDate() - 1)
                    }

                    // For every item in this.#avgArray, insert them into database
                    for (let i = 0; i < this.#avgArray.length; i++) {
                        let insertData = this.#databaseHelper.handleQuery({
                            query: "INSERT INTO PM25 (value, timespan, number) VALUES (?,?,?)",
                            values: [this.#avgArray[i], req.body.timespan, i]
                        })
                    }

                    res.status(this.#errorCodes.HTTP_OK_CODE).json({
                        success: "Yes"
                    })
                    break;

                case "weeks":
                    for (let i = 0; i < 16; i++) {
                        date2.setDate(date1.getDate() - 7)
                        await this.#calculateAverageFromFetch(i, date1, date2)
                        date1.setDate(date2.getDate())
                    }

                    // Loops through the entire array and inserts all of the values to the databsae
                    for (let i = 0; i < this.#avgArray.length; i++) {
                        let insertData = this.#databaseHelper.handleQuery({
                            query: "INSERT INTO PM25 (value, timespan, number) VALUES (?,?,?)",
                            values: [this.#avgArray[i], req.body.timespan, i]
                        })
                    }

                    res.status(this.#errorCodes.HTTP_OK_CODE).json({status: "succes"})
                    break;

                case "months":
                    // if the users want to select the months. We only have to calulate the data from the start of the month
                    // to the current day of the month, because we have the other hard coded
                    let hardcode = [7.97, 13.74, 7.75, 9.78, 9.92] // Hardcode because the request would take like 7 years
                    let total = 0;

                    let weeks = Math.floor(date1.getDate() / 7) // gets the amount of whole weeks to start of month

                    // creates two date objects to make it easier to loop through the current week.
                    let startOfMonth = new Date(date1.getFullYear(), date1.getMonth(), 1)
                    let weekAfterStartOfMonth = new Date()

                    // Loops through the whole weeks until the start of the year. then calculates the average from
                    // every one of these weeks.
                    for (let i = 0; i < weeks; i++) {
                        weekAfterStartOfMonth.setDate(startOfMonth.getDate() + 7)
                        await this.#calculateAverageFromFetch(i, weekAfterStartOfMonth, startOfMonth)
                        startOfMonth.setDate(weekAfterStartOfMonth.getDate())
                    }

                    // Gets the leftover dates
                    await this.#calculateAverageFromFetch(new Date(Date.now()).getMonth(), weekAfterStartOfMonth, startOfMonth)

                    // calculates the total of everyday to the start of this month
                    for (let i = 0; i < this.#avgArray.length; i++) {
                        total += this.#avgArray[i]
                    }

                    // Pushes the calulated total divided by the length of the array (so we get the average value)
                    hardcode.push(total / this.#avgArray.length)

                    // Inserts al of the data of the array
                    for (let i = 0; i < hardcode.length; i++) {
                        let insertData = this.#databaseHelper.handleQuery({
                            query: "INSERT INTO PM25 (value, timespan, number) VALUES (?,?,?)",
                            values: [hardcode[i], req.body.timespan, i]
                        })
                    }

                    res.status(this.#errorCodes.HTTP_OK_CODE).json({status: "succes",})
            }
        })
    }

    /**
     * Calculates the average values between de given dates, from the data collected through the luchtmeetnet API
     * @param i - progress (current iteration)
     * @param date1 - end of date to get the data
     * @param date2 - start of date to get the data
     * @returns {Promise<void>}
     */
    async #calculateAverageFromFetch(i, date1, date2) {
        // Fetches all of the data from the luchtmeetnet that is between the two date arguments
        await fetch("https://api.luchtmeetnet.nl/open_api/measurements?" +
            "start=" + date2.toISOString() + "&end=" + date1.toISOString() +
            "&station_number=NL49017&formula=PM25&page=1&order_by=timestamp_measured&order_direction=desc", this.#requestOptions)
            .then(function (response) {
                return response.json(); // makes sure the response is in json
            })
            .then(function (data) {
                if (typeof data !== 'undefined') { // If no data exists for curDay, push 0 to array
                    let total = 0
                    // Loops through all of the hours in the data array
                    for (let curHour = 0; curHour < data.data.length; curHour++) { // loops through every hour of the day
                        if (typeof data.data[i] !== 'undefined') {
                            total += data.data[i].value // Adds the current value to the 'total' variable so get the data.
                        } // Checks if curHour is undefined.
                    }
                    // console.log("Progress: " + i + " Current Average: "+ total / data.data.length) // Use this if this breaks (it will)
                    if (total === 0) { // Checks if the total = 0 (Means no data to calculate average) pushes 'null' if its zero
                        this.#avgArray.push(null)
                    } else this.#avgArray.push(total / data.data.length) // pushes the average of the caluclated total the array
                } else return null
            }.bind(this))
    }

    /**
     * Function to get all of the data for the facade and treegardens added in the selected timespan
     * @param type_id: type you want to get the data for (type_id is column in our database):
     *  - type_id: 1 = treeGarden (Dashboard -> Boomtuinen)
     *  - type_id: 2 = facadeGarden (Dashboard -> Geveltuinen
     *  @param timespan: timespan of the data you want
     * @returns {Promise<void>} -
     * Responds an object containing every item we use in the chart
     *      label: title of the chart
     *      data: data in the chart
     *      labels: labels under the chart
     *      color: color of the line (only used when comparing)
     */
    async #getFacadeAndTreeGardenData() {
        this.#app.post("/dashboard/timespan/type", async (req, res) => {
            let color;
            // Switch to change the greentype, used in the labels
            switch (req.body.type_id) {
                case 1: // String because req.params.type_id is a string
                    this.#greenType = "Boomtuinen"
                    color = "#de4ab9"
                    break;
                case 2:
                    this.#greenType = "Geveltuinen"
                    color = "#058C42"
                    break;
                default:
                    break;
            }

            // creates some variables so it will be easier to correctly get the data from the database
            let totalArray = []
            let totalNumber = 0;
            let today = new Date(Date.now())
            let weekNumber = Math.ceil((Math.floor((new Date() - (new Date((new Date()).getFullYear(), 0, 1))) / 86400000)) / 7);

            // Switch to swich between de requested timespn
            switch (req.body.timespan) {
                // If req.params.timespan === "days" the totals of the last 31 days are queried to the databse
                case "days":
                    try {
                        // Loop through the last 30 days, "i" is used in the SQL-Keyword DATE(DATE) to get the correct data
                        for (let i = 0; i < 31; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(datum) as dayTotal FROM Groen WHERE DAY(datum) = ? AND type_id = ? AND MONTH(DATUM) = ?;",
                                values: [i, req.body.type_id, today.getMonth()]
                            })

                            totalNumber += data[0].dayTotal
                            totalArray.push(totalNumber)
                        }
                        // Formats the data, label and labels used in the chart to display the correct data. Uses JSON to respond to the request
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({
                            label: "Totalen van gemaakte " + this.#greenType + " de de afgelopen 30 dagen",
                            data: totalArray,
                            labels: this.#getLabels(req.body.timespan),
                            color: color
                        })
                    } catch (e) {
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
                    }
                    break;
                // If req.params.timespan === "weeks" the totals of the last 15 weeks are queried to the database
                case "weeks":
                    try {
                        // Loop through the last 15 weeks, "i" is used in the SQL-Keyword WEEK(DATE) to get the correct data
                        for (let i = weekNumber - 15; i < weekNumber + 1; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(datum) AS weekTotal FROM Groen WHERE WEEK(datum) = ? AND type_id = ?",
                                values: [i, req.body.type_id]
                            })

                            totalNumber += data[0].weekTotal
                            totalArray.push(totalNumber)
                        }
                        // Formats the data, label and labels used in the chart to display the correct data. Uses JSON to respond to the request
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({
                            label: "Totalen van gemaakte " + this.#greenType + " de de afgelopen 15 weken",
                            data: totalArray,
                            labels: this.#getLabels(req.body.timespan),
                            color: color

                        })
                    } catch (e) {
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
                    }
                    break;
                // If req.params.timespan === "months" the totals of the last past months to the start of the year
                case "months":
                    try {
                        // Loop through the past months to the start of the year, "i" is used in the SQL-Keyword MONTH(DATE) to get the correct data
                        for (let i = 1; i < today.getMonth() + 2; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(datum) AS monthTotal FROM Groen WHERE MONTH(datum) = ? AND type_id = ?",
                                values: [i, req.body.type_id]
                            })
                            totalNumber += data[0].monthTotal
                            totalArray.push(totalNumber)
                        }
                        // Formats the data, label and labels used in the chart to display the correct data. Uses JSON to respond to the request
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({
                            label: "Totalen van gemaakte " + this.#greenType + " aan het begin van elke maand sinds het begin van het jaar",
                            data: totalArray,
                            labels: this.#getLabels(req.body.timespan),
                            color: color
                        })
                    } catch (e) {
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
                    }
                    break;
            }
        })
    }

    /**
     * Function to retrieve all of the added greenery data in selected timespan.
     * @param timespan: timespan you want for the data
     * Responds an object containing every item we use in the chart
     *      label: title of the chart
     *      data: data in the chart
     *      labels: labels under the chart
     *      color: color of the line (only used when comparing)
     */
    #getGreeneryM2Data() {
        this.#app.post("/dashboard/greenery/timespan", async (req, res) => {
            // Creas some variabels to make it easier to get the data from our database
            let totalNumber = 0;
            let totalArray = [];
            let today = new Date(Date.now())
            let weekNumber = Math.ceil((Math.floor((new Date() - (new Date((new Date()).getFullYear(), 0, 1))) / 86400000)) / 7);
            const timespan = req.body.timespan

            // Switch to switch between the requested timespan
            switch (timespan) {
                // Gets data for past 30 days by looking through all of them
                case "days":
                    try {
                        // for the last 31 days, loop through the dates
                        for (let i = 0; i < 31; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(groenem2) AS GroeneM2 FROM GroeneM2 WHERE DAY(datum) = ? AND MONTH(datum) = ?",
                                values: [i, today.getMonth()]
                            })
                            totalNumber += data[0].GroeneM2 // add the data to an array
                            totalArray.push(totalNumber) // push this number to array
                        }
                        // Responds to the request in json format
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({
                            label: "Totalen van geplante Groene M2 de de afgelopen 30 dagen",
                            data: totalArray,
                            labels: this.#getLabels(timespan),
                            color: "#4ADEDE"
                        })

                    } catch (e) {
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
                    }
                    break;
                // Gets data for past 15 weeks by looking through all of them
                case "weeks":
                    try {
                        // For last 15 weeks, use sql WEEK(DATE) commant to get the data of this week
                        for (let i = weekNumber - 16; i < weekNumber; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT SUM(groeneM2) AS weekTotal FROM GroeneM2 WHERE WEEK(datum) = ?",
                                values: [i]
                            })

                            totalNumber += data[0].weekTotal
                            totalArray.push(totalNumber)
                        }
                        // responds the data in JSON format
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({
                            label: "Totalen van geplante Groene M2 de de afgelopen 15 weken",
                            data: totalArray,
                            labels: this.#getLabels(timespan),
                            color: "#4ADEDE"
                        })
                    } catch (e) {
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
                    }
                    break;
                // Gets data for past months by looking through all of them
                case "months":
                    try {
                        // Loops through every month from today to the start of the year. calulates the new total
                        // and pushes this to the database.
                        for (let i = 0; i < today.getMonth() + 1; i++) {
                            let data = await this.#databaseHelper.handleQuery({
                                query: "SELECT COUNT(groenem2) AS GroeneM2 FROM GroeneM2 WHERE MONTH(datum) = ?",
                                values: [i]
                            })
                            totalNumber += data[0].GroeneM2
                            totalArray.push(totalNumber)
                        }
                        // Respods in json format the data used for the chart.
                        res.status(this.#errorCodes.HTTP_OK_CODE).json({
                            label: "Totalen van geplante Groene M2 aan het begin van elke maand sinds het begin van het jaar",
                            data: totalArray,
                            labels: this.#getLabels(timespan),
                            color: "#4ADEDE"
                        })
                    } catch (e) {
                        res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
                    }
                    break;
            }
        })
    }

    // map routes @author Aleksandrs
    async #getGroen() {
        this.#app.get("/map/getGroen", async (req, res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT result.id, result.opmerking, result.datum, result.coordinaatX, result.coordinaatY, type.naam FROM (SELECT * FROM gebied inner join groen ON gebied.Gebiedsnummer = groen.gebied_id) as result INNER JOIN type ON result.type_id = type.id"
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data: data});
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
        this.#app.post("/dashboard/information", async (req, res) => {
            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "SELECT * FROM informationModal WHERE id = ?",
                    values: [req.body.id]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data: data})
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e})
            }
        })
    }

    /**
     * Helper function to get all of the correct labels for the charts
     * @param timespan - timespan in where you want the labels (options: "days", "weeks", "months")
     * @returns {*[]}
     */
    #getLabels(timespan) {
        const months = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
        let weekNumber = Math.ceil((Math.floor((new Date() - (new Date((new Date()).getFullYear(), 0, 1))) / 86400000)) / 7); //Number of currentWeek
        let labelArray = [];

        // Switch to get the requested timespan
        switch (timespan) {
            // Gets past 31 days in format dayNumber + "curMonth"
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
            // Gets past 15 weeks in format: "Week" + weekNumber
            case "weeks":
                for (let i = weekNumber - 15; i < weekNumber + 1; i++) {
                    labelArray.push("Week " + i)
                }
                break;
            // Gets month from start of year to now. In string format
            case "months":
                for (let i = 0; i < new Date(Date.now()).getMonth() + 1; i++) {
                    labelArray.push(months[i])
                }
                break;
        }

        return labelArray;
    }
}

module.exports = DashboardRoutes;