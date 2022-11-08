import {
    StartedTestContainer,
    GenericContainer
} from "testcontainers";
import { AbstractStartedContainer } from "testcontainers/dist/modules/abstract-started-container";

export const POSTGRES_PORT = 5432;

export class PostgreSqlContainer extends GenericContainer {
    constructor(
        private password: string,
        image = 'postgres:latest',
        private username: string = 'postgres',
        private databaseName: string = 'postgres') {
        super(image);
    }

    public override async start(): Promise<StartedPostgreSqlContainer> {
        this.withExposedPorts(...(this.hasExposedPorts ? this.ports : [POSTGRES_PORT]))
            .withEnvironment({
                POSTGRES_DB: this.databaseName,
                POSTGRES_USER: this.username,
                POSTGRES_PASSWORD: this.password,
            })
            .withStartupTimeout(120_000);

        return new StartedPostgreSqlContainer(await super.start(), this.databaseName, this.username, this.password);
    }
}

export class StartedPostgreSqlContainer extends AbstractStartedContainer {
    private readonly port: number;

    constructor(
        startedTestContainer: StartedTestContainer,
        private readonly databaseName: string,
        private readonly username: string,
        private readonly password: string
    ) {
        super(startedTestContainer);
        this.port = startedTestContainer.getMappedPort(POSTGRES_PORT);
    }

    public getPort(): number {
        return this.port;
    }

    public getdatabaseName(): string {
        return this.databaseName;
    }

    public getUsername(): string {
        return this.username;
    }

    public getPassword(): string {
        return this.password;
    }
}
