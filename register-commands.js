const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const commands = [
  new SlashCommandBuilder()
    .setName('transfer')
    .setDescription('서버 이전 신청을 시작합니다.')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// 여기에 본인이 봇을 초대한 서버 ID 넣기!
const CLIENT_ID = '1359864330207891628';
const GUILD_ID = '1264101526805413939';

(async () => {
  try {
    console.log('📤 슬래시 명령어 등록 중...');

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log('✅ 등록 완료!');
  } catch (error) {
    console.error(error);
  }
})();
