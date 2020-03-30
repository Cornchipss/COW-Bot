const Discord = require('discord.js');
const winston = require('winston');
const auth = require('./auth.json');
const fetch = require('node-fetch');

const readline = require('readline').createInterface(
{
    input: process.stdin,
    output: process.stdout
});

const client = new Discord.Client();

const logger = winston.createLogger(
{
    transports: [
        new winston.transports.Console()
    ]
});

class CustomCommand
{
    constructor(name, action, description)
    {
        if(typeof name === 'string')
            name = [name];

        this._name = name;
        this._action = action;
        this._description = description;

        this.call = this.action;
    }

    get name() { return this._name; }
    get action() { return this._action; }
    get description() { return this._description; }
}

function sendMessageAction(msg)
{
    return (msgSent) =>
    {
        send(msg, msgSent.channel);
    };
}

function sendFileAction(file)
{
    return (msg) =>
    {
        sendFile(file, msg.channel);
    };
}

function sendListAction(list, listName, by)
{
    let listStr = `${listName} by ${by}:\n\`\`\`css\n`;
    for(let i = 0; i < list.length; i++)
    {
        listStr += `${i + 1}: ${list[i]}\n`;
    }
    listStr += '```';

    return (msg) =>
    {
        send(listStr, msg.channel);
    }
}

let running = true;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    (function promptCommand() {
        readline.question('> ', (res) => {
            handleCommand(res);
            if (running)
                promptCommand();
            else {
                console.log('Exiting...');
                process.exit();
            }
        });
    })();
});

let discordCommands = [];
let consoleCommands = [];

