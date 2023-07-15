import express, { NextFunction, Request, Response } from "express";
import { join } from "path";
import { v4, validate } from 'uuid';
import { RequestListener } from "./lib/requestListener";
import binRouter from './route/bin';
import Config from "./lib/config";

const app = express();
app.set('view engine', 'ejs');
app.set('views', join(__dirname, '../client'));
app.enable('trust proxy');
app.use('/static/js', express.static(join(__dirname, '../client/js')));
app.use('/static/css', express.static(join(__dirname, '../client/css')));
app.use('/static/css', express.static(join(__dirname, '../node_modules/bulma/css')));

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    const id = v4()
    RequestListener.create(id);
    res.redirect(`/${id}`);
});

app.use('/:id', (req: Request, res: Response, next: NextFunction) => {
    if (!Config.allowCustomRoutes) {
        if (!validate(req.params.id)) {
            return next({
                code: 400,
                message: 'Invalid request bin name.',
            });
        }
    }

    if (!RequestListener.get(req.params.id)) {
        if (!Config.allowCustomRoutes) {
            return next({
                code: 404,
                message: 'Request Bin cannot be found',
            });
        }

        RequestListener.create(req.params.id);
    }

    res.locals.id = req.params.id;
    next();
}, binRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
    next({
        code: 404,
        message: 'Route not found.',
    })
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.code ?? 500).render('error', err);
});

app.listen(Config.port, () => {
    console.log(`Server started listening on port ${Config.port}`);
    console.log(`Custom Request Bin names allowed: ${Config.allowCustomRoutes}`)
});