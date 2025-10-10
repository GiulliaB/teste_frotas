describe("Login do usuário", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  
  it("Deve realizar login com sucesso com os tipos de usuários", () => {
    const users = [
      "usuario",
      "motorista",
      "mecanico",
      "chefe",
      "secretario",
      "admin",
    ];

    for (let user in users) {
      cy.login(users[user], "ABCDabcd1234");
      cy.location("pathname").should("eq", "/inicio");
      cy.getByData("side-bar-header-perfil").click();
      cy.get("a").contains("Sair").click();
    }
  });

  // Validação de campos obrigatórios no login e login incorreto
  it("Deve validar campos obrigatórios do login", () => {
    cy.login(" ", "ABCDabcd1234");
    cy.contains("Campo obrigatório").should("be.visible");
    cy.getByData("credencialLogin").clear();
    cy.getByData("senhaLogin").clear();

    cy.login("admin", "  ");
    cy.contains("Deve ter no mínimo 8 caracteres").should("be.visible");
  });

  // Listagem de usuários com verificação de paginação e consistência com a API
  it("Deve listar usuários com sucesso, confirmando paginação e dados comparando com a API", () => {
    cy.login("admin", "ABCDabcd1234");
    let authToken = null;
    cy.request({
      method: "POST",
      url: "https://frotas-api.app.fslab.dev/login",
      body: {
        credencial: "admin",
        senha: "ABCDabcd1234",
      },
    }).then((response) => {
      console.log(response);
      authToken = response.body.data.token;
      expect(authToken).is.not.null;
    });

    cy.request({
      method: "GET",
      url: "https://frotas.app.fslab.dev/usuarios",
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((response) => {
      console.log(`Response da API: ${JSON.stringify(response.body)}`);
      expect(response.status).to.eq(200);
    });

    cy.intercept("GET", "/usuarios*").as("getUsuarios");

    cy.get("li").contains("Usuários").click();
    cy.location("pathname").should("eq", "/usuarios");

    cy.wait("@getUsuarios", { timeout: 10000 }).then((intercept) => {
      expect(intercept.response.statusCode).to.eq(200);
      // expect(intercept.response.body.message).contains("Requisição bem sucedida.");

      const respostaIntercept = intercept.response.body;
      console.log(respostaIntercept);

      cy.request({
        method: "GET",
        url: "/usuarios?page=1&limit=10",
        headers: { Authorization: `Bearer ${authToken}` },
      }).should((response) => {
        console.log(response);
        expect(response.status).to.eq(200);

        const respostaRequest = response.body;
        console.log(respostaRequest);

        expect(respostaIntercept.total).to.eq(respostaRequest.total);
        expect(respostaIntercept.page).to.eq(respostaRequest.page);
      });
    });
  });

  it("Deve cadastrar um usuários com sucesso", () => {
    cy.login("admin", "ABCDabcd1234");
    cy.getByData("botao-page-usuarios").click();
    cy.location("pathname").should("eq", "/usuarios");
    cy.getByData("novoUsuarioButton").click();

    cy.location("pathname").should("eq", "/usuarios/cadastrar");

    cy.intercept("POST", "/usuarios/cadastrar").as("postUsuario");

    function gerarCPF() {
      const random = () => Math.floor(Math.random() * 9);
      const numeros = Array.from({ length: 9 }, random);

      const calcDV = (base) => {
        const soma = base
          .map((num, i) => num * (base.length + 1 - i))
          .reduce((a, b) => a + b, 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
      };

      const dv1 = calcDV(numeros);
      const dv2 = calcDV([...numeros, dv1]);

      const cpf = [...numeros, dv1, dv2].join("");

      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    const usuarioData = [
      { selector: "inputNomeUsuario", value: `João Teste da Silva` },
      {
        selector: "inputEmailUsuario",
        value: `teste.silva${Math.floor(Math.random() * 1000)}@example.com`,
      },
      {
        selector: "inputCpfUsuario",
        value: gerarCPF(),
      },
      { selector: "inputDataAdmissaoUsuario", value: `2023-10-01` },
      { selector: "inputDataNascimentoUsuario", value: `2005-10-01` },
      { selector: "inputTelefoneUsuario", value: `(69)992717761` },
      { selector: "inputEnderecoLogradouroUsuario", value: `Rua das Flores` },
      { selector: "inputEnderecoNumeroUsuario", value: `123` },
      { selector: "inputEnderecoCepUsuario", value: `01001-000` },
      { selector: "inputEnderecoBairroUsuario", value: `Testando` },
      { selector: "inputCredencialUsuario", value: `teste.silva${Math.floor(Math.random() * 1000)}` },
      { selector: "inputSenhaUsuario", value: `SenhaSegura123` },
      { selector: "inputConfirmarSenha", value: `SenhaSegura123` },
    ];

    usuarioData.forEach((campo) => {
      cy.getByData(campo.selector).type(campo.value);
    });

    cy.getByData("enderecoEstadoUsuario").click();
    cy.contains("div", "Rondônia")
      .scrollIntoView()
      .should("be.visible")
      .click();

    cy.getByData("enderecoCidadeUsuario").click();
    cy.contains("div", "Vilhena").scrollIntoView().should("be.visible").click();

    cy.getByData("button-cadastrar").click();

    cy.wait("@postUsuario").then((intercept) => {
      expect(intercept.response.statusCode).to.eq(200);
      expect(intercept.response.statusMessage).to.eq("OK");
      expect(intercept.response.url).to.eq("https://frotas.app.fslab.dev/usuarios/cadastrar");
      console.log("Resposta interceptada:", intercept);
    })
  });

  it("Deve atualizar um usuários com sucesso", () => {
    cy.login("admin", "ABCDabcd1234");
    cy.getByData("botao-page-usuarios").click();
    cy.location("pathname").should("eq", "/usuarios");
    cy.getByData("link-informacoes").first().click();

    cy.intercept("PATCH", "/usuarios/*").as("patchUsuario");

    cy.getByData("botaoEditarUsuario").click();

    const usuarioUpdateData = [
      { selector: "telefoneUsuario", value: `69992710000` },
      { selector: "enderecoLogradouroUsuario", value: `Rua dos macaris` },
      { selector: "enderecoNumeroUsuario", value: `0021` },
      { selector: "enderecoCepUsuario", value: `01001013` },
      { selector: "enderecoBairroUsuario", value: `Ronnie` }
    ];

    usuarioUpdateData.forEach((campo) => {
      cy.getByData(campo.selector).clear().type(campo.value);
    })

    cy.getByData("buttonEditar").click();

    cy.wait('@patchUsuario').then((intercept) => {
      console.log(intercept.request.body)
      expect(intercept.response.statusCode).to.eq(200);
      expect(intercept.request.body.telefone).to.eq(usuarioUpdateData[0].value);
      expect(intercept.request.body.endereco.logradouro).to.eq(usuarioUpdateData[1].value);
      expect(intercept.request.body.endereco.numero).to.eq(usuarioUpdateData[2].value);
      expect(intercept.request.body.endereco.cep).to.eq(usuarioUpdateData[3].value);
      expect(intercept.request.body.endereco.bairro).to.eq(usuarioUpdateData[4].value);
    })
  });
});