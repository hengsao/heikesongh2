import type { AIApiConfig, AIPreferences, LifeCard, LifeTask, ReviewPeriod } from "../types";

export type LifeCardAiInput = {
  title: string;
  category: string;
  note: string;
  moodText: string;
  preferences: AIPreferences;
  aiMode: "mock" | "api";
};

export type ImageGenerationInput = LifeCardAiInput & {
  shouldGenerateImage: boolean;
};

const defaultRuntimeConfig: AIApiConfig = {
  textApiBase: import.meta.env.VITE_AI_TEXT_API_BASE ?? "",
  textApiKey: import.meta.env.VITE_AI_TEXT_API_KEY ?? "",
  textModel: import.meta.env.VITE_AI_TEXT_MODEL ?? "gpt-4o-mini",
  imageApiBase: import.meta.env.VITE_AI_IMAGE_API_BASE ?? "",
  imageApiKey: import.meta.env.VITE_AI_IMAGE_API_KEY ?? "",
  imageModel: import.meta.env.VITE_AI_IMAGE_MODEL ?? "gpt-image-1",
};

export async function generateLifeCardText(input: LifeCardAiInput) {
  const prompt = buildLifeCardPrompt(input);
  if (canUseTextApi(input.aiMode)) {
    try {
      return await callTextApi(prompt, input.preferences);
    } catch (error) {
      console.warn("AI text API failed, falling back to mock.", error);
    }
  }
  return mockLifeCardText(input);
}

export async function generateCardImage(input: ImageGenerationInput) {
  if (!input.shouldGenerateImage) return undefined;
  const prompt = buildImagePrompt(input);
  if (canUseImageApi(input.aiMode)) {
    try {
      return await callImageApi(prompt);
    } catch (error) {
      console.warn("AI image API failed, falling back to generated placeholder.", error);
    }
  }
  return buildGradientDataImage(input);
}

export async function generateReviewSummary(input: {
  cards: LifeCard[];
  periodLabel: string;
  periodType: ReviewPeriod;
  preferences: AIPreferences;
  aiMode: "mock" | "api";
}) {
  const prompt = buildReviewPrompt(input.cards, input.periodLabel, input.periodType, input.preferences);
  if (canUseTextApi(input.aiMode)) {
    try {
      return await callTextApi(prompt, input.preferences);
    } catch (error) {
      console.warn("AI review API failed, falling back to mock.", error);
    }
  }
  return mockReviewSummary(input.cards, input.periodLabel, input.preferences);
}

export async function generateNextTaskSuggestions(input: {
  cards: LifeCard[];
  tasks: LifeTask[];
  preferences: AIPreferences;
  aiMode: "mock" | "api";
}) {
  const prompt = buildSuggestionPrompt(input.cards, input.tasks, input.preferences);
  if (canUseTextApi(input.aiMode)) {
    try {
      const text = await callTextApi(prompt, input.preferences);
      return text
        .split(/\n|；|;/)
        .map((item: string) => item.replace(/^[-\d.、\s]+/, "").trim())
        .filter(Boolean)
        .slice(0, 4);
    } catch (error) {
      console.warn("AI suggestion API failed, falling back to mock.", error);
    }
  }
  return mockNextTaskSuggestions(input.cards);
}

export async function testTextApiConnection() {
  const config = getRuntimeAIConfig();
  if (!config.textApiBase || !config.textApiKey || !config.textModel) {
    throw new Error("请先填写文本 API Base、Key 和 Model。");
  }
  return callTextApi("请只回复：LifeQuest 文本 API 已连接。", {
    empathy: 50,
    humor: 10,
    objectivity: 80,
  });
}

export async function testImageApiConnection() {
  const config = getRuntimeAIConfig();
  if (!config.imageApiBase || !config.imageApiKey || !config.imageModel) {
    throw new Error("请先填写生图 API Base、Key 和 Model。");
  }
  return callImageApi("A tiny warm minimal illustration of a glowing checklist card, no text, soft light.");
}

export function buildLifeCardPrompt(input: LifeCardAiInput) {
  return [
    "你是 LifeQuest 的人生卡文案助手。请基于用户真实完成的事件写一段自然、具体、不空泛的纪念文案。",
    `任务标题：${input.title}`,
    `任务分类：${input.category}`,
    `用户感受：${input.note}`,
    `今日情绪：${input.moodText}`,
    `AI偏好：共情 ${input.preferences.empathy}/100，幽默 ${input.preferences.humor}/100，客观 ${input.preferences.objectivity}/100。`,
    "要求：必须具体提到任务标题里的关键事件；写 80-140 字；像一个认真倾听的人；不要使用“你很棒”这类空泛夸奖。",
  ].join("\n");
}

export function buildImagePrompt(input: LifeCardAiInput) {
  return [
    "温暖治愈风生活纪念图，适合作为人生卡封面。",
    `具体事件：${input.title}`,
    `任务分类：${input.category}`,
    `用户感受：${input.note}`,
    `情绪：${input.moodText}`,
    "画面需要有真实生活感、柔和光线、清爽构图，不要文字，不要 logo。",
  ].join(" ");
}

