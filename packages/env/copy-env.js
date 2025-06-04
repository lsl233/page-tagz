#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 获取当前脚本所在目录
const envDir = __dirname;
const rootDir = path.resolve(envDir, '../..');

// 目标目录
const targetDirs = [
  path.join(rootDir, 'apps/web'),
  path.join(rootDir, 'apps/browser-extension')
];

// 获取所有 .env 文件
function getEnvFiles() {
  return fs.readdirSync(envDir).filter(file => 
    file.startsWith('.env') && fs.statSync(path.join(envDir, file)).isFile()
  );
}

// 复制文件
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(`✅ 复制成功: ${dest}`);
  } catch (error) {
    console.error(`❌ 复制失败: ${dest}`, error.message);
  }
}

// 主函数
function main() {
  console.log('🚀 开始复制 .env 文件...\n');
  
  const envFiles = getEnvFiles();
  
  if (envFiles.length === 0) {
    console.log('⚠️  未找到 .env 文件');
    return;
  }
  
  console.log(`📁 找到 ${envFiles.length} 个 .env 文件:`, envFiles.join(', '));
  console.log();
  
  // 遍历目标目录
  targetDirs.forEach(targetDir => {
    if (!fs.existsSync(targetDir)) {
      console.log(`⚠️  目标目录不存在: ${targetDir}`);
      return;
    }
    
    console.log(`📂 复制到: ${targetDir}`);
    
    // 复制每个 .env 文件
    envFiles.forEach(envFile => {
      const srcPath = path.join(envDir, envFile);
      const destPath = path.join(targetDir, envFile);
      copyFile(srcPath, destPath);
    });
    
    console.log();
  });
  
  console.log('✨ 复制完成!');
}

// 运行脚本
main(); 