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

    //Test: Validate create user form
    it("Valid submitRoadmap form", () => {
        //Find the field for the content of the roadmap content, check if it exists.
        cy.get("change-roadmap-title").should("exist");

        //Find the field for the content of the roadmap item, check if it exists.
        cy.get("#change-roadmap-content").should("exist");

        //Find the field for the content of the roadmap content, check if it exists.
        cy.get("#btn-secondary").should("exist");

    });

    //Test: Successful changed roadmap item
    it("Successful submitted an item", () => {
        //Start a fake server
        cy.server();

        const mockedResponse = {"username": "test"};

        //Add a stub with the URL /users as a POST
        //Respond with a JSON-object when requested
        //Give the stub the alias: @roadmapItem
        cy.intercept('POST', endpoint, {
            statusCode: 200,
            body: mockedResponse,
        }).as('roadmapItem');

        //Find the field for the title and type the text "roadmap item title 1".
        cy.get("#change-roadmap-title").type("roadmap item title 1", {force: true});

        //Find the field for the content and type the text "roadmap item content 1".
        cy.get("#change-roadmap-content").type("roadmap item content 1", {force: true});

        //Find the button to change roadmap and submit
        console.log(cy.get("#change-roadmap-submit"));
        cy.get("#change-roadmap-submit").click();

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
});