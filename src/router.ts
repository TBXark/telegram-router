export type AbstractMatchFunction<U> = (update: U) => boolean;
export type AbstractHandlerFunction<U, R> = (update: U) => Promise<R>;
export type AbstractMiddlewareFunction<U, R> = (update: U, next: AbstractHandlerFunction<U, R>) => Promise<R | void>;
export type AbstractErrorHandlerFunction<U, R> = (update: U, error: Error) => Promise<R>;

export class AbstractHandler<U, R> {
    readonly match: AbstractMatchFunction<U>;
    readonly handler: AbstractHandlerFunction<U, R>;
    readonly middlewares: AbstractMiddlewareFunction<U, R>[];

    constructor(match: AbstractMatchFunction<U>, handler: AbstractHandlerFunction<U, R>, middlewares: AbstractMiddlewareFunction<U, R>[] = []) {
        this.match = match;
        this.handler = handler;
        this.middlewares = middlewares;
    }

    async handle(update: U): Promise<R> {
        let index = 0;
        const next = async (update: U): Promise<R> => {
            if (index < this.middlewares.length) {
                const middleware = this.middlewares[index];
                index++;
                const result = await middleware(update, next);
                if (result) {
                    return result;
                }
            }
            return this.handler(update);
        };
        return next(update);
    }
}

export class AbstractRouter<U, R> {
    private readonly routes: Map<string, AbstractHandler<U, R>>;
    errorHandler?: AbstractErrorHandlerFunction<U, R>;

    constructor() {
        this.routes = new Map();
    }

    async fetch(update: U): Promise<R> {
        for (const handler of this.routes.values()) {
            if (handler.match(update)) {
                try {
                    return await handler.handle(update);
                } catch (error) {
                    if (this.errorHandler == null) {
                        throw error;
                    }
                    return await this.errorHandler(update, error as Error);
                }
            }
        }
        throw new Error('No handler');
    }

    handle(match: AbstractMatchFunction<U>, handler: AbstractHandlerFunction<U, R>, ...middlewares: AbstractMiddlewareFunction<U, R>[]): string {
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
