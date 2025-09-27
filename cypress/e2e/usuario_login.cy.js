/// <reference types="cypress" />

describe('Usuário login e listar', () => {

  beforeEach(()=> {
        cy.visit('/');
    })

  it('Deve realizar login com sucesso com os tipos de usuários', () => {
    const usuarios = ['usuario', 'motorista', 'mecanico', 'chefe', 'secretario', 'admin']
    for (let usuario in usuarios) {
      cy.getByData('credencialLogin').type(usuarios[usuario]);
      cy.getByData('senhaLogin').type('ABCDabcd1234');
      cy.getByData('button-cadastrar').click();
      cy.location('pathname').should('eq', '/inicio')
      cy.getByData('side-bar-header-perfil').click();
      cy.get('a').contains('Sair').click();
    }
  });
  it('Deve validar campos obrigatórios do login', () => {
    cy.getByData('credencialLogin').type('  ');
    cy.getBydata('senhaLogin').type('ABCDabcd1234');
    cy.getByData('toggle-password').click();
  });
  it('Deve listar usuários com sucesso, confirmando paginação e dados comparando com a API', () => {
    // Implementação
  });
});