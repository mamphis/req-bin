import EventEmitter from "events";
import express, { NextFunction, Request, RequestHandler, Response } from "express";
import { IncomingHttpHeaders } from "http";

export type HandledRequest = {
    headers: IncomingHttpHeaders,
    body: undefined | string,
    method: string,
    timestamp: Date,
    ips: string[],
}

const ONE_HOUR = 1000 * 60 * 60;
export function isRequestListener(value: unknown): value is RequestListener {
    return !!value && value instanceof RequestListener;
}

export class RequestListener {
    private static listeners: RequestListener[] = [];
    private event = new EventEmitter();
    private timeout: NodeJS.Timeout;
    private cachedEvents: HandledRequest[] = [];
    private _deleteAt: Date = new Date();

    private constructor(public readonly id: string) {
        RequestListener.listeners.push(this);
        this.timeout = this.refreshTimer();
    }

    static create(id: string) {
        const listener = new RequestListener(id);
        listener.event.on('obsolete', () => {
            this.listeners = this.listeners.filter(listener => listener.id !== id);
            listener.event.emit('end');
        });
    }

    private refreshTimer(this: RequestListener) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.event.emit('obsolete');
        }, ONE_HOUR);
        this._deleteAt = new Date(new Date().getTime() + ONE_HOUR);

        return this.timeout;
    }

    public on(event: 'request', listener: (request: HandledRequest) => void): void;
    public on(event: 'end', listener: () => void): void;
    public on(event: string, listener: (...arg: any[]) => void): void {
        this.event.on(event, listener);
    }

    public off(event: 'request', listener: (request: HandledRequest) => void): void;
    public off(event: 'end', listener: () => void): void;
    public off(event: string, listener: (...arg: any[]) => void): void {
        this.event.off(event, listener);
    }

    get events() {
        return [...this.cachedEvents];
    }

    get deleteAt() {
        return this._deleteAt;
    }
    
    clear() {
        this.cachedEvents = [];
    }
    
    public static get(id: string): RequestListener | undefined {
        return this.listeners.find(listeners => listeners.id === id);
    }

    public static handler(): Array<RequestHandler> {
        return [
            (req, res, next) => {
                if (!res.locals.id || typeof (res.locals.id) !== "string") {
                    return next({
                        code: 400,
                        message: 'id was not provided',
                    });
                }

                const handler = this.get(res.locals.id);
                if (!handler) {
                    return next({
                        code: 404,
                        message: `Handler with id "${res.locals.id}" not found.`,
                    });
                }

                res.locals.handler = handler;
                return next();
            },
            express.text({ type: '*/*' }),
            (req: Request, res: Response, next: NextFunction) => {
                const handledRequest: HandledRequest = {
                    body: ['HEAD', 'OPTIONS', 'GET', 'DELETE'].includes(req.method) ? '' : req.body,
                    headers: req.headers,
                    method: req.method,
                    timestamp: new Date(),
                    ips: req.ips.length == 0 ? [req.ip] : req.ips,
                }

                const handler = res.locals.handler;

                if (isRequestListener(handler)) {
                    handler.refreshTimer();
                    handler.cachedEvents.push(handledRequest);
                    handler.event.emit('request', handledRequest);
                    res.status(200).end();
                }
                else {
                    return next({
                        code: 500,
                        message: 'Something went wrong when handling the request',
                    })
                }
            }];
    }
}