(() => 
{
    // Discord commands
    {
        discordCommands.push(new CustomCommand('proud', (msg) =>
        {
            let mentioned = getMentioned(msg);

            if (mentioned.length === 0)
                send('COW bot is proud of @everyone.', msg.channel);
            else if (mentioned.length === 1)
                send(`COW bot is proud of you <@${mentioned[0].id}>.`, msg.channel);
            else
            {
                let message = 'COW bot is very proud of ';

                for (let i = 0; i < mentioned.length; i++)
                {
                    if (i + 1 === mentioned.length && mentioned.length !== 2)
                        message += 'and ';

                    message += `<@${mentioned[i].id}>`;

                    if (i + 1 === mentioned.length)
                        message += '.';
                    else
                        message += ', ';
                }

                if (message.length > 2000)
                    send('COW bot is very proud.', msg.channel);
                else
                    send(message, msg.channel);
            }
        }, 'Cow bot is proud of [name(s)]'));
        
        discordCommands.push(new CustomCommand('notproud', (msg) =>
        {
            let mentioned = getMentioned(msg);

            if (mentioned.length === 0)
                send('COW bot is not proud of anyone >:(', msg.channel);
            else if (mentioned.length === 1)
                send(`COW bot is very unpleased with you <@${mentioned[0].id}>.`, msg.channel);
            else
            {
                let message = 'COW bot is very unpleased with ';

                for (let i = 0; i < mentioned.length; i++)
                {
                    if (i + 1 === mentioned.length)
                        message += 'and ';

                    message += `<@${mentioned[i].id}>`;

                    if (i + 1 === mentioned.length)
                        message += '.';
                    else
                        message += ', ';
                }

                if (msg.length > 2000)
                    send('COW bot is very unpleased >:(', msg.channel);
                else
                    send(message, msg.channel);
            }
        }, 'cow bot is not proud of anyone or cow bot is very unpleased with [name]'));

        discordCommands.push(new CustomCommand('forgive', (msg) =>
        {
            let mentioned = getMentioned(msg);

            if (mentioned.length === 0)
                send('COW bot will forgive all.', msg.channel);
            else if (mentioned.length === 1)
                send(`COW bot will forgive you <@${mentioned[0].id}>.`, msg.channel);
            else
            {
                let message = 'COW bot will forgive ';

                for (let i = 0; i < mentioned.length; i++)
                {
                    if (i + 1 === mentioned.length)
                        message += 'and ';

                    message += `<@${mentioned[i].id}>`;

                    if (i + 1 === mentioned.length)
                        message += '.';
                    else
                        message += ', ';
                }

                if (msg.length > 2000)
                    send('COW bot will forgive a lot of people', msg.channel);
                else
                    send(message, msg.channel);
            }
        }, 'cow bot will forgive all (or) cow boit will forgive you, [name]'));

        const thotlist = [ 'Rachel', 'Fares', 'Jose', 'Angel', 'Melina', 'Miguel', 'Dan', 'Cornchip', 'Dom', 'Ethan', 'Roman', 'Troy', 'Pat', 'Ken' ];
        const edgelist = ['Troy', 'Angel', 'Miguel', 'Jose', 'Dan', 'Ken'];
        const peenerlist = ['Jose', 'Dom', 'Dan', 'Pat', 'Miguel', 'Angel', 'Cornchip', 'Troy', 'Ethan', 'Roman', 'Melina', 'Rachel', 'Fares', 'Ken'];
        const nutlist = ['Ken', 'Roman', 'Fares', 'Ethan', 'Dan', 'Troy', 'Cornchip', 'Dom', 'Miguel', 'Jose', 'Pat', 'Angel', 'Rachel', 'Melina'];

        discordCommands.push(new CustomCommand(['triangle', 'delta'], sendMessageAction('Δ'), 'Δ'));
        discordCommands.push(new CustomCommand('square', sendMessageAction('■'), '■'));
        discordCommands.push(new CustomCommand('theta', sendMessageAction('θ'), 'θ'));
        discordCommands.push(new CustomCommand('yuri', sendMessageAction('yuridopted'), 'Tells a joke'));
        discordCommands.push(new CustomCommand('ligma', sendMessageAction('What\'s Ligma?'), 'Tells a joke'));
        discordCommands.push(new CustomCommand('joe', sendMessageAction('Mamma'), 'Tells a joke'));
        discordCommands.push(new CustomCommand(['thots', 'thotlist'], sendListAction(thotlist, 'Thots List (TM)', 'Miguel'), 'Sends thot ranking list'));
        discordCommands.push(new CustomCommand('edgelist', sendListAction(edgelist, 'Edge List', 'Miguel'), 'Sends edge ranking list'));
        discordCommands.push(new CustomCommand(['peenerlist', 'penislist', 'peeners'], sendListAction(peenerlist, 'Peener List', 'Miguel'), 'Sends the peener ranking list'));
        discordCommands.push(new CustomCommand(['ejaculations', 'ejaculationlist', 'nutlist', 'fastestnut', 'fastestnutinthewest'], sendListAction(nutlist, 'Fastest Ejaculation List', 'Miguel'), 'Sends fastest ejaculation rankings'));

        discordCommands.push(new CustomCommand('settle', sendFileAction('./imgs/settle.png'), 'Settles everyone'));
        discordCommands.push(new CustomCommand('settlehot', sendFileAction('./imgs/settle-hot.png'), 'Settles everyone hotly'));
        
        discordCommands.push(new CustomCommand(['coinflip', 'flipcoin'], (msg) =>
        {
            send(Math.random() < .5 ? 'Heads' : 'Tails', msg.channel);
        }));

        discordCommands.push(new CustomCommand('d', (msg) =>
        {
            let split = msg.content.split(' ');
            if(split.length > 1)
            {
                let numsStr = '';
                for(let i = 1; i < split.length; i++)
                {
                    let num = parseInt(split[i]);
                    if(num >= 1) // also checks if it's actually a number
                    {
                        numsStr += ' ' + Math.round((Math.random() * (num - 1) + 1));
                    }
                    else
                    {
                        send('Nice try skrub.', msg.channel);
                        numsStr = undefined;
                        break;
                    }
                }

                if(numsStr)
                    send("🎲:" + numsStr, msg.channel);
                else
                    send('Format: d #>=1', msg.channel);
            }
            else
                send('Format: d #>=1', msg.channel);
        }));

        discordCommands.push(new CustomCommand('kick', (msg) =>
        {
            msg.guild.fetchMember(msg.author).then(member =>
            {
                kick(member, 'asking for it', msg.channel);
            });
        }, 'Kicks the mentioned person(s)'));

        discordCommands.push(new CustomCommand('kickme', (msg) =>
        {
            msg.guild.fetchMember(msg.author).then(member =>
            {
                kick(member, 'asking for it', msg.channel);
            });
        }, 'Kicks yourself - dummy'));

        discordCommands.push(new CustomCommand('degree', sendMessageAction('°'), '°'));
        discordCommands.push(new CustomCommand(['jesus', 'jesusfish', 'alpha'], sendMessageAction('α'), 'α'));
        discordCommands.push(new CustomCommand('beta', sendMessageAction('β'), 'β'));
        discordCommands.push(new CustomCommand('lambda', sendMessageAction('λ'), 'λ'));
        discordCommands.push(new CustomCommand('integral', sendMessageAction('∫'), '∫'));
        discordCommands.push(new CustomCommand('infinity', sendMessageAction('∞'), '∞'));
        discordCommands.push(new CustomCommand('sigma', sendMessageAction(':ok_hand: :eggplant: :sweat_drops: or Σ / σ'), 'Σ / σ'));
        discordCommands.push(new CustomCommand(['giveortake', 'plusorminus', 'minusplus', 'plusminus'], sendMessageAction('±'), '±'));
        discordCommands.push(new CustomCommand('greekquestionmark', sendMessageAction(';'), ';'));
        discordCommands.push(new CustomCommand('mu', sendMessageAction('µ'), 'µ'));
        discordCommands.push(new CustomCommand('omega', sendMessageAction('ω'), 'ω'));
        discordCommands.push(new CustomCommand('pi', sendMessageAction('π'), 'π'));
        discordCommands.push(new CustomCommand('phi', sendMessageAction('φ'), 'φ'));
        discordCommands.push(new CustomCommand(['allrealnum', 'realnums', 'allrealnums'], sendMessageAction('ℝ'), 'ℝ'));
        discordCommands.push(new CustomCommand(['density', 'rho'], sendMessageAction('ρ'), 'ρ'));
        discordCommands.push(new CustomCommand('ken', sendMessageAction('8=>'), 'Show\'s Ken\'s peener'));
        discordCommands.push(new CustomCommand('jose', sendMessageAction('8========>'), 'Show\'s Jose\'s peener'));
        discordCommands.push(new CustomCommand('github', sendMessageAction('https://github.com/Cornchipss/COW-Bot'), 'Sends the GitHub page for the COW Bot'));

        discordCommands.push(new CustomCommand('weather', (msg) =>
        {
            send('Grabbing the weather now...', msg.channel);

            const API_KEY = 'b0d48880090d49e9dcc76306507a83b6';
            const lat = 40.2774449;
            const lon = -76.379983;
            fetch(`https://api.darksky.net/forecast/${API_KEY}/${lat},${lon}?units=si`).then(resp => resp.json().then(data =>
            {
                let weatherMsg =
                    `== **Currently** ==\nTemperature: ${data.currently.temperature}°C (${~~Math.round(tF(data.currently.temperature))}°F)\n${data.hourly.summary}\nWind:${data.currently.windSpeed} m/s`;

                for (let i = 0; i <= 24; i++)
                {
                    hour = data.hourly.data[i];
                    let time = new Date(hour.time * 1000);
                    let sum = hour.summary;
                    let precip = hour.precipType;
                    let prob = hour.precipProbability;
                    let temperature = hour.temperature;
                    let wind = hour.windSpeed;

                    if (weatherMsg.length > 1800)
                    {
                        send(weatherMsg, msg.channel);
                        weatherMsg = "";
                    }

                    let timeStr = time.getHours() + '';
                    if (time.getHours() > 12)
                        timeStr = time.getHours() % 12 + '';
                    else if (time.getHours() === 0)
                        timeStr = '12';

                    weatherMsg +=
                        `\n\n**== ${timeStr} ${time.getHours() >= 12 ? 'PM' : 'AM'}** ==\nTemperature: ${~~Math.round(temperature)}°C (${~~Math.round(tF(temperature))}°F)\nSummary: ${sum}\nPrecipitation: ${precip ? `${precip} ${~~Math.round(prob * 100)}%` : 'None'}\nWind: ${wind} m/s`;
                }

                send(`${weatherMsg}`, msg.channel);
            }));
        }, 'Gets the weather for the next 3 days'));

        discordCommands.push(new CustomCommand(['help', 'commands'], (msg) =>
        {
            let list = '== COW Bot Commands ==\n```yml\n';

            for(let i = 0; i < discordCommands.length; i++)
            {
                let cc = discordCommands[i];
                let names = '';

                cc.name.forEach(name =>
                {
                    names += name + ' ';
                });

                names = names.substr(0, names.length - 1);

                list += `${names}: ${cc.description}\n`;
            }

            list += '```';
            send(list, msg.channel);
        }, 'Helps you out'));
    }

    // Console commands
    {
        consoleCommands.push(new CustomCommand('announce', (split) =>
        {
            if (split.length > 1)
            {
                client.guilds.forEach(g =>
                {
                    let c = g.channels.filter(channel =>
                    {
                        return (channel.name === 'general' && channel.type === 'text');
                    });
                    
                    c.forEach(channel =>
                    {
                        send('@everyone >> ' + cmd.substring(command.length), channel);
                    });
                });
            }
            else
                console.log('Must specify what to send!');
        }, 'Announces something to every server.'));

        consoleCommands.push(new CustomCommand('kick', (split) =>
        {
            if (split.length > 1)
            {
                let memberFound = false;

                client.guilds.forEach(g =>
                {
                    let members = g.members;
                    members.forEach(m =>
                    {
                        if (m.user.tag === split[1])
                        {
                            memberFound = true;
                            kick(m, split.length > 2 ? split[2] : 'blaspheming', g.channels.find(c => c.name === 'general'));
                        }
                    });
                });

                if (!memberFound)
                {
                    console.log("No member by that name was found - make sure to format it like name#0000");
                }
            }
            else
            {
                console.log('You must provide the name + numbers!');
            }
        }, 'kicks a specified person'));

        consoleCommands.push(new CustomCommand('say', (split, cmd, command) =>
        {
            if (split.length > 1)
            {
                client.guilds.forEach(g =>
                {
                    let c = g.channels.filter(channel =>
                    {
                        return (channel.name === 'general' && channel.type === 'text');
                    });

                    c.forEach(channel =>
                    {
                        console.log(cmd);
                        send(cmd.substr(command.length), channel);
                    });
                });
            }
            else
                console.log('Must specify what to send!');
        }, 'Says something to every server.'));

        consoleCommands.push(new CustomCommand('ping', (split) =>
        {
            console.log('pong');
        }, 'Pong'));

        consoleCommands.push(new CustomCommand('stop', (split) =>
        {
            client.destroy();
            running = false;
        }, 'Exits the bot'));

        consoleCommands.push(new CustomCommand('restart', (split) =>
        {
            client.destroy();
            client.login(auth.token);
            console.log('Restarted!');
        }, 'Logs out then logs back in'));
    }
})();

