export type AbstractMatchFunction<Update, Args extends Array<any> = any[]> = (update: Update, ...args: Args) => boolean;
export type AbstractHandlerFunction<Update, Result, Args extends Array<any> = any[]> = (update: Update, ...args: Args) => Promise<Result>;
export type AbstractMiddlewareFunction<Update, Result, Args extends Array<any> = any[]> = (update: Update, next: AbstractHandlerFunction<Update, Result>, ...args: Args) => Promise<Result | void> | void;
export type AbstractErrorHandlerFunction<Update, Result, Args extends Array<any> = any[]> = (update: Update, error: Error, ...args: Args) => Promise<Result>;

function execute<Update, Result, Args extends Array<any> = any[]>(
    handler: AbstractHandlerFunction<Update, Result, Args>,
    middlewares: AbstractMiddlewareFunction<Update, Result, Args>[],
    update: Update,
    ...args: Args
): Promise<Result> {
    let index = 0;
    const next = async (update: Update, ...args: Args): Promise<Result> => {
        if (index < (middlewares?.length ?? 0)) {
            const middleware = middlewares[index];
            index++;
            const result = await middleware(update, next, ...args);
            if (result !== undefined) {
                return result as Result;
            }
        }
        return handler(update, ...args);
    };
    return next(update, ...args);
}

export class AbstractHandler<Update, Result, Args extends Array<any> = any[]> {
    readonly match: AbstractMatchFunction<Update, Args>;
    private readonly handler: AbstractHandlerFunction<Update, Result, Args>;
    private readonly middlewares: AbstractMiddlewareFunction<Update, Result, Args>[];

    constructor(match: AbstractMatchFunction<Update, Args>, handler: AbstractHandlerFunction<Update, Result, Args>, middlewares: AbstractMiddlewareFunction<Update, Result, Args>[] = []) {
        this.match = match;
        this.handler = handler;
        this.middlewares = middlewares ?? [];
        this.handle = this.handle.bind(this);
    }

    async handle(update: Update, ...args: Args): Promise<Result> {
        return execute(this.handler, this.middlewares, update, ...args);
    }
}

export class AbstractRouter<Update, Result, Args extends Array<any> = any[]> {
    private readonly routes: Map<string, AbstractHandler<Update, Result, Args>>;
    private readonly middlewares: AbstractMiddlewareFunction<Update, Result, Args>[];
    errorHandler?: AbstractErrorHandlerFunction<Update, Result>;

    constructor() {
        this.routes = new Map();
        this.middlewares = [];
        this.fetch = this.fetch.bind(this);
        this.with = this.with.bind(this);
        this.handle = this.handle.bind(this);
        this.remove = this.remove.bind(this);
    }

    async fetch(update: Update, ...args: Args): Promise<Result> {
        for (const handler of this.routes.values()) {
            if (handler.match(update, ...args)) {
                try {
                    return execute(handler.handle, this.middlewares, update, ...args);
                } catch (error) {
                    if (this.errorHandler == null) {
                        throw error;
                    }
                    return await this.errorHandler(update, error as Error, ...args);
                }
            }
        }
        throw new Error('No handler');
    }

    with(...middlewares: AbstractMiddlewareFunction<Update, Result, Args>[]) {
        this.middlewares.push(...middlewares);
    }

    handle(match: AbstractMatchFunction<Update, Args>, handler: AbstractHandlerFunction<Update, Result, Args>, ...middlewares: AbstractMiddlewareFunction<Update, Result, Args>[]): string {
        const key = randomUUID();
        this.routes.set(key, new AbstractHandler(match, handler, middlewares));
        return key;
    }

    remove(key: string): void {
        this.routes.delete(key);
    }
}

function randomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
