// 이미 존재하는 경우 제거하지 않고, 중복되지 않도록 정리
const fs = require('fs'); // ✅ 선언은 한 번만!

if (process.env.GOOGLE_CREDENTIALS) {
  fs.writeFileSync('credentials.json', process.env.GOOGLE_CREDENTIALS);
}

// 📦 필요한 모듈 불러오기
const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  Events,
} = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const userStates = new Map();

// 🌐 다국어 질문 목록
const QUESTIONS = {
  ko: [
    '🎮 인게임 ID를 입력해주세요. 정확하게 입력해주세요.',
    '🏠 기지 CP를 숫자로 입력해주세요',
    '💼 직업을 선택해주세요 (CE/MM)',
    '🪖 1군 병과를 선택해주세요',
    '🪖 2군 병과를 선택해주세요 (없을 경우 None)',
    '🪖 3군 병과를 선택해주세요 (없을 경우 None)',
    '⚔️ 주력부대 CP를 숫자로 입력해주세요',
    '⚙️ 2군 부대 CP를 숫자로 입력해주세요',
    '🛡️ 3군 부대 CP를 숫자로 입력해주세요',
    '👥 함께 서버이전을 하는 그룹이 있나요?',
    '👤 그룹 리더는 누구인가요? (본인 or 직접 입력)',
    '📌 서버 운영 상황에 따라 직업 변경이 필요할 경우, 수용하시겠습니까?'
  ],
  en: [
    '🎮 Please enter your In-Game ID accurately.',
    '🏠 Enter base CP as a number',
    '💼 Select your job (CE/MM)',
    '🪖 Select 1st branch',
    '🪖 Select 2nd branch (or None)',
    '🪖 Select 3rd branch (or None)',
    '⚔️ Enter main unit CP (number)',
    '⚙️ Enter 2nd unit CP (number)',
    '🛡️ Enter 3rd unit CP (number)',
    '👥 Is there a group transferring with you?',
    '👤 Who is the group leader? (Yourself or enter manually)',
    '📌 If your job needs to be changed based on server needs, are you willing to accept it?'
  ],
  ja: [
    '🎮 ゲーム内IDを正確に入力してください。',
    '🏠 基地CPを数字で入力してください',
    '💼 職業を選択してください（CE/MM）',
    '🪖 第1兵科を選択してください',
    '🪖 第2兵科を選択してください（ない場合はNone）',
    '🪖 第3兵科を選択してください（ない場合はNone）',
    '⚔️ 主力部隊のCPを入力してください',
    '⚙️ 第2部隊のCPを入力してください',
    '🛡️ 第3部隊のCPを入力してください',
    '👥 一緒にサーバー移転するグループはありますか？',
    '👤 グループリーダーは誰ですか？（本人または直接入力）',
    '📌 サーバーの都合で職業変更が必要な場合、同意しますか？'
  ],
  zh: [
    '🎮 请准确输入您的游戏内ID。',
    '🏠 请输入基地CP（数字）',
    '💼 请选择您的职业（CE/MM）',
    '🪖 请选择第一兵种',
    '🪖 请选择第二兵种（没有则选None）',
    '🪖 请选择第三兵种（没有则选None）',
    '⚔️ 请输入主力部队CP（数字）',
    '⚙️ 请输入第二部队的CP（数字）',
    '🛡️ 请输入第三部队的CP（数字）',
    '👥 是否有与您一起转服的组？',
    '👤 谁是组长？（选择本人或输入名字）',
    '📌 若服务器运营需要变更职业，您是否接受？'
  ],
  th: [
    '🎮 กรุณาใส่ ID ในเกมให้ถูกต้อง',
    '🏠 ใส่ CP ฐาน (ตัวเลข)',
    '💼 เลือกอาชีพ (CE/MM)',
    '🪖 เลือกเหล่าทัพที่ 1',
    '🪖 เลือกเหล่าทัพที่ 2 (หากไม่มีเลือก None)',
    '🪖 เลือกเหล่าทัพที่ 3 (หากไม่มีเลือก None)',
    '⚔️ ใส่ CP ของหน่วยหลัก (ตัวเลข)',
    '⚙️ กรุณาใส่ CP ของกองรบที่ 2',
    '🛡️ กรุณาใส่ CP ของกองรบที่ 3',
    '👥 มีกลุ่มที่ย้ายเซิร์ฟเวอร์พร้อมกันหรือไม่?',
    '👤 ใครเป็นหัวหน้ากลุ่ม? (ตนเอง หรือ พิมพ์ชื่อ)',
    '📌 หากจำเป็นต้องเปลี่ยนอาชีพตามสถานการณ์เซิร์ฟเวอร์ คุณยอมรับหรือไม่?'
  ],
  vi: [
    '🎮 Vui lòng nhập chính xác ID trong game.',
    '🏠 Nhập CP căn cứ (bằng số)',
    '💼 Chọn nghề nghiệp (CE/MM)',
    '🪖 Chọn binh chủng thứ nhất',
    '🪖 Chọn binh chủng thứ hai (hoặc None)',
    '🪖 Chọn binh chủng thứ ba (hoặc None)',
    '⚔️ Nhập CP đơn vị chính (bằng số)',
    '⚙️ Nhập CP đơn vị thứ 2',
    '🛡️ Nhập CP đơn vị thứ 3',
    '👥 Có nhóm nào chuyển máy chủ cùng bạn không?',
    '👤 Ai là trưởng nhóm? (Chính bạn hoặc nhập tên)',
    '📌 Nếu cần thay đổi nghề theo yêu cầu của máy chủ, bạn có đồng ý không?'
  ],
  ru: [
    '🎮 Пожалуйста, введите точный игровой ID.',
    '🏠 Введите базовый CP числом',
    '💼 Выберите свою роль (CE/MM)',
    '🪖 Выберите первую ветвь',
    '🪖 Выберите вторую ветвь (или None)',
    '🪖 Выберите третью ветвь (или None)',
    '⚔️ Введите CP основной части (число)',
    '⚙️ Введите CP второго отряда',
    '🛡️ Введите CP третьего отряда',
    '👥 Есть ли у вас группа, которая также переходит на сервер?',
    '👤 Кто лидер группы? (Вы или ввести вручную)',
    '📌 Если потребуется смена профессии по требованию сервера, вы согласны?'
  ],
  es: [
    '🎮 Por favor, ingresa tu ID del juego con precisión.',
    '🏠 Ingresa el CP de la base (en número)',
    '💼 Selecciona tu rol (CE/MM)',
    '🪖 Selecciona la primera rama',
    '🪖 Selecciona la segunda rama (o None)',
    '🪖 Selecciona la tercera rama (o None)',
    '⚔️ Ingresa el CP de la unidad principal (en número)',
    '⚙️ Ingresa el CP de la 2ª unidad',
    '🛡️ Ingresa el CP de la 3ª unidad',
    '👥 ¿Hay un grupo transfiriéndose contigo?',
    '👤 ¿Quién es el líder del grupo? (Tú u otra persona)',
    '📌 ¿Estás dispuesto a aceptar un cambio de rol si lo requiere el servidor?'
  ]
};

