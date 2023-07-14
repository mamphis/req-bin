import { Router } from "express";
import { HandledRequest, RequestListener, isRequestListener } from "../lib/requestListener";

const router = Router();
router.use((req, res, next) => {
    const handler = RequestListener.get(res.locals.id);
    if (!handler) {
        return next({
            code: 404,
            message: 'Handler not found.',
        });
    }
    res.locals.handler = handler;
    next();
});

router.get('/', (req, res, next) => {
    res.render('index', {
        id: res.locals.id
    });
});

router.get('/event', (req, res, next) => {
    const { handler } = res.locals;

    if (!isRequestListener(handler)) {
        return next({
            code: 500,
            message: 'Something went wrong when handling the request',
        })
    }

    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
    });

    let id = 0;
    const sendEvent = (event: string, data: any) => {
        res.write(`event: ${event}\n`);
        res.write(`id: ${++id}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }

    const sendHandledRequest = (request: HandledRequest) => {
        sendEvent('request', request);
        sendEvent('config', {
            deleteAt: handler.deleteAt,
        });
    };
    const timeOutHandler = () => {
        res.end();
    };

    handler.events.forEach(sendHandledRequest);
    handler.on('request', sendHandledRequest);
    handler.on('end', timeOutHandler);

    sendEvent('config', {
        deleteAt: handler.deleteAt,
    });
    res.on('close', () => {
        handler.off('request', sendHandledRequest);
        handler.off('end', timeOutHandler);
    });
});

router.use('/bin', ...RequestListener.handler())
export default router;
