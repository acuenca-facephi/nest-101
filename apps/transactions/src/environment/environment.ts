import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

function throwMissingEnvironmentVariable(variableName: string): string {
    throw new Error(`Missing the following environment variable ${variableName}`);
}

export const SERVER_PORT = process.env.SERVER_PORT;

export const DATABASE_HOST = process.env.DATABASE_HOST ?
    process.env.DATABASE_HOST :
    throwMissingEnvironmentVariable('DATABASE_HOST');

export const DATABASE_NAME: string = process.env.DATABASE_NAME ?
    process.env.DATABASE_NAME :
    throwMissingEnvironmentVariable('DATABASE_NAME');

export const DATABASE_USER: string = process.env.DATABASE_USER ?
    process.env.DATABASE_USER :
    throwMissingEnvironmentVariable('DATABASE_USER');

export const DATABASE_PASSWORD: string = process.env.DATABASE_PASSWORD ?
    process.env.DATABASE_PASSWORD :
    throwMissingEnvironmentVariable('DATABASE_PASSWORD');

export const DATABASE_PORT: string = process.env.DATABASE_PORT ?
    process.env.DATABASE_PORT :
    throwMissingEnvironmentVariable('DATABASE_PORT');
