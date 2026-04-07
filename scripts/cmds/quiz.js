module.exports = {
  config: {
    name: "quiz",
    version: "6.0",
    author: "ChatGPT ELITE",
    countDown: 3,
    role: 0,
    shortDescription: "🧠 Ultimate Quiz",
    longDescription: "Quiz with flag, anime & true/false modes",
    category: "game",
    guide: "{pn} [easy|medium|hard|flag|anime|torf]"
  },

  onStart: async function ({ message, event, args, usersData }) {
    const userId = event.senderID;
    let mode = (args[0] || "easy").toLowerCase();

    let user = await usersData.get(userId);
    let xp = user.xp || 0;
    let level = user.level || 1;
    let streak = user.streak || 0;

    // 📚 QUIZ DATABASE
    const quizData = {

      easy: [
        { q: "2 + 2 = ?", o: ["A. 3", "B. 4", "C. 5", "D. 6"], a: "B" }
      ],

      medium: [
        { q: "12 x 12 = ?", o: ["A. 144", "B. 124", "C. 132", "D. 154"], a: "A" }
      ],

      hard: [
        { q: "√256 = ?", o: ["A. 14", "B. 15", "C. 16", "D. 18"], a: "C" }
      ],

      // 🌍 FLAG QUIZ
      flag: [
        { q: "🇯🇵 Which country is this?", o: ["A. China", "B. Japan", "C. Korea", "D. Vietnam"], a: "B" },
        { q: "🇿🇦 Which country is this?", o: ["A. Nigeria", "B. Kenya", "C. South Africa", "D. Ghana"], a: "C" },
        { q: "🇺🇸 Which country is this?", o: ["A. UK", "B. USA", "C. Canada", "D. Australia"], a: "B" }
      ],

      // 🎌 ANIME QUIZ
      anime: [
        { q: "Who is Naruto’s rival?", o: ["A. Luffy", "B. Sasuke", "C. Goku", "D. Ichigo"], a: "B" },
        { q: "Anime with Titans?", o: ["A. Naruto", "B. One Piece", "C. Attack on Titan", "D. Bleach"], a: "C" },
        { q: "Who is Goku’s son?", o: ["A. Gohan", "B. Vegeta", "C. Naruto", "D. Luffy"], a: "A" }
      ],

      // ✅❌ TRUE OR FALSE
      torf: [
        { q: "The earth is flat.", o: ["A. True", "B. False"], a: "B" },
        { q: "Water boils at 100°C.", o: ["A. True", "B. False"], a: "A" },
        { q: "2 + 2 = 5", o: ["A. True", "B. False"], a: "B" }
      ]
    };

    if (!quizData[mode]) mode = "easy";

    const questions = quizData[mode];
    const q = questions[Math.floor(Math.random() * questions.length)];

    let quizText = `🧠👑 QUIZ MODE: ${mode.toUpperCase()}
━━━━━━━━━━━━━━
${q.q}

${q.o.join("\n")}
━━━━━━━━━━━━━━
Reply with your answer`;

    return message.reply(quizText, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "quiz",
        author: userId,
        answer: q.a,
        mode: mode
      });
    });
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    const userId = event.senderID;

    if (userId !== Reply.author) {
      return message.reply("❌ Not your quiz!");
    }

    let userAnswer = event.body.trim().toUpperCase();
    let correct = Reply.answer;

    let user = await usersData.get(userId);

    let money = user.money || 0;
    let xp = user.xp || 0;
    let level = user.level || 1;
    let streak = user.streak || 0;

    let baseReward = {
      easy: 50,
      medium: 150,
      hard: 300,
      flag: 120,
      anime: 150,
      torf: 80
    };

    let reward = baseReward[Reply.mode] || 50;

    let result = `🧠 RESULT
━━━━━━━━━━━━━━
`;

    if (userAnswer === correct) {
      streak++;

      let streakBonus = streak * 10;
      reward += streakBonus;

      // 🎲 RANDOM EVENTS
      let roll = Math.random();

      if (roll < 0.15) {
        let bonus = Math.floor(reward * 0.5);
        reward += bonus;
        result += `🎁 BONUS +${bonus}\n`;
      } else if (roll > 0.9) {
        let curse = Math.floor(reward * 0.3);
        reward -= curse;
        result += `👹 CURSE -${curse}\n`;
      }

      money += reward;

      // XP
      let xpGain = reward / 2;
      xp += xpGain;

      let nextLevel = level * 200;

      if (xp >= nextLevel) {
        xp -= nextLevel;
        level++;
        result += `🚀 LEVEL UP → ${level}\n`;
      }

      result += `✅ Correct!\n🔥 Streak: ${streak}\n💰 +${reward}`;

    } else {
      result += `❌ Wrong!\n✔ Answer: ${correct}`;
      streak = 0;
    }

    await usersData.set(userId, {
      money,
      xp,
      level,
      streak
    });

    result += `\n━━━━━━━━━━━━━━
💳 ${money} coins
⭐ XP: ${xp}/${level * 200}
🏆 Level: ${level}`;

    return message.reply(result);
  }
};