/**
 * Handles a command given in through the console
 * @param {string} cmd 
 */
function handleCommand(cmd)
{
    let split = cmd.split(' ');
    let command = split[0].toLowerCase();

    let done = false;

    for(let i = 0; i < consoleCommands.length; i++)
    {
        let customCommand = consoleCommands[i];

        for(let j = 0; j < customCommand.name.length; j++)
        {
            let name = customCommand.name[j];

            if(name.toLowerCase() === command.toLowerCase())
            {
                customCommand.call(split, cmd, command);
                done = true;
                break;
            }
        }

        if(done)
            break;
    }
}

client.on('message', msg =>
{
    if (msg.content.charAt(0) == '?')
    {
        const msgRaw = msg.content.substring(1);

        let split = msgRaw.split(' ');

        const cmd = split[0].toLowerCase();

        let done = false;

        for(let i = 0; i < discordCommands.length; i++)
        {
            let customCommand = discordCommands[i];

            for(let j = 0; j < customCommand.name.length; j++)
            {
                let name = customCommand.name[j];

                if(name.toLowerCase() === cmd.toLowerCase())
                {
                    customCommand.call(msg);
                    done = true;
                    break;
                }
            }

            if(done)
                break;
        }
    }

    if (msg.content.toLocaleLowerCase().includes('gravity'))
    {
        msg.guild.fetchMember(msg.author).then(member => {
            kick(member, 'blasphemy', msg.channel);
        });
    }
});

