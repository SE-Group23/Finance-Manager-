// @ts-nocheck

describe('Dashboard Test Case 09', () => {

    it('T09 - Test Dashboard Access without Login', () => {
      cy.clearCookies();
      cy.clearLocalStorage();
    
      cy.visit('/dashboard');
    
      cy.url().should('eq', 'https://finance-manager-xi-taupe.vercel.app/login');
    
    });
    
});

