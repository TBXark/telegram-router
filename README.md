# telegram-router
 
`telegram-router` is a simple javascript library that helps you to route messages from telegram bot to your application.


## Installation

```bash
npm install telegram-router
```


## Usage

```typescript

import { TelegramRouter } from 'telegram-router'

const bot = new TelegramRouter<Response>();

bot.handleWith('/admin', UpdateType.Message, MatchType.Exact, async (update: Telegram.Update) => {
    // handle message
});

bot.fetch(update);
```


## Example

- [telegram-bot-workers-template](https://github.com/TBXark/telegram-bot-workers-template): The basic template for running a Telegram Bot on Cloudflare Workers.


## License

**telegram-router** is released under the MIT license. [See LICENSE](LICENSE) for details.