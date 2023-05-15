/**
 * Cypress test to check if the compare buttons work
 * @author beerstj
 */
describe("dashboardCompare", () => {
    // Go To this link every time this script runs.
    beforeEach(() => {
        cy.visit("http://localhost:8080")
    })
    // Test: check if the button even exists
    it("Compare buttons exist", () => {
        cy.get("#compare-box").should("exist")
    })
})