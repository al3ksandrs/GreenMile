//Context: register
describe("registration",  () => {
    const endpoint = "/register/register";

    //Run before each test in this context
    beforeEach(() => {
        //Set user as logged in
        const session = {"username": "test"}
        localStorage.setItem("session", JSON.stringify(session))

        //Go to the specified URL
        cy.visit("http://localhost:8080/#register");
    });

    //Test: Validate register form
    it("Valid registration form", () => {
        //Find the field for the email, check if it exists.
        cy.get("#emailRegister").should("exist");

        //Find the field for the password, check if it exists.
        cy.get("#passwordRegister").should("exist");

        //Find the field for the date, check if it exists.
        cy.get("#registerDate").should("exist");

        //Find the field for the rank, check if it exists.
        cy.get("#rank").should("exist");

        //Find the button to login, check if it exists.
        cy.get("#buttonRegister").should("exist");
    });

    //Test: Successful register
    it("Successful register",  () => {
        //Start a fake server
        cy.server();

        // const mockedResponse = {"email": "test"};
        //
        // //Add a stub with the URL /loginSite/createLogin as a POST
        // //Respond with a JSON-object when requested
        // //Give the stub the alias: @register
        // cy.intercept('POST', '/loginSite/createLogin', {
        //     statusCode: 200,
        //     body: mockedResponse,
        // }).as('login');

        //Find the field for the email and type the text "test".
        cy.get("#emailRegister").type("test@hva.nl");

        //Find the field for the password and type the text "test".
        cy.get("#passwordRegister").type("test");

        //Find the field for the date, check if it exists.
        cy.get("#registerDate").type("2023-06-02");

        //Find the field for the rank, check if it exists.
        cy.get("#rank").type("admin");

        //Find the button to register and click it
        console.log(cy.get("#buttonRegister"));
        cy.get("#buttonRegister").click();

        //After a successful login, the URL should now contain #register.
        cy.url().should("contain", "#register");
    });

    //Test: Failed register
    it("Failed register",  () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {
            reason: "ERROR"
        };

        //Add a stub with the URL /users/login as a POST
        //Respond with a JSON-object when requested and set the status-code tot 401.
        //Give the stub the alias: @login
        cy.intercept('POST', '/register', {
            statusCode: 401,
            body: mockedResponse,
        }).as('register');


        //Find the field for the email and type the text "test".
        cy.get("#emailRegister").type("test.hva.nl");

        //Find the field for the password and type the text "test".
        cy.get("#passwordRegister").type("test");

        //Find the field for the date, check if it exists.
        cy.get("#registerDate").type("2023-06-02");

        //Find the field for the rank, check if it exists.
        cy.get("#rank").type("admin");

        //Find the button to register and click it
        console.log(cy.get("#buttonRegister"));
        cy.get("#buttonRegister").click();


        //After a failed register, an element containinh our error-message should be shown.
        cy.get(".error")
            .should("exist")
            .should("contain", "Velden mogen niet leeg zijn! of email is incorrect!");
    });
});