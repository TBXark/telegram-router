import type * as Telegram from 'telegram-bot-api-types';
import type {
    AbstractErrorHandlerFunction,
    AbstractHandler,
    AbstractHandlerFunction,
    AbstractMatchFunction,
    AbstractMiddlewareFunction,
} from './router';
import {
    AbstractRouter,
} from './router';

export type MatchFunction<Args extends Array<any> = any[]> = AbstractMatchFunction<Telegram.Update, Args>;
export type HandlerFunction<Result, Args extends Array<any> = any[]> = AbstractHandlerFunction<Telegram.Update, Result, Args>;
export type MiddlewareFunction<Result, Args extends Array<any> = any[]> = AbstractMiddlewareFunction<Telegram.Update, Result, Args>;
export type ErrorHandlerFunction<Result, Args extends Array<any> = any[]> = AbstractErrorHandlerFunction<Telegram.Update, Result, Args>;

export type Handler<Result, Args extends Array<any> = any[]> = AbstractHandler<Telegram.Update, Result, Args>;

export enum UpdateType {
    Message = 'message',
    CallbackQuery = 'callback_query',
}

export enum MatchType {
    Exact = 'exact',
    Prefix = 'prefix',
    Contains = 'contains',
    Regex = 'regex',
}

export class TelegramRouter<Result, Args extends Array<any> = any[]> extends AbstractRouter<Telegram.Update, Result, Args> {
    handleWith(pattern: string, updateType: UpdateType, matchType: MatchType = MatchType.Exact, handler: HandlerFunction<Result, Args>, ...middlewares: MiddlewareFunction<Result, Args>[]): string {
        const match = this.createMatchFunction(pattern, updateType, matchType);
        return super.handle(match, handler, ...middlewares);
    }

    handleText(pattern: string, matchType: MatchType = MatchType.Exact, handler: HandlerFunction<Result, Args>, ...middlewares: MiddlewareFunction<Result, Args>[]): string {
        return this.handleWith(pattern, UpdateType.Message, matchType, handler, ...middlewares);
    }

    handleCallback(pattern: string, matchType: MatchType = MatchType.Exact, handler: HandlerFunction<Result, Args>, ...middlewares: MiddlewareFunction<Result, Args>[]): string {
        return this.handleWith(pattern, UpdateType.CallbackQuery, matchType, handler, ...middlewares);
    }

    private createMatchFunction(pattern: string, updateType: UpdateType, matchType: MatchType): MatchFunction {
        switch (updateType) {
            case UpdateType.Message:
                return this.createMessageMatchFunction(pattern, matchType);
            case UpdateType.CallbackQuery:
                return this.createCallbackMatchFunction(pattern, matchType);
            default:
                throw new Error('Invalid update type');
        }
    }

    private createMessageMatchFunction(pattern: string, matchType: MatchType): MatchFunction {
        switch (matchType) {
            case MatchType.Exact:
                return TextMatch.exact(pattern);
            case MatchType.Prefix:
                return TextMatch.prefix(pattern);
            case MatchType.Contains:
                return TextMatch.contains(pattern);
            case MatchType.Regex:
                return TextMatch.regex(new RegExp(pattern));
            default:
                throw new Error('Invalid match type');
        }
    }

    private createCallbackMatchFunction(pattern: string, matchType: MatchType): MatchFunction {
        switch (matchType) {
            case MatchType.Exact:
                return CallbackMatch.exact(pattern);
            case MatchType.Prefix:
                return CallbackMatch.prefix(pattern);
            case MatchType.Contains:
                return CallbackMatch.contains(pattern);
            case MatchType.Regex:
                return CallbackMatch.regex(new RegExp(pattern));
            default:
                throw new Error('Invalid match type');
        }
    }
}

export class TextMatch {
    static exact<Args extends Array<any> = any[]>(text: string): MatchFunction<Args> {
        // eslint-disable-next-line unused-imports/no-unused-vars
        return (update: Telegram.Update, ...args: Args) => {
            return update.message?.text === text;
        };
    }

    static prefix<Args extends Array<any> = any[]>(prefix: string): MatchFunction<Args> {
        // eslint-disable-next-line unused-imports/no-unused-vars
        return (update: Telegram.Update, ...args: Args) => {
            return update.message?.text?.startsWith(prefix) ?? false;
        };
    }

    static contains<Args extends Array<any> = any[]>(text: string): MatchFunction<Args> {
        // eslint-disable-next-line unused-imports/no-unused-vars
        return (update: Telegram.Update, ...args: Args) => {
            return update.message?.text?.includes(text) ?? false;
        };
    }

    static regex<Args extends Array<any> = any[]>(regex: RegExp): MatchFunction<Args> {
        // eslint-disable-next-line unused-imports/no-unused-vars
        return (update: Telegram.Update, ...args: Args) => {
            return update.message?.text != null && regex.test(update.message.text);
        };
    }
}

export class CallbackMatch {
    static exact<Args extends Array<any> = any[]>(data: string): MatchFunction<Args> {
        // eslint-disable-next-line unused-imports/no-unused-vars
        return (update: Telegram.Update, ...args: Args) => {
            return update.callback_query?.data === data;
        };
    }

    static prefix<Args extends Array<any> = any[]>(prefix: string): MatchFunction<Args> {
        // eslint-disable-next-line unused-imports/no-unused-vars
        return (update: Telegram.Update, ...args: Args) => {
            return update.callback_query?.data?.startsWith(prefix) ?? false;
        };
    }

    static contains<Args extends Array<any> = any[]>(text: string): MatchFunction<Args> {
        // eslint-disable-next-line unused-imports/no-unused-vars
        return (update: Telegram.Update, ...args: Args) => {
            return update.callback_query?.data?.includes(text) ?? false;
        };
    }

    static regex<Args extends Array<any> = any[]>(regex: RegExp): MatchFunction<Args> {
        // eslint-disable-next-line unused-imports/no-unused-vars
        return (update: Telegram.Update, ...args: Args) => {
            return update.callback_query?.data != null && regex.test(update.callback_query.data);
        };
    }
}
