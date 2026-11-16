# App Saúde

Backend Spring Boot e telas web estáticas para pacientes, médicos e atendentes.

## Requisitos

- Java 17 ou superior
- PostgreSQL 14 ou superior

## Configuração

Defina as variáveis de ambiente antes de iniciar a aplicação:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/appsaude
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<senha do banco>
APP_AUTH_JWT_SECRET=<chave Base64 com pelo menos 32 bytes decodificados>
```

Gere uma chave JWT com `openssl rand -base64 32`. Não reutilize a chave de teste.
O tempo de validade do token pode ser configurado em milissegundos com
`APP_AUTH_JWT_EXPIRATION_MS` (padrão: uma hora).

Na primeira migração, contas iniciais de staff são opcionais e usam hashes
BCrypt previamente gerados. Para criar um atendente, configure
`APP_STAFF_ATENDENTE_CPF` e `APP_STAFF_ATENDENTE_BCRYPT_HASH`. Para criar um médico, configure
`APP_STAFF_MEDICO_CPF`, `APP_STAFF_MEDICO_CRM` e `APP_STAFF_MEDICO_BCRYPT_HASH`. Configure
essas variáveis antes da primeira inicialização, pois o Flyway executa cada
migration uma única vez. Nunca use senha padrão em produção.

## Executar

No Windows:

```powershell
./mvnw.cmd spring-boot:run
```

No Linux/macOS:

```sh
./mvnw spring-boot:run
```

Abra `http://localhost:8080/app-saude/telas-comuns/inicio/inicio.html` para acessar a página inicial.

No perfil local (`dev`), a aplicação usa um banco H2 em memória e carrega
automaticamente médicos de demonstração para permitir testar o agendamento. Se
seu `.env` configurar outro banco, force os valores locais ao iniciar no Windows:

```powershell
$env:SPRING_PROFILES_ACTIVE = "dev"
$env:SPRING_DATASOURCE_URL = "jdbc:h2:mem:appsaude;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE"
$env:SPRING_DATASOURCE_USERNAME = "sa"
$env:SPRING_DATASOURCE_PASSWORD = ""
./mvnw.cmd spring-boot:run
```

Os dados do H2 são recriados quando a aplicação reinicia. Para persistência local
ou para usar os médicos do PostgreSQL, configure as variáveis `SPRING_DATASOURCE_*`
e inicie com `SPRING_PROFILES_ACTIVE=prod`.

## Testes

```sh
./mvnw test
```

Os testes de contexto usam H2 e não precisam de um PostgreSQL local.

## Banco de dados e migrations

As migrations atuais usam PostgreSQL e nomes de coluna `snake_case`. As versões
V1–V4 foram convertidas para o esquema atual. Se uma instalação já executou
essas versões, recrie o banco de desenvolvimento antes de iniciar esta versão;
em produção, não apague nem edite o histórico do Flyway. Prepare uma migration
de conversão específica para os dados e o esquema existentes antes de atualizar.
