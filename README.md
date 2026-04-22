[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/IDEzcQ6G)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=23243657)
# :checkered_flag: NOME DO PROJETO

Sistema web desenvolvido para gerenciar o transporte universitário do município de Ocara, permitindo o controle de estudantes, ônibus, rotas, motoristas e frequência diária. A aplicação também auxilia na organização logística, distribuição equilibrada de rotas e comunicação com os alunos.

## :technologist: Membros da equipe

FRANCISCO MATEUS ALVES FREIRES - 565916 <br/>
DOUGLAS TEOFILO CAVALCANTE DA SILVA - 564625 <br/>
JOAO VITOR RODRIGUES SANTOS - 567428 <br/>
JONATHAN ALVES DA SILVA - 564730 <br/>
MATEUS SOUSA DODO - 567288 <br/>
NARCISO ROBERTO DE SOUZA - 565288

## :bulb: Objetivo Geral
Desenvolver um sistema web para gerenciar o transporte universitário de Ocara, permitindo o controle da quantidade de alunos por dia, distribuição de ônibus, definição de rotas, cadastro de motoristas e acompanhamento da frequência dos estudantes.

## :eyes: Público-Alvo
- Estudantes universitários de Ocara
- Coordenação/gestores do transporte universitário
- Prefeitura ou responsáveis pela logística do transporte

## :star2: Impacto Esperado
- Melhor organização do transporte universitário
- Redução de superlotação ou ociosidade dos ônibus
- Maior controle da frequência dos alunos
- Otimização das rotas dentro da cidade
- Distribuição justa de quilometragem entre motoristas
- Tomada de decisão baseada em dados (quantidade de alunos por faculdade/dia)
- Comunicação eficiente através de mural de avisos

## :people_holding_hands: Papéis ou tipos de usuário da aplicação

Administrador
- Gerencia alunos, ônibus, rotas, faculdades e motoristas
- Define motoristas do dia
- Visualiza relatórios e frequência
- Publica avisos no sistema
- Pode acionar distribuição automática de rotas

Aluno
- Realiza cadastro
- Confirma presença no transporte (frequência diária)
- Visualiza rota, ônibus e motorista designado para cada faculdade e rota
- Acessa o mural de avisos

Usuário não logado
- Visualiza informações básicas (ex: rotas, faculdades atendidas e avisos)


## :triangular_flag_on_post:	 Principais funcionalidades da aplicação

Funcionalidades públicas:
- Visualizar faculdades atendidas
- Visualizar rotas dos ônibus
- Ver pontos de parada
- Visualizar mural de avisos

Funcionalidades para alunos:
- Cadastro e login
- Confirmação de presença diária
- Visualização do ônibus, rota e motoristas do dia
- Acesso ao mural de avisos

Funcionalidades administrativas:
- Cadastro de ônibus
- Cadastro de faculdades
- Cadastro de motoristas
- Definição de rotas por bairros
- Definição de motoristas por dia
- Controle de frequência diária
- Distribuição automática ou manual de alunos por ônibus
- Geração de relatórios (quantidade de alunos por dia/faculdade)
- Publicação de avisos no mural

Funcionalidades inteligentes:
- Definição automática das rotas com base na demanda diária de alunos e disposição de motoristas.
- Consideração das faculdades do município de Quixadá para montagem das rotas.
- Sistema de rotatividade de motoristas, garantindo que ao final do mês todos percorram uma quilometragem semelhante.

## :spiral_calendar: Entidades ou tabelas do sistema

Liste as principais entidades do sistema.

- Aluno
- Ônibus
- Faculdade
- Rota
- Bairro
- Frequência
- Usuário (autenticação)
- Motorista
- Aviso

----

:warning::warning::warning: As informações a seguir devem ser enviadas juntamente com a versão final do projeto. :warning::warning::warning:


----

## :desktop_computer: Tecnologias e frameworks utilizados

**Frontend:**

Lista as tecnologias, frameworks e bibliotecas utilizados.

**Backend:**

Lista as tecnologias, frameworks e bibliotecas utilizados.


## :shipit: Operações implementadas para cada entidade da aplicação


| Entidade| Criação | Leitura | Atualização | Remoção |
| --- | --- | --- | --- | --- |
| Aluno | X | X | X | X |
| Ônibus | X | X | X | X |
| Motorista | X | X | X | X |
| Rota | X | X | X | X |
| Faculdade | X | X | X | X |
| Aviso | X | X | X | X |
| Frequência | X | X |   |   |

> Lembre-se que é necessário implementar o CRUD de pelo menos duas entidades.

## :neckbeard: Rotas da API REST utilizadas

| Método HTTP | URL |
| --- | --- |
| GET | api/entidade1/|
| POST | api/entidade2 |
