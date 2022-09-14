import { config as dotenvConfig } from 'dotenv';


dotenvConfig();

export const SERVER_PORT = process.env.SERVER_PORT;
