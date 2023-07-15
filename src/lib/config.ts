import dotenv from "dotenv";
dotenv.config();
export default class Config {
    static #port?: number;

    static get port(): number {
        if (this.#port) { return this.#port }

        const port = Number(process.env.PORT);
        if (isNaN(port)) {
            console.warn('Port must be defined');
            process.exit(1);
        }
        this.#port = port;
        return port;
    }
}