function buildReviewPrompt(cards: LifeCard[], periodLabel: string, periodType: ReviewPeriod, preferences: AIPreferences) {
  const events = cards.map((card) => `- ${card.title}｜情绪：${card.moodText}｜感受：${card.note}`).join("\n");
  return [
    `请为 LifeQuest 用户生成${periodLabel}。周期类型：${periodType}。`,
    `AI偏好：共情 ${preferences.empathy}/100，幽默 ${preferences.humor}/100，客观 ${preferences.objectivity}/100。`,
    "必须基于下面真实完成的任务，不要泛泛总结：",
    events || "本周期没有记录。",
    "要求：像一个倾听者；提到具体做过的事；如果出现疲惫、难过、孤独、紧张等情绪，请温柔回应，不要说教；100-180 字。",
  ].join("\n");
}

function buildSuggestionPrompt(cards: LifeCard[], tasks: LifeTask[], preferences: AIPreferences) {
  const events = cards.slice(0, 8).map((card) => `- ${card.title}｜${card.category}｜${card.moodText}`).join("\n");
  const taskTitles = tasks.map((task) => task.title).join("、");
  return [
    "请根据用户已完成的人生任务，给出 3-4 条下一步建议。",
    `AI偏好：共情 ${preferences.empathy}/100，幽默 ${preferences.humor}/100，客观 ${preferences.objectivity}/100。`,
    "已完成事件：",
    events || "暂无。",
    `可参考任务池：${taskTitles}`,
    "要求：建议要有连续性，避免重复已完成事件，不要模板化；每条建议一行。",
  ].join("\n");
}

function canUseTextApi(mode: "mock" | "api") {
  const config = getRuntimeAIConfig();
  return mode === "api" && Boolean(config.textApiBase && config.textApiKey && config.textModel);
}

function canUseImageApi(mode: "mock" | "api") {
  const config = getRuntimeAIConfig();
  return mode === "api" && Boolean(config.imageApiBase && config.imageApiKey && config.imageModel);
}

function getRuntimeAIConfig(): AIApiConfig {
  const fromProfile = readStoredAIConfig();
  return {
    textApiBase: fromProfile.textApiBase || defaultRuntimeConfig.textApiBase,
    textApiKey: fromProfile.textApiKey || defaultRuntimeConfig.textApiKey,
    textModel: fromProfile.textModel || defaultRuntimeConfig.textModel,
    imageApiBase: fromProfile.imageApiBase || defaultRuntimeConfig.imageApiBase,
    imageApiKey: fromProfile.imageApiKey || defaultRuntimeConfig.imageApiKey,
    imageModel: fromProfile.imageModel || defaultRuntimeConfig.imageModel,
  };
}

