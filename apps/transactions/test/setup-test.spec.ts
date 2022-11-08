import { PostgreSqlContainer, StartedPostgreSqlContainer } from "./postgres-container.spec";

export let postgresContainer: StartedPostgreSqlContainer;

beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer('testcontainer1234')
        .withBindMounts([{
            source: "/Users/acuenca/projects/pruebas/nest-101/apps/transactions/scripts/initdb.sql",
            target: "/docker-entrypoint-initdb.d/initdb.sql"
        }])
        .start();
});


afterAll(async () => { postgresContainer?.stop(); });

