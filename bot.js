const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity('mac help', { type: 'WATCHING' })
    .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
    .catch(console.error);
});

var commandPrefix = 'mac';

client.on('message', message => {
    var messageText = message.content;
    if (typeof messageText === 'string' || messageText instanceof String) {
        var messageWords = messageText.split(" ");
        if (messageWords[0].toLowerCase() === commandPrefix) {
            messageWords.shift();
            var cmd = messageWords[0];
            switch(cmd) {
                case 'test':
                    if (message.member.permissions.has('ADMINISTRATOR')) {
                        console.log('Yep');
                    } else {
                        console.log('Aww man');
                    }
                    break;
                case 'help':
                    if ((messageWords.length === 1) || (messageWords[1] === '1')) {
                        var listOfCommands = '';
                        listOfCommands += '> ***Page 1/2 of Commands:***\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> (for admins only) `establish <currency-acronym> <money-in-circulation>` register the country\n';
                        listOfCommands += '> `register` register for a bank account\n';
                        listOfCommands += '> `balance` see how much money you have\n';
                        listOfCommands += '> `exchange` see foreign exchange\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> To see other commands, do `help <page number>`.';
                        message.channel.send(listOfCommands);
                    } else if (messageWords[1] === '2') {
                        var listOfCommands = '';
                        listOfCommands += '> ***Page 2/2 of Commands:***\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> `check <person>` give money to someone\n';
                        listOfCommands += '> `invest <stock-acronym>` invest in a stock\n';
                        listOfCommands += '> `convert <currency1-acronym> <quantity-of-currency1> <currency2-acronym>` convert money\n';
                        listOfCommands += '> `store` see items for sale\n';
                        listOfCommands += '> `buy <item>` buy an item\n';
                        listOfCommands += '> \n';
                        listOfCommands += '> To see other commands, do `help <page number>`.';
                        message.channel.send(listOfCommands);
                    }
                    break;
                case 'establish':
                    if (message.member.permissions.has('ADMINISTRATOR')) {
                        if (messageWords.length === 3) {
                            var currencyAcronym = messageWords[1];
                            var moneyInCirculation = messageWords[2];
                            var moneyRaw = fs.readFileSync('money.json');
                            var moneyData = JSON.parse(moneyRaw);
                            var foundCountry = false;
                            for (i = 0; i < moneyData.countries.length; i++) {
                                if (message.guild.id === moneyData.countries[i].guildID) {
                                    foundCountry = true;
                                    message.channel.send('This country has already been established.');
                                }
                            }
                            if (!foundCountry) {
                                if (!Number.isNaN(parseInt(moneyInCirculation))) {
                                    if (currencyAcronym.length <= 3) {
                                        moneyData.countries.push({ guildID: message.guild.id, moneyInCirculation: parseInt(moneyInCirculation), currencyAcronym: currencyAcronym.toUpperCase(), netWorthNGA: 5000 });
                                        var processedTransaction = JSON.stringify(moneyData, null, 4);
                                        fs.writeFileSync('money.json', processedTransaction);
                                        message.channel.send('Congratulations! Your country has now been established in the interserver bank!');
                                    } else {
                                        message.channel.send('Your acronym is too long. Please give another acronym.');
                                    }
                                } else {
                                    message.channel.send('Sorry. You put an invalid number for the amount of currency in your country.');
                                }
                            }
                        } else {
                            message.channel.send('Please input the acronym of your currency ad how much of your currency is in circulation.');
                        }
                    } else {
                        message.channel.send('You cannot establish this country. Sorry. ;-;');
                    }
                    break;
                case 'register':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    var foundAccount = false;
                    for (i = 0; i < moneyData.bankAccounts.length; i++) {
                        if (message.author.id === moneyData.bankAccounts[i].accountID) {
                            foundAccount = true;
                            message.channel.send('You already have a bank account.')
                        }
                    }
                    if (!foundAccount) {
                        moneyData.bankAccounts.push({ accountID: message.author.id, balance: [] });
                        var processedTransaction = JSON.stringify(moneyData, null, 4);
                        fs.writeFileSync('money.json', processedTransaction);
                        message.channel.send('Congratulations! You now have a bank account!');
                    }
                    break;
                case 'balance':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    var foundAccount = false;
                    for (i = 0; i < moneyData.bankAccounts.length; i++) {
                        if (message.author.id === moneyData.bankAccounts[i].accountID) {
                            foundAccount = true;
                            for (j = 0; j < moneyData.bankAccounts[i].balance.length; j++) {
                                message.channel.send('You have ' + moneyData.bankAccounts[i].balance[j][1] + ' ' + moneyData.bankAccounts[i].balance[j][0] + ' in your bank account');
                            }
                        }
                    }
                    if (!foundAccount) {
                        message.channel.send('You do not have a bank account. Please do `mac register` to establish a bank account.');
                    }
                    break;
                case 'exchange':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    var thisMoneyCirc = 0;
                    var foundCountry = false;
                    for (i = 0; i < moneyData.countries.length; i++) {
                        if (message.guild.id === moneyData.countries[i].guildID) {
                            foundCountry = true;
                            thisMoneyCirc = moneyData.countries[i].moneyInCirculation;
                        }
                    }
                    if (!foundCountry) {
                        message.channel.send('This country is not in the Interserver Bank yet. Please tell the owner of this country to register this country.');
                    } else {
                        var currencyMessage = '';
                        for (i = 0; i < moneyData.countries.length; i++) {
                            currencyMessage += '> `' + moneyData.countries[i].currencyAcronym+ '` ' + moneyData.countries[i].moneyInCirculation/thisMoneyCirc + '\n';
                        }
                        message.channel.send(currencyMessage);
                    }
                    break;
                case 'check':
                    message.channel.send('`check` coming soon!');
                    break;
                case 'convert':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    
                    var foundCurrency1 = moneyData.countries.find(country => country.currencyAcronym === messageWords[1].toUpperCase()).currencyAcronym;
                    var foundCurrency2 = moneyData.countries.find(country => country.currencyAcronym === messageWords[3].toUpperCase()).currencyAcronym;
                    var currency1Circ = moneyData.countries.find(country => country.currencyAcronym === messageWords[1].toUpperCase()).moneyInCirculation;
                    var currency2Circ = moneyData.countries.find(country => country.currencyAcronym === messageWords[3].toUpperCase()).moneyInCirculation;
                    var conversionRate = 0;
                    if (currency1Circ && currency2Circ) {
                        conversionRate = currency2Circ / currency1Circ;
                    }

                    var bankAccounts = moneyData.bankAccounts;
                    var thisBankAccount = bankAccounts.find(account => account.accountID === message.author.id);
                    var currency1Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency1);
                    var currency2Acc = thisBankAccount.balance.find(acc => acc.currency === foundCurrency2);

                    if (messageWords.length !== 4) {
                        message.channel.send('The `convert` command needs 3 parameters');
                    } else {
                        if (!thisBankAccount) {
                            message.channel.send('You do not have a bank account. Please do `mac register` to establish a bank account.');
                        } else {
                            if (!foundCurrency1) {
                                message.channel.send('Sorry. ;-; We could not find the currency you were trying to convert.');
                            } else {
                                if (currency1Acc) {
                                    if (currency1Acc.amount < parseInt(messageWords[2])) {
                                        message.channel.send('You do not have enough ' + currency1Acc.currency + ' to make this transaction.');
                                    } else {
                                        if (!foundCurrency2) {
                                            thisBankAccount.balance.push({ "currency": messageWords[3].toUpperCase(), "amount": 0 });
                                            var processedTransaction = JSON.stringify(moneyData, null, 4);
                                            fs.writeFileSync('money.json', processedTransaction);
                                        }
                                        if (!foundCurrency2) {
                                            message.channel.send('Sorry. ;-; We could not find the currency you were trying to buy.');
                                        }
                                    }
                                }
                            }
                            if (foundCurrency2 && (currency1Acc.amount < parseInt(messageWords[2]))) {
                                for (i = 0; i < thisBankAccount.balance.length; i++) {
                                    if (thisBankAccount.balance.currency === messageWords[1].toUpperCase()) {
                                        thisBankAccount.balance.amount -= parseInt(messageWords[2]);
                                    }
                                    if (thisBankAccount.balance.currency === messageWords[3].toUpperCase()) {
                                        thisBankAccount.balance.amount += parseInt(messageWords[2]) * conversionRate;
                                    }
                                }
                                var processedTransaction = JSON.stringify(moneyData, null, 4);
                                fs.writeFileSync('money.json', processedTransaction);
                                message.channel.send('Money converted.');
                            }
                        }
                    }
                    break;
                case 'store':
                    var moneyRaw = fs.readFileSync('money.json');
                    var moneyData = JSON.parse(moneyRaw);
                    
                    var thisCountryCirc = 0;
                    for (i = 0; i < moneyData.countries.length; i++) {
                        if (moneyData.countries[i].guildID === message.guild.id) {
                            thisCountryCirc = moneyData.countries[i].moneyInCirculation;
                        }
                    }

                    var hitmanPrice = 

                    message.channel.send('`invest` coming soon!');
                    break;
                case 'invest':
                    message.channel.send('`invest` coming soon!');
                    break;
                default:
                    message.channel.send('Unknown command. Please type `mac help` for a list of commands.');
            }
        }
    }
});

client.login('NzI5NTY1NDQyOTUxMjE3MTkz.XwPsww.PfT8NgnZtZplofSs1Wvd8F1M6m0');