function readStoredAIConfig(): AIApiConfig {
  if (typeof localStorage === "undefined") return defaultRuntimeConfig;
  try {
    const raw = localStorage.getItem("lifequest.profile");
    const profile = raw ? JSON.parse(raw) : {};
    return {
      ...defaultRuntimeConfig,
      ...(profile.aiApiConfig ?? {}),
    };
  } catch {
    return defaultRuntimeConfig;
  }
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

async function callTextApi(prompt: string, preferences: AIPreferences) {
  const config = getRuntimeAIConfig();
  const response = await fetch(`${normalizeBaseUrl(config.textApiBase)}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.textApiKey}`,
    },
    body: JSON.stringify({
      model: config.textModel,
      messages: [
        {
          role: "system",
          content: `你温柔、具体、不过度鸡汤。风格参数：共情=${preferences.empathy}，幽默=${preferences.humor}，客观=${preferences.objectivity}。`,
        },
        { role: "user", content: prompt },
      ],
      temperature: preferences.humor > 60 ? 0.9 : 0.65,
    }),
  });
  if (!response.ok) throw new Error(`Text API failed: ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || "这次记录已经被认真保存下来。";
}

async function callImageApi(prompt: string) {
  const config = getRuntimeAIConfig();
  const response = await fetch(`${normalizeBaseUrl(config.imageApiBase)}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.imageApiKey}`,
    },
    body: JSON.stringify({
      model: config.imageModel,
      prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    }),
  });
  if (!response.ok) throw new Error(`Image API failed: ${response.status}`);
  const data = await response.json();
  const item = data.data?.[0];
  if (item?.b64_json) return `data:image/png;base64,${item.b64_json}`;
  if (item?.url) return item.url as string;
  throw new Error("Image API returned no image.");
}

function mockLifeCardText(input: LifeCardAiInput) {
  const key = extractTaskKey(input.title);
  const empathic = input.preferences.empathy >= 65;
  const objective = input.preferences.objectivity >= 70;
  const humorous = input.preferences.humor >= 60;

  const opening = objective
    ? `这次记录的核心，是你完成了「${input.title}」。`
    : empathic
      ? `关于「${input.title}」这件事，你没有只是匆匆做完，而是真的把当时的自己留了下来。`
      : `今天的支线是「${input.title}」，它比任务名听起来更具体。`;

  const detail = `从你的感受里能看见：${input.note || "这件事对你有一点特别"}。情绪也不是背景音，而是这张卡的一部分：${input.moodText || "平静"}`;
  const tail = humorous
    ? `如果生活有存档点，这一刻大概会闪一下小光标。`
    : key.includes("天空")
      ? "那一眼天空不是大事，但它确实让今天有了一个可回看的颜色。"
      : "这不是泛泛的“完成”，而是你和这一天认真打过一次照面。";

  return `${opening}${detail}。${tail}`;
}

function mockReviewSummary(cards: LifeCard[], periodLabel: string, preferences: AIPreferences) {
  if (!cards.length) return `${periodLabel}暂时没有新的记录。空白也不是失败，它只是提醒你：下一条支线可以从一件很小、很容易开始的事出发。`;
  const titles = cards.map((card) => `「${card.title}」`).slice(0, 4).join("、");
  const moods = cards.map((card) => card.moodText).filter(Boolean).slice(0, 4).join("、");
  const hasHeavyMood = /累|难过|孤独|紧张|焦虑|低落|委屈|烦/.test(`${moods} ${cards.map((card) => card.note).join(" ")}`);
  const empathyLine = preferences.empathy > 60
    ? hasHeavyMood
      ? "里面有些情绪并不轻，但你还是把它记录下来了，这本身就是一种照顾自己的方式。"
      : "这些小事不喧哗，却很像你在认真生活的证据。"
    : "从事件分布看，你这段时间主要在推进可执行的小目标。";
  const objectiveLine = preferences.objectivity > 70 ? `本周期共 ${cards.length} 条记录，核心事件包括 ${titles}。` : `这段时间，你留下了 ${titles}。`;
  return `${objectiveLine}${empathyLine}${moods ? ` 情绪关键词大概是：${moods}。` : ""}下一步不用突然改变很多，顺着已经发生的事情，再多走半步就好。`;
}

function mockNextTaskSuggestions(cards: LifeCard[]) {
  if (!cards.length) return ["从一件 15 分钟内能完成的小事开始，比如拍一张今天的天空。"];
  const recent = cards.slice(0, 5);
  const suggestions = recent.flatMap((card) => {
    const title = card.title;
    if (/天空|晚霞|风景|照片|拍/.test(title)) {
      return ["连续记录三天的天空变化", "给这张照片写一句当时的心情", "下次拍一个让你觉得平静的角落"];
    }
    if (/一个人|独处|书店|火锅|散步|日落/.test(title)) {
      return ["试试一个人去喝一杯饮品", "记录一次独处时最放松的瞬间", "下次一个人去书店坐 20 分钟"];
    }
    if (/朋友|父母|问候|感谢|信|关系/.test(title)) {
      return ["和那个人多聊两句近况", "记录一次重新连接后的感受", "想一想还有没有一个你想念但很久没联系的人"];
    }
    if (/运动|技能|读完|早睡|成长/.test(title)) {
      return ["把这次成长拆成一个明天也能做的小动作", "记录一下最想继续坚持的原因", "给这个挑战设置一个轻量复盘点"];
    }
    return [`沿着「${title}」再做一个更轻的小版本`];
  });
  return [...new Set(suggestions)].slice(0, 4);
}

function extractTaskKey(title: string) {
  return title.replace(/^第一次/, "").replace(/[，。,.]/g, "").trim();
}

function buildGradientDataImage(input: LifeCardAiInput) {
  const title = escapeXml(input.title);
  const mood = escapeXml(input.moodText || "这一刻值得保存");
  const category = escapeXml(input.category);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#ffd9df"/>
          <stop offset="48%" stop-color="#fff8ed"/>
          <stop offset="100%" stop-color="#bfe9ff"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="900" fill="url(#bg)"/>
      <circle cx="980" cy="160" r="170" fill="#ffffff" opacity="0.32"/>
      <circle cx="210" cy="760" r="210" fill="#ff8f70" opacity="0.16"/>
      <rect x="90" y="105" width="1020" height="690" rx="56" fill="#ffffff" opacity="0.55"/>
      <text x="140" y="205" fill="#2f3137" font-size="34" font-family="sans-serif" font-weight="700">${category}</text>
      <text x="140" y="420" fill="#2f3137" font-size="62" font-family="sans-serif" font-weight="900">${title}</text>
      <text x="140" y="515" fill="#555" font-size="34" font-family="sans-serif">${mood}</text>
      <text x="140" y="690" fill="#ff8f70" font-size="28" font-family="sans-serif" font-weight="700">LifeQuest AI Image</text>
    </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char] ?? char);
}
