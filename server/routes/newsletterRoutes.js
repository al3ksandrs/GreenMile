const {DATE, DATETIME} = require("mysql/lib/protocol/constants/types");

class newsletterRoutes {
    #app
    #databaseHelper = require("../framework/utils/databaseHelper")
    #errorCodes = require("../framework/utils/httpErrorCodes")

    constructor(app) {
        this.#app = app;

        this.#singUp();
        this.#submitNewsletter()
    }

    #singUp() {
        this.#app.get("/mailingList/signup/:email", async (req,res) => {
            try {
                const results = await this.#databaseHelper.handleQuery({
                    query: "INSERT INTO mailing_list (email) VALUES (?)",
                    values: [req.params.email]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json(results)
            } catch (e) {
                res.status(this.#errorCodes.BAD_REQUEST_CODE).json({reason:e})
            }
        })
    }

    #submitNewsletter() {
        this.#app.get("/mailinglist/submit/title/:title/content/:content", async (req,res) => {
            try {
                const timeElapsed = Date.now();
                const today = new Date(timeElapsed);
                const results = await this.#databaseHelper.handleQuery( {
                    query: "INSERT INTO newsletter (title,content, date) VALUES (?,?,?)",
                    values: [req.params.title, req.params.content, today.toISOString().substring(0,10)]
                })

                res.status(this.#errorCodes.HTTP_OK_CODE).json(results)
            } catch (e) {
                console.log(e)
            }
        })
    }

    #sendNewsletter() {
        this.#app.post("https://api.hbo-ict.cloud/mail", async (req,res) => {

        })
    }
}

module.exports = newsletterRoutes;