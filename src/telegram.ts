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

export type MatchFunction = AbstractMatchFunction<Telegram.Update>;
export type HandlerFunction<R> = AbstractHandlerFunction<Telegram.Update, R>;
export type MiddlewareFunction<R> = AbstractMiddlewareFunction<Telegram.Update, R>;
export type ErrorHandlerFunction<R> = AbstractErrorHandlerFunction<Telegram.Update, R>;

export type Handler<R> = AbstractHandler<Telegram.Update, R>;

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

export class TelegramRouter<R> extends AbstractRouter<Telegram.Update, R> {
    handleWith(pattern: string, updateType: UpdateType, matchType: MatchType, handler: HandlerFunction<R>, ...middlewares: MiddlewareFunction<R>[]): string {
        const match = this.createMatchFunction(pattern, updateType, matchType);
        return super.handle(match, handler, ...middlewares);
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
    static exact(text: string): MatchFunction {
        return (update: Telegram.Update) => {
            return update.message?.text === text;
        };
    }

    static prefix(prefix: string): MatchFunction {
        return (update: Telegram.Update) => {
            return update.message?.text?.startsWith(prefix) ?? false;
        };
    }

    static contains(text: string): MatchFunction {
        return (update: Telegram.Update) => {
            return update.message?.text?.includes(text) ?? false;
        };
    }

    static regex(regex: RegExp): MatchFunction {
        return (update: Telegram.Update) => {
            return update.message?.text != null && regex.test(update.message.text);
        };
    }
}

export class CallbackMatch {
    static exact(data: string): MatchFunction {
        return (update: Telegram.Update) => {
            return update.callback_query?.data === data;
        };
    }

    static prefix(prefix: string): MatchFunction {
        return (update: Telegram.Update) => {
            return update.callback_query?.data?.startsWith(prefix) ?? false;
        };
    }

    static contains(text: string): MatchFunction {
        return (update: Telegram.Update) => {
            return update.callback_query?.data?.includes(text) ?? false;
        };
    }

    static regex(regex: RegExp): MatchFunction {
        return (update: Telegram.Update) => {
            return update.callback_query?.data != null && regex.test(update.callback_query.data);
        };
    }
}
