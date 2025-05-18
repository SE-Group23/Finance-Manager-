// @ts-nocheck

describe('Transaction Test Cases 01, 02, 03, 04', () => {

  beforeEach(() => {
    cy.login(); 
  });

  it('T01 - Add transaction with valid data', () => {
    cy.visit('/transactions');
    cy.contains('Record Transaction').click();
    cy.get('input[placeholder="Enter title"]').type('Test Purchase');
    cy.get('input[placeholder="0.00"]').type('500');
    cy.get('input[type="date"]').type('2025-05-01');
    cy.contains('Food and Drink').click();
    cy.contains('Save').click();
    cy.contains('Test Purchase').should('exist');
  });

  it('T02 - Add transaction with missing fields', () => {
    cy.visit('/transactions');
    cy.contains('Record Transaction').click();

    cy.get('form').submit();

    cy.get('input[placeholder="Enter title"]').then(($input) => {
      expect($input[0].validationMessage).to.not.be.empty;
    });

    cy.get('input[placeholder="0.00"]').then(($input) => {
      expect($input[0].validationMessage).to.not.be.empty;
    });

    cy.get('input[placeholder="Enter title"]').type('Indrive');
    cy.get('input[placeholder="0.00"]').type('500');
    cy.contains('Transport').click();
    cy.get('form').submit();

    cy.contains('Indrive').should('exist');
    cy.contains('PKR 500').should('exist');
  });

  it('T03 - Edit Existing Transaction', () => {
    cy.visit('/transactions');

    cy.get('div.border-b.border-gray-100')
      .first()
      .within(() => {
        cy.get('button').first().click(); 
      });

    cy.get('input[placeholder="0.00"]').clear().type('999');

    cy.get('form').submit();

    cy.contains('PKR 999').should('exist');
  });

  it('T04 - Delete transaction', () => {
    cy.visit('/transactions');

    cy.get('div.border-b.border-gray-100')
      .then(($itemsBefore) => {
        const initialCount = $itemsBefore.length;

        cy.get('div.border-b.border-gray-100')
          .first()
          .within(() => {
            cy.get('button').eq(1).click(); 
          });

        cy.get('div.border-b.border-gray-100').should('have.length.lessThan', initialCount);
      });
  });

});
