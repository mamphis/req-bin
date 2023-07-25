import Config from "./lib/config";

(async () => {
    const response = await fetch(`http://localhost:${Config.port}/healthcheck`);
    if (response.ok) {
        return process.exit(0);
    }

    process.exit(1);
})();