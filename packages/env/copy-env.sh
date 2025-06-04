#!/bin/bash

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
ROOT_DIR="$SCRIPT_DIR/../.."

# 目标目录数组
TARGET_DIRS=(
  "$ROOT_DIR/apps/web"
  "$ROOT_DIR/apps/browser-extension"
)

echo "🚀 开始复制 .env 文件..."
echo

# 查找所有 .env 文件
ENV_FILES=($(find "$SCRIPT_DIR" -maxdepth 1 -name ".env*" -type f -exec basename {} \;))

if [ ${#ENV_FILES[@]} -eq 0 ]; then
  echo "⚠️  未找到 .env 文件"
  exit 0
fi

echo "📁 找到 ${#ENV_FILES[@]} 个 .env 文件: ${ENV_FILES[*]}"
echo

# 遍历目标目录
for TARGET_DIR in "${TARGET_DIRS[@]}"; do
  if [ ! -d "$TARGET_DIR" ]; then
    echo "⚠️  目标目录不存在: $TARGET_DIR"
    continue
  fi
  
  echo "📂 复制到: $TARGET_DIR"
  
  # 复制每个 .env 文件
  for ENV_FILE in "${ENV_FILES[@]}"; do
    SRC_PATH="$SCRIPT_DIR/$ENV_FILE"
    DEST_PATH="$TARGET_DIR/$ENV_FILE"
    
    if cp "$SRC_PATH" "$DEST_PATH" 2>/dev/null; then
      echo "✅ 复制成功: $DEST_PATH"
    else
      echo "❌ 复制失败: $DEST_PATH"
    fi
  done
  
  echo
done

echo "✨ 复制完成!" 