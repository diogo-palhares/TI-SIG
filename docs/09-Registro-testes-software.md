# Registro de testes de software

<span style="color:red">Pré-requisitos: <a href="05-Projeto-interface.md"> Projeto de interface</a></span>, <a href="08-Plano-testes-software.md"> Plano de testes de software</a>

Relatório com as evidências dos testes de software realizados no sistema pela equipe, baseado em um plano de testes pré-definido.

Para cada caso de teste definido no <a href="08-Plano-testes-software.md"> Plano de testes de software</a>, realize o registro das evidências dos testes feitos na aplicação pela equipe, que comprovem que o critério de êxito foi alcançado (ou não!). Para isso, utilize uma ferramenta de captura de tela que mostre cada um dos casos de teste definidos. Observação: cada caso de teste deverá possuir um vídeo do tipo _screencast_ para caracterizar uma evidência do referido caso.

| **Caso de teste** 	| **CT-001 – Cadastrar perfil** 	|
|:---:	|:---:	|
| Requisito associado | RF-00X - A aplicação deve apresentar, na página principal, a funcionalidade de cadastro de usuários para que esses consigam criar e gerenciar seu perfil. |
| Registro de evidência | [www.teste.com.br/drive/ct-01](http://www.teste.com.br/drive/ct-01) |

| **Caso de teste** 	| **CT-002 – Realizar login** 	|
|:---:	|:---:	|
| Requisito associado | RF-00Y - A aplicação deve permitir que um usuário previamente cadastrado faça login. |
| Registro de evidência | [www.teste.com.br/drive/ct-02](http://www.teste.com.br/drive/ct-02) |


> **Links úteis**:
> - [Screencast: entenda o que é e como gravar vídeos com ele](https://rockcontent.com/br/blog/screencast/) 

## Testes automatizados (versão inicial do APP)

Além dos casos de teste manuais descritos acima, a versão inicial do APP conta com uma suíte de testes automatizados no backend, executada com o comando `./mvnw test` na pasta `src/back`. Foram implementados **84 testes** (utilizando JUnit 5 e Mockito), todos aprovados (`BUILD SUCCESS`, com 0 falhas e 0 erros), distribuídos da seguinte forma:

| Conjunto de testes | Qtd. | Foco / Requisitos cobertos |
|---|:---:|---|
| PatientServiceTest | 20 | Cadastro, validação, edição, ativação/inativação e exclusão de pacientes (RF-001, RF-002, RF-004) |
| UserServiceTest | 19 | Cadastro de usuário e login associado, validações e unicidade de CPF/e-mail |
| MedicationServiceTest | 15 | Cadastro e atualização de medicamentos e cálculo do status de estoque (RF-007, RF-008) |
| LoginServiceTest | 12 | Autenticação: sucesso, senha incorreta, e-mail inexistente e usuário inativo (RF-006) |
| Testes de controlador (Patient, User, Medication e Login) | 13 | Endpoints REST: validação dos status HTTP e do contrato JSON das respostas |
| MedicationStatusTest | 4 | Classificação do estoque em OK, BAIXO e CRÍTICO (RF-008) |
| BackApplicationTests | 1 | Carregamento do contexto da aplicação Spring |

Esses testes garantem que as regras de negócio e os endpoints da API funcionam conforme o esperado, servindo de base para as próximas iterações de testes manuais e de usabilidade.

## Avaliação

Discorra sobre os resultados do teste, ressaltando os pontos fortes e fracos identificados na solução. Comente como o grupo pretende abordar esses pontos nas próximas iterações. Apresente as falhas detectadas e as melhorias geradas a partir dos resultados obtidos nos testes.

> **Links úteis**:
> - [Ferramentas de Teste para JavaScript](https://geekflare.com/javascript-unit-testing/)
