"""
Vercel Serverless API入口
"""
import sys
import os

# 添加backend目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.main import app

# Vercel需要这个handler
handler = app

