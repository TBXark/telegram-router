import { describe, it, expect, beforeEach } from 'vitest';
import {TelegramRouter, TextMatch, CallbackMatch } from '../src/telegram.ts';
import type * as Telegram from 'telegram-bot-api-types';

describe('TextMatch', () => {
    let router: TelegramRouter<string>;

    beforeEach(() => {
        router = new TelegramRouter<string>();
        router.errorHandler = async () => 'Error';
        router.handle(TextMatch.exact('hello'), async () => 'Hello World');
        router.handle(TextMatch.contains('world'), async () => 'World Hello');
        router.handle(TextMatch.prefix('hi'), async () => 'Hi there');
        router.handle(TextMatch.regex(/^bye/i), async () => 'Bye bye');
    });

    it('should match exact text', async () => {
        const result = await router.fetch({ message: { text: 'hello' } } as Telegram.Update);
        expect(result).toBe('Hello World');
    });

    it('should match text containing substring', async () => {
        const result = await router.fetch({ message: { text: 'say world to me' } } as Telegram.Update);
        expect(result).toBe('World Hello');
    });

    it('should match text starting with prefix', async () => {
        const result = await router.fetch({ message: { text: 'hi there' } } as Telegram.Update);
        expect(result).toBe('Hi there');
    });

    it('should match text based on regex', async () => {
        const result = await router.fetch({ message: { text: 'Bye' } } as Telegram.Update);
        expect(result).toBe('Bye bye');
    });

    it('should return error if no handler found', async () => {
        try {
            await router.fetch({ message: { text: 'Goodbye' } } as Telegram.Update);
        } catch (error) {
            expect((error as Error).message).toBe('No handler');
        }
    });

    it('should return error if handler throws error', async () => {
        router.handle(TextMatch.exact('error'), async () => { throw new Error('Error'); });
        const result = await router.fetch({ message: { text: 'error' } } as Telegram.Update);
        expect(result).toBe('Error');
    });

});

describe('CallbackMatch', () => {
    let router: TelegramRouter<string>;

    beforeEach(() => {
        router = new TelegramRouter<string>();
        router.errorHandler = async () => 'Error';
        router.handle(CallbackMatch.exact('hello'), async () => 'Hello World');
        router.handle(CallbackMatch.exact('world'), async () => 'World Hello');
        router.handle(CallbackMatch.exact('hi'), async () => 'Hi there');
        router.handle(CallbackMatch.exact('bye'), async () => 'Bye bye');
    });

    it('should match exact callback data', async () => {
        const result = await router.fetch({ callback_query: { data: 'hello' } } as Telegram.Update);
        expect(result).toBe('Hello World');
    });

    it('should return error if no handler found', async () => {
        try {
            await router.fetch({ callback_query: { data: 'Goodbye' } } as Telegram.Update);
        } catch (error) {
            expect((error as Error).message).toBe('No handler');
        }
    });

    it('should return error if handler throws error', async () => {
        router.handle(CallbackMatch.exact('error'), async () => { throw new Error('Error'); });
        const result = await router.fetch({ callback_query: { data: 'error' } } as Telegram.Update);
        expect(result).toBe('Error');
    });
});


describe('MiddlewareFunction', () => {
    let router: TelegramRouter<string>;

    beforeEach(() => {
        router = new TelegramRouter<string>();
        router.errorHandler = async () => 'Error';
        router.handle(TextMatch.exact('hello'), async () => 'Hello World', async (update, next) => {
            const result = await next(update);
            return `${result} from middleware`;
        });
    });

    it('should run middleware', async () => {
        const result = await router.fetch({ message: { text: 'hello' } } as Telegram.Update);
        expect(result).toBe('Hello World from middleware');
    });

    it('should run multiple middleware', async () => {
        router.handle(TextMatch.exact('world'), async () => 'World Hello', async (update, next) => {
            const result = await next(update);
            return `${result} from middleware`;
        });
        const result = await router.fetch({ message: { text: 'world' } } as Telegram.Update);
        expect(result).toBe('World Hello from middleware');
    });


})