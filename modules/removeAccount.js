const Discord = require('discord.js');
const { Accounts, Leaderboards } = require("../dbObjects");

module.exports.run = async (bot, message, args) => {
    if (args[0]) {
        if (args[0] === "all") {
            Leaderboards.findAll({
                where: {
                    guild_id: message.guild.id,
                    user_id: message.author.id,
                }
            }).then((entries) => {
                for (let i = 0; i < entries.length; i++) {
                    const btag = entries[i].battleTag;
                    deleteBtag(btag).then(() => {
                        tryDeleteAccount(btag);
                    }).catch((error) => {
                        console.log("Error deleting " + btag);
                        console.error(error);
                    });
                }
                message.reply("All you accounts were removed");
            });
        } else {
            const btag = args[0].replace('#', '-');
            deleteBtag(btag).then((result) => {
                if (result == 0) message.reply("Account could not be find or is not yours");
                else {
                    console.log("Unlinked account " + btag);
                    tryDeleteAccount(btag);
                    message.reply("Your account was removed from the leaderboard");
                }
            }).catch((error) => {
                console.log("Error deleting " + btag);
                console.error(error);
            });
        }
    } else return message.reply(usage);

    function deleteBtag(btag) {
        return Leaderboards.destroy({
            where: {
                guild_id: message.guild.id,
                user_id: message.author.id,
                battleTag: btag
            }
        });
    }
    function tryDeleteAccount(btag) {
        Leaderboards.count({
            where: {
                battleTag: btag
            }
        }).then((count) => {
            if (count == 0) {
                Accounts.destroy({
                    where: {
                        battleTag: btag
                    }
                });
                console.log("Removed " + btag);
            }
        });
    }
}

module.exports.help = {
    name: 'removeAccount',
    command: true,
    usage: "removeAccount [battletag]; or: removeAccount all",
    description: "Delete your data and you will no longer appear in the leaderboard."
}
