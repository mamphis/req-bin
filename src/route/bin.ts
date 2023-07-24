import { Router } from "express";
import { HandledRequest, RequestListener, isRequestListener } from "../lib/requestListener";
import { request } from "http";

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

router.delete('/', (req, res, next) => {
    const { handler } = res.locals;

    if (!isRequestListener(handler)) {
        return next({
            code: 500,
            message: 'Something went wrong when handling the request',
        })
    }

    handler.clear();
    res.status(200).end();
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
    };

    const sendChangeHandler = () => {
        sendEvent('config', {
            deleteAt: handler.deleteAt,
        });
    }

    const timeOutHandler = () => {
        res.end();
    };

    handler.events.forEach(sendHandledRequest);
    handler.on('request', sendHandledRequest);
    handler.on('end', timeOutHandler);
    handler.on('changed', sendChangeHandler);

    sendEvent('config', {
        deleteAt: handler.deleteAt,
    });

    res.on('close', () => {
        handler.off('request', sendHandledRequest);
        handler.off('end', timeOutHandler);
        handler.off('changed', sendChangeHandler);
    });
});

router.post('/refresh', (req, res, next) => {
    const { handler } = res.locals;

    if (!isRequestListener(handler)) {
        return next({
            code: 500,
            message: 'Something went wrong when handling the request',
        })
    }

    handler.refreshTimer();

    res.status(201).end();
});

router.use('/bin', ...RequestListener.handler())
export default router;
