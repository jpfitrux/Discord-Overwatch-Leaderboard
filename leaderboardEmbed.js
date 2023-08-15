const { EmbedBuilder } = require("discord.js");
const {
  getPlayerData,
  getAverageSkillRating,
  getSkillRating,
  roleRankString,
} = require("./overwatchData");

/**
 *
 * @param {string} title
 * @param {import("@prisma/client").Account[]} accounts
 * @param {boolean} splitRoles
 */
async function leaderboardEmbeds(title, accounts, splitRoles) {
  if (accounts.length === 0) {
    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription("Empty :pensive:")
      .setTimestamp();
    return [embed];
  } else {
    const rankPromises = [];
    const ranksArray = [];
    // for (const account of accounts) {
    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      // rankPromises.push(getPlayerData(account.playerId));

      setTimeout(async () => {
        console.log("Delayed for 1 second.");
        const rank = await getPlayerData(account.playerId);
        ranksArray.push(rank);
        console.log("rank", rank);
      }, 1000 * i);
    }

    const ranks = await Promise.allSettled(rankPromises);

    const rankedAccounts = accounts.map((a, i) => ({
      ...a,
      rank: ranksArray[i],
    }));

    console.log("rankedAccounts", rankedAccounts);

    const roles = ["tank", "damage", "support"];
    const embeds = [];

    for (const role of roles) {
      const embed = new EmbedBuilder()
        .setTitle(title + ": " + role)
        .setTimestamp();

      rankedAccounts.sort((a, b) => {
        return getSkillRating(a.rank?.[role]) < getSkillRating(b.rank?.[role])
          ? 1
          : -1;
      });

      for (let i = 0; i < rankedAccounts.length; i++) {
        const acc = rankedAccounts[i];
        embed.addFields({
          name: posString(i + 1),
          value: `${acc.battleTag} - ${roleRankString(acc.rank?.[role])}`,
        });
      }

      embeds.push(embed);
    }
    return embeds;

    if (splitRoles) {
    } else {
      const embed = new EmbedBuilder().setTitle(title).setTimestamp();

      rankedAccounts.sort((a, b) => {
        return (
          getAverageSkillRating(a.rank) ??
          -1 > getAverageSkillRating(b.rank) ??
          -1
        );
      });

      for (let i = 0; i < rankedAccounts.length; i++) {
        const acc = rankedAccounts[i];
        embed.addFields({
          name: posString(i + 1),
          value: `${acc.battleTag} - 🛡️ ${roleRankString(
            acc.rank?.tank
          )} - ⚔️ ${roleRankString(acc.rank?.damage)} - 💉 ${roleRankString(
            acc.rank?.support
          )}`,
        });
      }
      return [embed];
    }
  }
}

/**
 *
 * @param {string?} title
 * @param {string} guildName
 */
function embedTitle(title, guildName) {
  if (title) return title;

  return `${guildName} Overwatch Leaderboard`;
}

/**
 *
 * @param {number} pos
 * @returns {string}
 */
function posString(pos) {
  const EMOJI = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };
  return EMOJI[pos] || pos.toString();
}

module.exports = { leaderboardEmbeds, embedTitle };
