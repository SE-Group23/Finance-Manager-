// @ts-nocheck

describe('Budget Test Cases - TC05, TC10 and TC14', () => {
  beforeEach(() => {
    cy.login();
    
  });

  it('TC05 - View budget summary with correct values and structure', () => {
   
    cy.visit('/budget');
    cy.contains('Budget Manager', { timeout: 10000 }).should('exist');
    cy.contains('This Month').should('be.visible');
    cy.contains('Remaining').should('be.visible');
    cy.contains('Total').should('be.visible');
    cy.contains('Spent').should('be.visible');
    cy.contains('PKR').should('exist');
  
    const categories = ['Food and Drink', 'Shopping', 'Transport', 'Health and Fitness'];
    categories.forEach((cat) => {
      cy.contains(cat).should('exist');
    });
  
    cy.contains('Monthly Budget by Category').should('exist');
    const columns = ['Name', 'Used', '% Used', 'Remaining', 'Alerts'];
    columns.forEach((col) => {
      cy.get('table').contains(col).should('exist');
    });
  
    cy.get('table tbody tr').should('have.length.at.least', 4);
  });
  

  it('TC10 - Add and edit budget category without duplicates', () => {
    cy.visit('/budget');
    cy.contains('Add Category').click();
    cy.contains('Health and Fitness').click();
    cy.get('input[placeholder="e.g., 200"]').type('400');
    cy.contains('Save Category').click();
    cy.contains('Health and Fitness').should('exist');
    cy.contains('PKR 400').should('exist');
    cy.contains('Add Category').click();
    cy.contains('Health and Fitness').click();
    cy.get('input[placeholder="e.g., 200"]').clear().type('300');
    cy.contains('Save Category').click();
    cy.get('table').contains('td', 'Health and Fitness').parent().should('contain', 'PKR 300');
  });

  it('TC14 - Prevent invalid budget inputs (negative and non-numeric)', () => {
    cy.visit('/budget');
    cy.contains('Add Category').click();
    cy.contains('Bills and Utilities').click();
    cy.get('input[placeholder="e.g., 200"]').type('-50');
    cy.contains('Save Category').click();
    cy.contains('Add New Budget Category').should('exist');
    cy.get('table').should('not.contain', 'Bills and Utilities');
    cy.get('input[placeholder="e.g., 200"]').clear().type('abcdef');
    cy.contains('Save Category').click();
    cy.contains('Add New Budget Category').should('exist');  
    cy.get('table').should('not.contain', 'Bills and Utilities');
  });
});