const GROUP_LEADER_CHOICES = {
  ko: { self: '본인', manual: '직접입력' },
  en: { self: 'Yourself', manual: 'Enter manually' },
  ja: { self: '本人', manual: '直接入力' },
  zh: { self: '本人', manual: '手动输入' },
  th: { self: 'ตนเอง', manual: 'ป้อนชื่อด้วยตนเอง' },
  vi: { self: 'Chính bạn', manual: 'Nhập thủ công' },
  ru: { self: 'Вы', manual: 'Ввести вручную' },
  es: { self: 'Tú', manual: 'Escribir manualmente' }
};

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 📤 Google Sheets 연동 준비
const { google } = require('googleapis');
const fs = require('fs');

async function appendToSheet(data) {
  try {
    console.log('📤 시트에 전송할 데이터:', data);

    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
 
    // 기존 client와 변수명이 겹쳐 충돌 → 다른 이름 사용
    const sheetsAuth = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: sheetsAuth });

    const spreadsheetId = process.env.SHEET_ID;
    if (!spreadsheetId) {
      console.error('❌ .env 파일에 SHEET_ID가 설정되지 않았습니다.');
      return;
    }

    const res = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [data],
      },
    });

    console.log('✅ 시트 저장 성공:', res.statusText || res.status);
  } catch (error) {
    console.error('❌ 시트 저장 실패:', error.message);
    if (error.response?.data) {
      console.error('🔍 상세 오류:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// 📥 인터랙션 처리
client.on(Events.InteractionCreate, async interaction => {
  const userId = interaction.user.id;

// /transfer 명령어 입력 시 언어 선택
if (interaction.isChatInputCommand() && interaction.commandName === 'transfer') {
  const languageMenu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('select-language')
      .setPlaceholder('언어를 선택해주세요 / Please select your language')
      .addOptions([
        { label: '🇰🇷 한국어', value: 'ko' },
        { label: '🇺🇸 English', value: 'en' },
        { label: '🇯🇵 日本語', value: 'ja' },
        { label: '🇨🇳 中文', value: 'zh' },
        { label: '🇹🇭 ไทย', value: 'th' },
        { label: '🇻🇳 Tiếng Việt', value: 'vi' },
        { label: '🇷🇺 Русский', value: 'ru' },
        { label: '🇪🇸 Español', value: 'es' }
      ])
  );

  await interaction.reply({
    content: '언어를 선택해주세요 / Please select your language.',
    components: [languageMenu],
    ephemeral: true
  });
}


  // 언어 선택 시 인게임 ID + 기지 CP 입력
  if (interaction.isStringSelectMenu() && interaction.customId === 'select-language') {
    const selectedLanguage = interaction.values[0];
    const q = QUESTIONS[selectedLanguage];

    userStates.set(userId, { language: selectedLanguage });

    const modal = new ModalBuilder()
      .setCustomId('form-step1')
      .setTitle('📋 서버 이전 신청');

    const inputID = new TextInputBuilder()
      .setCustomId('ingame-id')
      .setLabel(q[0])
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const inputBaseCP = new TextInputBuilder()
      .setCustomId('base-cp')
      .setLabel(q[1])
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(inputID),
      new ActionRowBuilder().addComponents(inputBaseCP)
    );

    await interaction.showModal(modal);
  }

  // 모달 1단계 처리 (인게임 ID + 기지 CP) 후 1군 병과 선택
  if (interaction.isModalSubmit() && interaction.customId === 'form-step1') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];

    userStates.set(userId, {
      ...state,
      ingameID: interaction.fields.getTextInputValue('ingame-id'),
      baseCP: interaction.fields.getTextInputValue('base-cp')
    });

    const branch1Menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select-branch1')
        .setPlaceholder(q[3])
        .addOptions(['army', 'navy', 'airforce'].map(b => ({ label: b, value: b })))
    );

    await interaction.reply({
      content: q[3],
      components: [branch1Menu],
      ephemeral: true,
    });
  }


  // 병과 선택 후 주력부대 CP 입력 모달
  if (interaction.isStringSelectMenu() && interaction.customId === 'select-branch1') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const branch1 = interaction.values[0];

    userStates.set(userId, { ...state, branch1 });

    const modal = new ModalBuilder()
      .setCustomId('form-main-cp')
      .setTitle(q[6]);

    const input = new TextInputBuilder()
      .setCustomId('main-cp')
      .setLabel(q[6])
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  }

  // 주력부대 CP 입력 완료 후 직업 선택
  if (interaction.isModalSubmit() && interaction.customId === 'form-main-cp') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const mainCP = interaction.fields.getTextInputValue('main-cp');

    userStates.set(userId, { ...state, mainCP });

    const jobMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select-job')
        .setPlaceholder(q[2])
        .addOptions([ { label: 'CE', value: 'ce' }, { label: 'MM', value: 'mm' } ])
    );

    await interaction.reply({
      content: q[2],
      components: [jobMenu],
      ephemeral: true,
    });
  }

  // 2군 병과 선택 → 조건부 CP 입력
  if (interaction.isStringSelectMenu() && interaction.customId === 'select-job') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const job = interaction.values[0];

    userStates.set(userId, { ...state, job });

    const branch2Menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select-branch2')
        .setPlaceholder(q[4])
        .addOptions([
          { label: 'Army', value: 'army' },
          { label: 'Navy', value: 'navy' },
          { label: 'Airforce', value: 'airforce' },
          { label: 'None', value: 'none' }
        ])
    );

    await interaction.reply({
      content: q[4],
      components: [branch2Menu],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select-branch2') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const branch2 = interaction.values[0];

    userStates.set(userId, { ...state, branch2 });

    if (branch2 !== 'none') {
      const modal = new ModalBuilder()
        .setCustomId('form-cp-2nd')
        .setTitle(q[7]);

      const input = new TextInputBuilder()
        .setCustomId('cp-2nd')
        .setLabel(q[7])
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    } else {
      // 바로 3군 병과 선택으로 넘어감
      const branch3Menu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select-branch3')
          .setPlaceholder(q[5])
          .addOptions([
            { label: 'Army', value: 'army' },
            { label: 'Navy', value: 'navy' },
            { label: 'Airforce', value: 'airforce' },
            { label: 'None', value: 'none' }
          ])
      );

      await interaction.reply({
        content: q[5],
        components: [branch3Menu],
        ephemeral: true
      });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'form-cp-2nd') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const cp2nd = interaction.fields.getTextInputValue('cp-2nd');

    userStates.set(userId, { ...state, cp2nd });

    const branch3Menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select-branch3')
        .setPlaceholder(q[5])
        .addOptions([
          { label: 'Army', value: 'army' },
          { label: 'Navy', value: 'navy' },
          { label: 'Airforce', value: 'airforce' },
          { label: 'None', value: 'none' }
        ])
    );

    await interaction.reply({
      content: q[5],
      components: [branch3Menu],
      ephemeral: true
    });
  }

  // 3군 병과 선택 후 CP 조건부 입력
  if (interaction.isStringSelectMenu() && interaction.customId === 'select-branch3') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const branch3 = interaction.values[0];

    userStates.set(userId, { ...state, branch3 });

    if (branch3 !== 'none') {
      const modal = new ModalBuilder()
        .setCustomId('form-cp-3rd')
        .setTitle(q[8]);

      const input = new TextInputBuilder()
        .setCustomId('cp-3rd')
        .setLabel(q[8])
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    } else {
      // 바로 그룹 이전 여부로 이동
      const groupMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select-group')
          .setPlaceholder(q[9])
          .addOptions([
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
          ])
      );

      await interaction.reply({
        content: q[9],
        components: [groupMenu],
        ephemeral: true
      });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'form-cp-3rd') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const cp3rd = interaction.fields.getTextInputValue('cp-3rd');

    userStates.set(userId, { ...state, cp3rd });

    const groupMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select-group')
        .addOptions([
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ])
    );

    await interaction.reply({
      content: q[9],
      components: [groupMenu],
      ephemeral: true
    });
  }

  // 그룹 리더 선택 및 직업 변경 동의로 진행

  if (interaction.isStringSelectMenu() && interaction.customId === 'select-group') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const group = interaction.values[0];
    userStates.set(userId, { ...state, group });

    if (group === 'yes') {
      const choices = GROUP_LEADER_CHOICES[state.language] || GROUP_LEADER_CHOICES['en'];
      const leaderMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select-leader')
          .setPlaceholder(q[10])
          .addOptions([
            { label: choices.self, value: 'self' },
            { label: choices.manual, value: 'manual' }
          ])
      );
      await interaction.reply({ content: q[10], components: [leaderMenu], ephemeral: true });
    } else {
      const agreeMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select-agree')
          .setPlaceholder(q[11])
          .addOptions([
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
          ])
      );
      await interaction.reply({ content: q[11], components: [agreeMenu], ephemeral: true });
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select-leader') {
    const state = userStates.get(userId);
    const q = QUESTIONS[state.language];
    const leader = interaction.values[0];

    if (leader === 'manual') {
      const modal = new ModalBuilder()
        .setCustomId('form-leader-name')
        .setTitle('👤 그룹 리더');

      const input = new TextInputBuilder()
        .setCustomId('leader-name')
        .setLabel(' ')
        .setPlaceholder(q[10])
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    } else {
      userStates.set(userId, { ...state, groupLeader: leader });
      const agreeMenu = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select-agree')
          .setPlaceholder(q[11])
          .addOptions([
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' }
          ])
      );
      await interaction.reply({ content: q[11], components: [agreeMenu], ephemeral: true });
    }
  }

  if (interaction.isModalSubmit() && interaction.customId === 'form-leader-name') {
    const state = userStates.get(userId);
    const name = interaction.fields.getTextInputValue('leader-name');
    userStates.set(userId, { ...state, groupLeader: name });
    const q = QUESTIONS[state.language];

    const agreeMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('select-agree')
        .setPlaceholder(q[11])
        .addOptions([
          { label: 'Yes', value: 'yes' },
          { label: 'No', value: 'no' }
        ])
    );
    await interaction.reply({ content: q[11], components: [agreeMenu], ephemeral: true });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select-agree') {
    const state = userStates.get(userId);
    const agree = interaction.values[0];
    userStates.set(userId, { ...state, agree });
    const q = QUESTIONS[state.language];

    const embed = {
      title: '📋 신청 정보 요약',
      color: 0x00cc99,
      fields: [
        { name: q[0], value: state.ingameID || 'N/A' },
        { name: q[1], value: state.baseCP || 'N/A' },
        { name: q[2], value: state.job || 'N/A' },
        { name: q[3], value: state.branch1 || 'N/A' },
        { name: q[6], value: state.mainCP || 'N/A' },
        { name: q[4], value: state.branch2 || 'None' },
        { name: q[7], value: state.cp2nd || 'N/A' },
        { name: q[5], value: state.branch3 || 'None' },
        { name: q[8], value: state.cp3rd || 'N/A' },
        { name: q[9], value: state.group || 'No' },
        { name: q[10], value: state.group === 'yes' ? (state.groupLeader || 'N/A') : 'N/A' },
        { name: q[11], value: agree || 'N/A' }
      ]
    };

    await interaction.reply({
      content: '✅ 신청이 완료되었습니다! 아래는 입력하신 정보입니다.',
      embeds: [embed],
      ephemeral: true
    });
    
    await appendToSheet([
      state.language,
      state.ingameID,
      state.baseCP,
      state.job,
      state.branch1,
      state.branch2 || '',
      state.branch3 || '',
      state.mainCP,
      state.cp2 || '',
      state.cp3 || '',
      state.group,
      state.group === 'yes' ? (state.groupLeader || '') : '',
      agree
    ]);
    
    console.log('📋 최종 접수 정보:', userStates.get(userId));
  }


});

client.login(process.env.DISCORD_TOKEN);
