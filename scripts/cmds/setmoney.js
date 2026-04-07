module.exports = {
  config: {
    name: "setmoney",
    version: "2.0",
    author: "ChatGPT",
    countDown: 5,
    role: 2, // 👑 Admin only
    shortDescription: "💰 Manage user money",
    longDescription: "Set, add, or remove money from users",
    category: "admin",
    guide: "{pn} [set/add/remove] [amount] [@user]"
  },

  onStart: async function ({ message, event, args, usersData }) {

    let action = args[0];
    let amount = parseInt(args[1]);

    let targetID = Object.keys(event.mentions)[0] || event.senderID;

    if (!action || !amount) {
      return message.reply(
        "⚠️ Usage:\n" +
        "setmoney set 1000 @user\n" +
        "setmoney add 500 @user\n" +
        "setmoney remove 200 @user"
      );
    }

    let user = await usersData.get(targetID);
    let money = user.money || 0;

    let result = "";

    switch (action.toLowerCase()) {

      case "set":
        money = amount;
        result = `💰 Set money to ${amount}`;
        break;

      case "add":
        money += amount;
        result = `➕ Added ${amount}`;
        break;

      case "remove":
        money -= amount;
        if (money < 0) money = 0;
        result = `➖ Removed ${amount}`;
        break;

      default:
        return message.reply("❌ Invalid action. Use set/add/remove.");
    }

    await usersData.set(targetID, { money });

    return message.reply(
      `💰 MONEY UPDATED
━━━━━━━━━━━━━━
👤 User: ${targetID}
${result}
💳 Balance: ${money}`
    );
  }
};
