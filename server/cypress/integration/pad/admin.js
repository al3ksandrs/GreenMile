//Context: test admin page
describe("admin", () => {
    const endpoint = "/admin";

    //Run before each test in this context
    beforeEach(() => {
        //Set user as logged in
        const session = {"username": "test"}
        localStorage.setItem("session", JSON.stringify(session))

        //Go to the specified URL
        cy.visit("http://localhost:8080/#admin");
    });

    //Test: Validate forms and buttons
    it("Validate admin forms and buttons", () => {
        //check if typelist field exists
        cy.get("#typeList").should("exist");

        //check if greenAreaList field exists
        cy.get("#greenAreaList").should("exist");

        //check if coordinateX field exists
        cy.get("#coordinateX").should("exist");

        //check if coordinateY field exists
        cy.get("#coordinateY").should("exist");

        //check if submitGreenInputForm field exists
        cy.get("#submitGreenInputForm").should("exist");

        //check if greenTypeName field exists
        cy.get("#greenTypeName").should("exist");

        //check if submitAddGreenTypeForm field exists
        cy.get("#submitAddGreenTypeForm").should("exist");

        // //check if removeTypeList field exists
        // cy.get("#removeTypeList").should("exist");
        //
        // //check if submitRemoveGreenTypeForm field exists
        // cy.get("#submitRemoveGreenTypeForm").should("exist");
        //
        // //check if removeGreenObjectList field exists
        // cy.get("#removeGreenObjectList").should("exist");
        //
        // //check if submitremoveGreenObjectForm field exists
        // cy.get("#submitremoveGreenObjectForm").should("exist");
    });

    //Test: Successful submitted a green object
    it("Successful submitted a green object", () => {
        //Start a fake server
        cy.server();

        // find typelist and select the option Boomtuin
        cy.get("#typeList").select('Boomtuin');

        // find typelist and select the option Stadhouderskade 1-40
        cy.get("#greenAreaList").select('Stadhouderskade 1-40');

        //Find the field for the x coordinate and type the text "53.333".
        cy.get("#coordinateX").type("53.333", {force: true});

        //Find the field for the y coordinate and type the text "4.444".
        cy.get("#coordinateY").type("4.444", {force: true});

        //Find the button to create a user and click it
        console.log(cy.get("#submitGreenInputForm"));
        cy.get("#submitGreenInputForm").click();
    });

    //Test: Failed to add green object
    it("Failed to add green object", () => {
        //Start a fake server
        cy.server();

        // find typelist and select nothing
        cy.get("#typeList").select('');

        // find typelist and select nothing
        cy.get("#greenAreaList").select('');

        //find the field for the x coordinate and type nothing.
        cy.get("#coordinateX").clear();

        //find the field for the y coordinate and type nothing.
        cy.get("#coordinateY").clear();

        // find the button and click it
        console.log(cy.get("#submitGreenInputForm"));
        cy.get("#submitGreenInputForm").click();

        // if the alert pop ups we know empty data didnt work
        cy.on("window:alert", (message) => {
            expect(message).to.equal("Velden kunnen niet leeg zijn! Vul alstublieft een waarde in.");
        });
    });

    //Test: Successful submitted a green type
    it("Successful submitted a green type", () => {
        //Start a fake server
        cy.server();

        // find greenTypeName and type "grote struik"
        cy.get("#greenTypeName").type("grote struik", {force: true});

        //Find the button to add type and click it
        console.log(cy.get("#submitAddGreenTypeForm"));
        cy.get("#submitAddGreenTypeForm").click();
    });

    //Test: Failed to submit a new type
    it("Failed to submit a new type", () => {
        //Start a fake server
        cy.server();

        // find greenTypeName and type nothing
        cy.get("#greenTypeName").clear();

        //Find the button to add type and click it
        console.log(cy.get("#submitAddGreenTypeForm"));
        cy.get("#submitAddGreenTypeForm").click();

        // if the alert pop ups we know empty data didnt work
        cy.on("window:alert", (message) => {
            expect(message).to.equal("Type veld kan niet leeg zijn! Vul alstublieft een waarde in.");
        });
    });
});