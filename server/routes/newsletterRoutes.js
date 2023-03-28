class newsletterRoutes {
    #app
    #databaseHelper = require("../framework/utils/databaseHelper")
    #errorCodes = require("../framework/utils/httpErrorCodes")

    constructor(app) {
        this.#app = app;

        this.#signUp();
        this.#submitNewsletter()
        this.#sendNewsletter()
        this.#getAllUsers()
    }

    #signUp() {
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
        this.#app.post("/mailingList/send/email/:email/title/:title/content/:content", async (req,res) => {
            let data123;
            await fetch("https://api.hbo-ict.cloud/mail", {
                method: "post",
                headers: {
                    "Authorization": "Bearer pad_gmi_3.RMU3S1ZmAT8IZ7Bk",
                    "Content-Type":  "application/json"
                },
                body: JSON.stringify(
                    {
                        "from": {
                            "name": "Group",
                            "address": "The Green Mile"
                        },
                        "to": [
                            {
                                "name": "test",
                                "address": req.params.email
                            }
                        ],
                        "subject": req.params.title,
                        "html": req.params.content
                    }
                )
            }).then(function (response) {
                return response.json();
            }).then (function(data) {
                data123 = data;
            })

            res.status(this.#errorCodes.HTTP_OK_CODE).json({data: data123})
        })
    }

    #getAllUsers() {
        this.#app.get("/mailingList/emails", async (req,res) => {
            const users = await this.#databaseHelper.handleQuery( {
                query: "SELECT email FROM mailing_list"
            })

            res.status(this.#errorCodes.HTTP_OK_CODE).json(users)
        })
    }
}

module.exports = newsletterRoutes;