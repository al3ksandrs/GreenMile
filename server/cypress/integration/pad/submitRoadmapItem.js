//Context: submit an item to show on our roadmap
describe("submitRoadmapItem", () => {
    const endpoint = "/roadmap/submit";

    //Run before each test in this context
    beforeEach(() => {
        //Set user as logged in
        const session = {"username": "test"}
        localStorage.setItem("session", JSON.stringify(session))

        //Go to the specified URL
        cy.visit("http://localhost:8080/#submitRoadmap");
    });

    //Test: validate the existence of submit form
    it("Valid submitRoadmap form", () => {
        //Find the field for the content of the roadmap content, check if it exists.
        cy.get("#roadmap-title").should("exist");

        //Find the field for the content of the roadmap item, check if it exists.
        cy.get("#roadmap-content").should("exist");
    });

    //Test: Successfully submitted a roadmap item
    it("Successful submitted an item", () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {"username": "test"};

        //Add a stub with the URL /roadmap/submit as a POST
        //Respond with a JSON-object when requested
        //Give the stub the alias: @roadmapItem
        cy.intercept('POST', endpoint, {
            statusCode: 200,
            body: mockedResponse,
        }).as('roadmapItem');

        //Find the field for the title and type the text "roadmap item title 1".
        cy.get("#roadmap-title").type("roadmap item title 1", {force: true});

        //Find the field for the content and type the text "roadmap item content 1".
        cy.get("#roadmap-content").type("roadmap item content 1", {force: true});

        //Find the button to create a user and click it
        cy.get("#roadmap-submit").click();

        //Wait for the @roadmapItem to be called by the click-event.
        cy.wait("@roadmapItem");

        //The @roadmapItem is called, check the contents of the incoming request.
        cy.get("@roadmapItem").should((xhr) => {
            const body = xhr.request.body;

            //The username should match what we typed earlier
            expect(body.title).equals("roadmap item title 1");

            //The firstname should match what we typed earlier
            expect(body.content).equals("roadmap item content 1");
        });

    });

    //Test: Failed to submit an item
    it("Failed submit roadmap item", () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {
            reason: "ERROR"
        };

        //Add a stub with the URL /roadmap/submit as a POST
        //Respond with a JSON-object when requested and set the status-code tot 401.
        //Give the stub the alias: @roadmapItem
        cy.intercept('POST', endpoint, {
            statusCode: 401,
            body: mockedResponse,
        }).as('roadmapItem');
        
        //Find the field for the username and type the text "te kort".
        cy.get("#roadmap-title").type("te kort", {force: true});

        //Find the field for the firstname and type the text "ook te kort".
        cy.get("#roadmap-content").type("ook te kort", {force: true});

        //Find the button to create a user and click it
        console.log(cy.get("#roadmap-submit"));
        cy.get("#roadmap-submit").click();

        //After a submit attempt, an element containing the error-message should be shown.
        cy.get("#submit-failure").should("exist").should("contain", "minimaal 10 karakters bevatten!");
    });
});