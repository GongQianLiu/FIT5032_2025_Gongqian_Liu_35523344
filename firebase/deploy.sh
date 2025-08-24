#!/bin/bash

# Firebase 部署脚本
# 用于部署 Evergreen Way 项目到 Firebase

echo "🚀 开始部署 Evergreen Way 项目到 Firebase..."

# 检查是否安装了 Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI 未安装，请先安装：npm install -g firebase-tools"
    exit 1
fi

# 检查是否已登录 Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ 未登录 Firebase，请先登录：firebase login"
    exit 1
fi

# 构建前端项目
echo "📦 构建前端项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 前端构建失败"
    exit 1
fi

echo "✅ 前端构建成功"

# 安装 Firebase Functions 依赖
echo "📦 安装 Firebase Functions 依赖..."
cd firebase/functions
npm install

if [ $? -ne 0 ]; then
    echo "❌ Firebase Functions 依赖安装失败"
    exit 1
fi

echo "✅ Firebase Functions 依赖安装成功"
cd ../..

# 部署到 Firebase
echo "🚀 部署到 Firebase..."
firebase deploy

if [ $? -eq 0 ]; then
    echo "🎉 部署成功！"
    echo ""
    echo "📋 部署信息："
    echo "- 前端: Firebase Hosting"
    echo "- 后端: Firebase Functions"
    echo "- 数据库: Firestore"
    echo "- 认证: Firebase Authentication"
    echo ""
    echo "🔗 您的应用现在应该可以在 Firebase Hosting URL 上访问"
else
    echo "❌ 部署失败"
    exit 1
fi