/**
 * 
 * @param {GuildUser} member 
 * @param {string} reason 
 * @param {Channel} channel 
 */
function kick(member, reason, channel)
{
    if (member.kickable)
    {
        channel.createInvite(
        { temporary: false, maxAge: 0, maxUses: 100, unique: false, reasons: 'Reinviting a blasphemer' }, 'Reinviting a blasphemer').then(invite =>
            {
                channel.send(`<@${member.id}> has been kicked for ${reason}.`);
                member.send(`You have been kicked from the server for ${reason}. Once you have learned your lesson, use the invite link here: https://discord.gg/${invite.code}`).then(() =>
                {
                    member.kick(reason);
                });
            }).catch(err =>
            {
                channel.send(`<@${member.id}> - **YOU HAVE BEEN GRANTED MERCY FOR YOUR BLASPHEMY. NEXT TIME, YOU MAY NOT BE SO LUCKY!**`);
                logger.info(err);
            });
    }
    else
        channel.send(`<@${member.id}> - **Due to your status in the Church of Wind, your blasphemy has been forgiven. Be more careful next time.**`);
}

// F to celcius
function tF(c) { return c * 9.0 / 5.0 + 32; }

function send(msg, channel)
{
    channel.send(msg).catch(ex => console.log(ex));
}

function sendFile(file, channel)
{
    channel.send({files: [file]});
}

function getMentioned(msg)
{
    let mentioned = [];
    msg.mentions.users.forEach(val => mentioned.push(val));
    return mentioned;
}

client.login(auth.token);

client.on('error', () => { console.log('Some random error just occurred.'); });

// https://discordapp.com/oauth2/authorize?client_id=518474890614145067&scope=bot&permissions=8