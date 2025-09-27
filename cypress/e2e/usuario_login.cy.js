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
    cy.getByData('senhaLogin').type('ABCDabcd1234');
    cy.getByData('button-cadastrar').click();
    cy.contains('Campo obrigatório').should('be.visible');
    cy.getByData('credencialLogin').clear();
    cy.getByData('senhaLogin').clear();

    cy.getByData('credencialLogin').type('usuario');
    cy.getByData('senhaLogin').type('  ');
    cy.getByData('button-cadastrar').click();
    cy.contains('Deve ter no mínimo 8 caracteres').should('be.visible');
  });
  it('Deve listar usuários com sucesso, confirmando paginação e dados comparando com a API', () => {
    cy.login('usuario', 'ABCDabcd1234');
    cy.getByData('botao-page-usuarios').click();
    cy.location('pathname').should('eq', '/usuarios');
    cy.getByData('tableUsuarios').find('tbody').first().contains('Administração Frotas Teste');
  });
});