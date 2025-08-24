#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Firebase 项目快速设置工具');
console.log('================================\n');

// 收集 Firebase 配置信息
async function collectFirebaseConfig() {
  const config = {};
  
  config.apiKey = await question('请输入您的 Firebase API Key: ');
  config.authDomain = await question('请输入您的 Firebase Auth Domain: ');
  config.projectId = await question('请输入您的 Firebase Project ID: ');
  config.storageBucket = await question('请输入您的 Firebase Storage Bucket: ');
  config.messagingSenderId = await question('请输入您的 Firebase Messaging Sender ID: ');
  config.appId = await question('请输入您的 Firebase App ID: ');
  
  return config;
}

// 收集 SendGrid 配置信息
async function collectSendGridConfig() {
  const config = {};
  
  config.apiKey = await question('请输入您的 SendGrid API Key: ');
  config.fromEmail = await question('请输入您的验证过的发件人邮箱: ');
  
  return config;
}

// 提问函数
function question(query) {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

// 更新 Firebase 配置文件
function updateFirebaseConfig(config) {
  const configPath = path.join(__dirname, 'src', 'firebase', 'config.js');
  let content = fs.readFileSync(configPath, 'utf8');
  
  // 替换配置
  content = content.replace(/apiKey: "[^"]*"/, `apiKey: "${config.apiKey}"`);
  content = content.replace(/authDomain: "[^"]*"/, `authDomain: "${config.authDomain}"`);
  content = content.replace(/projectId: "[^"]*"/, `projectId: "${config.projectId}"`);
  content = content.replace(/storageBucket: "[^"]*"/, `storageBucket: "${config.storageBucket}"`);
  content = content.replace(/messagingSenderId: "[^"]*"/, `messagingSenderId: "${config.messagingSenderId}"`);
  content = content.replace(/appId: "[^"]*"/, `appId: "${config.appId}"`);
  
  fs.writeFileSync(configPath, content);
  console.log('✅ Firebase 配置文件已更新');
}

// 设置 Firebase Functions 配置
async function setFirebaseFunctionsConfig(sendGridConfig) {
  const { execSync } = require('child_process');
  
  try {
    console.log('⚙️  设置 Firebase Functions 配置...');
    
    execSync(`firebase functions:config:set sendgrid.key="${sendGridConfig.apiKey}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set sendgrid.from_email="${sendGridConfig.fromEmail}"`, { stdio: 'inherit' });
    
    console.log('✅ Firebase Functions 配置已设置');
  } catch (error) {
    console.error('❌ 设置 Firebase Functions 配置失败:', error.message);
    console.log('请手动运行以下命令:');
    console.log(`firebase functions:config:set sendgrid.key="${sendGridConfig.apiKey}"`);
    console.log(`firebase functions:config:set sendgrid.from_email="${sendGridConfig.fromEmail}"`);
  }
}

// 检查 Firebase CLI 是否安装
function checkFirebaseCLI() {
  const { execSync } = require('child_process');
  
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 检查是否已登录 Firebase
function checkFirebaseLogin() {
  const { execSync } = require('child_process');
  
  try {
    execSync('firebase projects:list', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 主函数
async function main() {
  try {
    // 检查 Firebase CLI
    if (!checkFirebaseCLI()) {
      console.log('❌ 未检测到 Firebase CLI');
      console.log('请先安装 Firebase CLI: npm install -g firebase-tools');
      process.exit(1);
    }
    
    // 检查登录状态
    if (!checkFirebaseLogin()) {
      console.log('❌ 未登录 Firebase');
      console.log('请先登录: firebase login');
      process.exit(1);
    }
    
    console.log('📋 开始收集配置信息...\n');
    
    // 收集 Firebase 配置
    console.log('🔧 Firebase 配置信息:');
    const firebaseConfig = await collectFirebaseConfig();
    
    // 收集 SendGrid 配置
    console.log('\n📧 SendGrid 配置信息:');
    const sendGridConfig = await collectSendGridConfig();
    
    // 更新配置文件
    console.log('\n📝 更新配置文件...');
    updateFirebaseConfig(firebaseConfig);
    
    // 设置 Firebase Functions 配置
    console.log('\n⚡ 设置 Firebase Functions 配置...');
    await setFirebaseFunctionsConfig(sendGridConfig);
    
    console.log('\n🎉 配置完成！');
    console.log('\n📋 下一步操作:');
    console.log('1. 运行: npm run build');
    console.log('2. 运行: firebase deploy');
    console.log('3. 或使用: ./firebase/deploy.sh');
    
  } catch (error) {
    console.error('❌ 设置失败:', error.message);
  } finally {
    rl.close();
  }
}

// 运行主函数
main();
