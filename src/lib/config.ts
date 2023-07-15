import dotenv from "dotenv";
dotenv.config();
export default class Config {
    static #port: number = 3000;
    static #requestBinCacheSize: number = 20;
    static #requestBinInactiveDuration: number = 1000 * 60 * 60;

    static get port(): number {
        const port = Number(process.env.PORT);
        if (isNaN(port)) {
            return this.#port;
        }
        this.#port = port;
        return port;
    }

    static get allowCustomRoutes() {
        return process.env.ALLOW_CUSTOM_ROUTES?.toLowerCase() === 'true';
    }

    static get requestBinCacheSize(): number {
        const requestBinCacheSize = Number(process.env.REQUEST_BIN_CACHE_SIZE);
        if (isNaN(requestBinCacheSize)) { return this.#requestBinCacheSize; }
        
        this.#requestBinCacheSize = requestBinCacheSize;
        return requestBinCacheSize;
    }

    static get requestBinInactiveDuration(): number {
        const requestBinInactiveDuration = Number(process.env.REQUEST_BIN_INACTIVE_DURATION);
        if (isNaN(requestBinInactiveDuration)) { return this.#requestBinInactiveDuration; }
        
        this.#requestBinInactiveDuration = requestBinInactiveDuration;
        return requestBinInactiveDuration;
    }
}
