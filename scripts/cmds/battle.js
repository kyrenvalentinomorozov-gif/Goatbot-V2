module.exports = {
  config: {
    name: "battle",
    version: "5.0",
    author: "ChatGPT RPG GOD MODE",
    role: 0,
    countDown: 5,
    shortDescription: "⚔️ RPG PvP Battle",
    longDescription: "Turn-based RPG battle system with skills, items, XP, and leveling",
    category: "game",
    guide: "{pn} @user"
  },

  onStart: async function ({ message, event, usersData }) {
    const challenger = event.senderID;
    const opponent = Object.keys(event.mentions)[0];

    if (!opponent) return message.reply("⚠️ Tag someone to battle!");
    if (challenger === opponent) return message.reply("❌ You can't battle yourself!");

    // 🧙 GET PLAYER DATA OR INIT
    let player1 = await usersData.get(challenger) || {
      hp: 100, atk: 20, def: 10, xp: 0, level: 1, coins: 500, inventory: []
    };
    let player2 = await usersData.get(opponent) || {
      hp: 100, atk: 20, def: 10, xp: 0, level: 1, coins: 500, inventory: []
    };

    // 🏹 SKILLS
    const skills = [
      { name: "Slash", damage: 15, type: "physical" },
      { name: "Fireball", damage: 20, type: "magic" },
      { name: "Heal", heal: 25, type: "heal" }
    ];

    let log = `⚔️ GOD MODE RPG BATTLE
━━━━━━━━━━━━━━
👤 ${challenger} vs ${opponent}
━━━━━━━━━━━━━━\n`;

    // 🔄 TURN LOOP
    let turn = 1;
    while (player1.hp > 0 && player2.hp > 0) {

      log += `\n🔹 Turn ${turn}\n`;

      // Player 1 action
      let skill1 = skills[Math.floor(Math.random() * skills.length)];
      if (skill1.type === "heal") {
        player1.hp += skill1.heal;
        if (player1.hp > 100) player1.hp = 100;
        log += `👤 ${challenger} uses ${skill1.name} and heals ${skill1.heal} HP\n`;
      } else {
        let dmg = skill1.damage + player1.atk - player2.def;
        dmg = dmg < 0 ? 0 : dmg;
        player2.hp -= dmg;
        log += `👤 ${challenger} uses ${skill1.name} and deals ${dmg} damage\n`;
        if (player2.hp <= 0) break;
      }

      // Player 2 action
      let skill2 = skills[Math.floor(Math.random() * skills.length)];
      if (skill2.type === "heal") {
        player2.hp += skill2.heal;
        if (player2.hp > 100) player2.hp = 100;
        log += `👤 ${opponent} uses ${skill2.name} and heals ${skill2.heal} HP\n`;
      } else {
        let dmg = skill2.damage + player2.atk - player1.def;
        dmg = dmg < 0 ? 0 : dmg;
        player1.hp -= dmg;
        log += `👤 ${opponent} uses ${skill2.name} and deals ${dmg} damage\n`;
      }

      log += `💖 HP: ${challenger} ${player1.hp} | ${opponent} ${player2.hp}\n`;
      turn++;
      if (turn > 20) break; // Max 20 turns safety
    }

    // 🏆 DETERMINE WINNER
    let winner, loser;
    if (player1.hp > player2.hp) {
      winner = challenger;
      loser = opponent;
    } else if (player2.hp > player1.hp) {
      winner = opponent;
      loser = challenger;
    } else {
      winner = null; // draw
    }

    let reward = 200;
    if (winner) {
      let winnerData = await usersData.get(winner) || {};
      winnerData.coins = (winnerData.coins || 0) + reward;
      winnerData.xp = (winnerData.xp || 0) + 50;

      let nextLevel = (winnerData.level || 1) * 100;
      if (winnerData.xp >= nextLevel) {
        winnerData.level = (winnerData.level || 1) + 1;
        winnerData.xp -= nextLevel;
        log += `\n🚀 ${winner} leveled up to level ${winnerData.level}!\n`;
      }

      await usersData.set(winner, winnerData);
      log += `\n🏆 Winner: ${winner} +${reward} coins, +50 XP`;
    } else {
      log += `\n⚖️ The battle ended in a draw!`;
    }

    // Save loser HP for next battle
    await usersData.set(challenger, player1);
    await usersData.set(opponent, player2);

    return message.reply(log);
  }
};
