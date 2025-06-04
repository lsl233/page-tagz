# 环境变量复制脚本

这个包提供了两个脚本来将 `.env.*` 文件复制到 `apps/web` 和 `apps/browser-extension` 目录。

## 使用方法

### 方法 1: 使用 npm 脚本（推荐）

```bash
# 在根目录运行
npm run copy-env

# 或者在 packages/env 目录运行
npm run copy-env
```

### 方法 2: 直接运行 Node.js 脚本

```bash
cd packages/env
node copy-env.js
```

### 方法 3: 运行 Shell 脚本

```bash
cd packages/env
./copy-env.sh
```

## 功能特性

- ✅ 自动检测所有 `.env*` 文件
- ✅ 同时复制到 web 和 browser-extension 目录
- ✅ 友好的命令行输出
- ✅ 错误处理
- ✅ 跨平台支持

## 支持的文件

脚本会自动复制以下文件（如果存在）：
- `.env`
- `.env.development`
- `.env.production`
- 其他任何以 `.env` 开头的文件

## 目标目录

- `apps/web/`
- `apps/browser-extension/`

如果目标目录不存在，脚本会跳过该目录并显示警告信息。 