// @ts-nocheck

describe('Zakat Test Case - TC16', () => {
  beforeEach(() => {
    cy.login();
  });
  
  
  it('TC16 - Displays zakat section with dynamic asset values and payable amount', () => {
    cy.visit('/zakat-tax');
    cy.contains('Zakat Payable', { timeout: 10000 }).should('exist');

    cy.contains('Below Nisaab Threshold').should('exist');
    cy.contains('based on Current assets').should('exist');

    cy.contains('Current Net Worth')
      .next()
      .invoke('text')
      .should('include', 'PKR');

    cy.contains('Gold')
      .next()
      .invoke('text')
      .should('include', 'PKR');

    cy.contains('Currency')
      .next()
      .invoke('text')
      .should('include', 'PKR');

    cy.contains('Stocks')
      .next()
      .invoke('text')
      .should('include', 'PKR');

    cy.contains('Zakat Payable')
      .parent()
      .invoke('text')
      .should('include', 'PKR');
  });
});



