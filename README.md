# 人生支线 LifeQuest

一个人生任务打卡小软件 MVP，把生活里的第一次、成长目标、关系节点和治愈瞬间，沉淀成可打卡、可记录、可复盘、可收藏的「人生卡」。

当前版本是前端可演示 Demo：数据使用 `localStorage` 持久化，AI 能力使用 mock service 预留接口，方便后续接入真实大模型和 AI 绘图服务。

## 功能特性

- 首页人生进度盘：展示已完成人生卡、进行中愿望、本月完成数、最近纪念日、今日推荐任务。
- 人生任务库：内置 30 条系统预设任务，覆盖第一次、勇气、关系、独处、成长、治愈 6 类。
- 自定义任务：支持创建个人任务，并加入人生愿望清单。
- 人生愿望清单：支持状态流转、分类筛选、重要程度筛选、置顶、删除、完成打卡。
- 打卡流程：支持完成时间、地点、心情标签、文字感受、本地图片预览、纪念日标记、AI 纪念图提示词。
- 人生卡详情：展示 AI 纪念文案、AI 绘图提示词、情绪标签、小日记编辑。
- 纪念日：支持手动添加，也支持重要打卡自动转化为纪念日；包含正数日和倒数日。
- 复盘回溯：支持日复盘、周复盘、月复盘、季复盘、年复盘，统计逻辑由前端真实计算。
- 人生轨迹：按月份分组展示人生卡，支持分类、心情、时间排序筛选。
- 设置页：支持昵称、复盘偏好、AI 模式占位、主题占位、导出 JSON、恢复演示数据。

## 技术栈

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- lucide-react
- localStorage

## 目录结构

```text
src/
  components/
    Layout/
    LifeCard/
    MoodTag/
    ReviewPanel/
    TaskCard/
    Timeline/
  data/
    mockData.ts
    presetTasks.ts
  pages/
    Dashboard.tsx
    TaskLibrary.tsx
    Wishlist.tsx
    CheckIn.tsx
    LifeCardDetail.tsx
    Anniversaries.tsx
    Reviews.tsx
    TimelinePage.tsx
    Settings.tsx
  services/
    AppDataContext.tsx
    aiService.ts
    reviewService.ts
    storageService.ts
  types/
    index.ts
  utils/
    date.ts
    id.ts
```

## 本地安装

建议使用 Node.js 20 或更高版本。

```bash
npm install
```

如果当前环境对默认 npm 缓存目录没有写入权限，可以把缓存放在项目内：

```bash
npm install --cache ./.npm-cache
```

## 本地启动

```bash
npm run dev
```

启动后访问终端输出的本地地址，通常是：

```text
http://127.0.0.1:5173/
```

如果 5173 被占用，Vite 会自动切换到其他端口。

## 构建

```bash
npm run build
```

构建产物会输出到：

```text
dist/
```

本地预览生产构建：

```bash
npm run preview
```

## 环境变量

当前 MVP 不需要环境变量。

AI 能力目前在 `src/services/aiService.ts` 中使用 mock 实现。后续接入真实 API 时，建议新增：

```text
VITE_AI_API_BASE_URL=
VITE_AI_API_KEY=
```

并在 `aiService.ts` 中根据设置页的 AI 模式切换 mock/API 请求。

## 部署

这是一个纯前端 Vite 项目，部署时只需要安装依赖并执行构建命令。

### 部署到 Vercel

1. 在 Vercel 导入 GitHub 仓库。
2. Framework Preset 选择 `Vite`。
3. Build Command 填写：

```bash
npm run build
```

4. Output Directory 填写：

```text
dist
```

5. 点击 Deploy。

### 部署到 Netlify

1. 在 Netlify 导入 GitHub 仓库。
2. Build command 填写：

```bash
npm run build
```

3. Publish directory 填写：

```text
dist
```

4. 点击 Deploy site。

### 部署到 GitHub Pages

如果仓库使用 GitHub Pages，需要注意 Vite 的 `base` 路径。

当前仓库名是 `-`，GitHub Pages 地址通常会类似：

```text
https://laonanren52-cell.github.io/-/
```

这种情况下建议在 `vite.config.ts` 中设置：

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/-/",
  plugins: [react()],
});
```

然后构建：

```bash
npm run build
```

再把 `dist/` 发布到 GitHub Pages。可以使用 GitHub Actions，也可以使用 `gh-pages` 包。

如果部署到自定义域名或 Vercel/Netlify，通常不需要设置 `base`。

## 常用命令

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 数据说明

MVP 使用 `localStorage` 保存数据：

- 任务数据
- 愿望清单
- 人生卡
- 小日记
- 纪念日
- 复盘设置
- 用户设置

首次进入系统时会自动初始化演示数据，包括 30 条预设任务、3 条愿望、5 张人生卡和 2 个纪念日。

如需恢复演示数据，可以在设置页点击「清空并恢复演示数据」。

## AI 接入说明

当前 mock 函数位于：

```text
src/services/aiService.ts
```

包含：

- `generateLifeCardText`
- `generateImagePrompt`
- `generateReviewSummary`
- `generateNextTaskSuggestions`

后续替换真实 API 时，推荐保持函数签名不变，只替换函数内部实现。这样页面层和数据层不需要大改。

## 注意事项

- 当前版本是前端 MVP，没有后端账号系统。
- 数据只保存在当前浏览器的 localStorage 中，换浏览器或清缓存后数据会丢失。
- 图片上传目前使用本地预览，不会上传到服务器。
- 设置页的 API 模式和夜间主题是预留入口，尚未接入完整实现。

## License

仅作为学习、演示和 MVP 原型使用。
