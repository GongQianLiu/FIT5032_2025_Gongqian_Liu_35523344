const fs = require('fs');
const path = require('path');

console.log('🔥 Firebase配置更新工具');
console.log('========================');

console.log('\n📋 请按照以下步骤操作：');
console.log('1. 访问 https://console.firebase.google.com/');
console.log('2. 创建新项目（建议名称：evergreen-way）');
console.log('3. 启用Firestore数据库');
console.log('4. 启用Authentication（电子邮件/密码）');
console.log('5. 创建Web应用并复制配置');

console.log('\n📝 请将您从Firebase控制台复制的配置粘贴到下面的提示中：');

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('\n请粘贴您的firebaseConfig对象（格式如：{apiKey: "xxx", ...}）：', (configStr) => {
  try {
    // 解析配置字符串
    const config = eval('(' + configStr + ')');
    
    // 读取现有的配置文件
    const configPath = path.join(__dirname, 'src', 'firebase', 'config.js');
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // 替换配置
    const newConfig = `const firebaseConfig = {
  apiKey: "${config.apiKey}",
  authDomain: "${config.authDomain}",
  projectId: "${config.projectId}",
  storageBucket: "${config.storageBucket}",
  messagingSenderId: "${config.messagingSenderId}",
  appId: "${config.appId}"
};`;
    
    configContent = configContent.replace(
      /const firebaseConfig = \{[\s\S]*?\};/,
      newConfig
    );
    
    // 写入更新后的配置
    fs.writeFileSync(configPath, configContent);
    
    console.log('\n✅ Firebase配置已成功更新！');
    console.log('📁 配置文件位置：src/firebase/config.js');
    console.log('\n🚀 现在您可以运行项目了：');
    console.log('npm run dev');
    
  } catch (error) {
    console.error('\n❌ 配置更新失败：', error.message);
    console.log('请确保您粘贴的是正确的firebaseConfig对象格式');
  }
  
  rl.close();
});
