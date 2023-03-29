/**
 * This class contains ExpressJS routes specific for the users entity
 * this file is automatically loaded in app.js
 *
 * route file for admin
 */

class adminRoutes {
    #errorCodes = require("../framework/utils/httpErrorCodes");
    #databaseHelper = require("../framework/utils/databaseHelper");
    #app;

    constructor(app) {
        this.#app = app;
        this.#addGreenType();
        this.#refreshAreaList();
        this.#refreshTypeList();
        this.#addGreen();
        this.#removeGreenType();
        this.#addGreenGarden();
    }

    #addGreenGarden() {
        this.#app.post("/adminAddGreen", async(req, res) => {

            const boomtuin = req.body.boomtuin;

            try {
                let data = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO boomtuin(hoeveelheidBoomtuinen)values (?)",
                    values: [boomtuin]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }

        });
    }

    #addGreenType() {
        this.#app.post("/admin", async(req, res) => {

            const type = req.body.type;

            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "INSERT INTO type(naam) VALUES (?)",
                    values: [type]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }

        });
    }

    #removeGreenType(){
        this.#app.post("/removeGreenTypeRoute", async(req, res) => {

            const greenType = req.body.type;

            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "DELETE FROM type WHERE id = ?",
                    values: [greenType]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }

        });
    }

    #addGreen() {
        this.#app.post("/adminAddGreen", async(req, res) => {

            const coordinaatX = req.body.coordinaatX;
            const coordinaatY = req.body.coordinaatY;
            const gebied_id = req.body.gebied_id;
            const type_id = req.body.type_id;

            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "INSERT INTO groen(coordinaatX, coordinaatY, gebied_id, type_id) VALUES (?,?,?,?)",
                    values: [coordinaatX, coordinaatY, gebied_id, type_id]
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json(data);

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }

        });
    }




    #refreshAreaList(){
        this.#app.get("/areaList", async(req, res) => {

            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "SELECT Gebiedsnummer, opmerking FROM gebied",
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

    #refreshTypeList(){
        this.#app.get("/typeList", async(req, res) => {

            try {
                let data = await this.#databaseHelper.handleQuery( {
                    query: "SELECT id, naam FROM type",
                });

                res.status(this.#errorCodes.HTTP_OK_CODE).json({data:data});

            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason: e});
            }
        });
    }

}

module.exports = adminRoutes