// 清除本地存储脚本
// 在浏览器控制台中运行此脚本来清除用户登录状态

console.log('正在清除本地存储...');

// 清除所有本地存储
localStorage.clear();

// 清除会话存储
sessionStorage.clear();

console.log('本地存储已清除！');
console.log('请刷新页面，现在应该会显示登录页面。');

// 可选：自动刷新页面
// window.location.reload();
