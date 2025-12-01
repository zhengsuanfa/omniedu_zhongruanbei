import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);

  // 进度条加载
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2; // 约5秒完成
      });
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // 当进度达到100%时，等待1秒让动画完整展示
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        setAnimationComplete(true);
      }, 1000); // 等待1秒让用户看到完成状态
      return () => clearTimeout(timer);
    }
  }, [progress]);

  // 动画完成后才调用onComplete
  useEffect(() => {
    if (animationComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [animationComplete, onComplete]);

  // 添加跳过功能
  const handleSkip = () => {
    setProgress(100);
    setAnimationComplete(true);
    setTimeout(() => onComplete(), 100);
  };

  return (
    <div className="splash-screen">
      {/* 动态网格背景 */}
      <div className="splash-grid-bg">
        <div className="splash-grid-pattern" />
      </div>

      {/* 扫描线效果 */}
      <motion.div
        className="splash-scan-line"
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* 粒子网络 */}
      <svg className="splash-particles">
        <defs>
          <radialGradient id="particle-gradient">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="1" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
        </defs>
        {[...Array(30)].map((_, i) => {
          const x = (i * 123 + 50) % 100;
          const y = (i * 271 + 30) % 100;
          return (
            <g key={i}>
              <motion.circle
                cx={`${x}%`}
                cy={`${y}%`}
                r="2"
                fill="url(#particle-gradient)"
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: [0.3, 1, 0.3],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
              {i % 3 === 0 && i < 27 && (
                <motion.line
                  x1={`${x}%`}
                  y1={`${y}%`}
                  x2={`${((i + 3) * 123 + 50) % 100}%`}
                  y2={`${((i + 3) * 271 + 30) % 100}%`}
                  stroke="#0ea5e9"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* 光晕装饰 */}
      <div className="splash-glow splash-glow-top" />
      <div className="splash-glow splash-glow-bottom" />

      {/* 顶部装饰线 */}
      <motion.div 
        className="splash-border-top"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* 底部装饰线 */}
      <motion.div 
        className="splash-border-bottom"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.5, delay: 3.5, ease: "easeOut" }}
      />

      {/* 主内容容器 */}
      <div className="splash-content">
        
        {/* 六边形科技边框 */}
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 100,
            damping: 15,
            delay: 0.3 
          }}
          className="splash-hexagon-container"
        >
          {/* 外层旋转环 */}
          <motion.div
            className="splash-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <svg width="280" height="280" viewBox="0 0 280 280" className="splash-ring-svg">
              <defs>
                <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.8" />
                </linearGradient>
              </defs>
              <circle
                cx="140"
                cy="140"
                r="130"
                fill="none"
                stroke="url(#ring-gradient)"
                strokeWidth="2"
                strokeDasharray="10 5"
              />
            </svg>
          </motion.div>

          {/* 中层脉冲环 */}
          <motion.div
            className="splash-pulse-ring"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg width="200" height="200" viewBox="0 0 200 200" className="splash-pulse-svg">
              <polygon
                points="100,20 170,60 170,140 100,180 30,140 30,60"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="2"
              />
            </svg>
          </motion.div>

          {/* 核心图标 */}
          <div className="splash-hexagon-core">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
              }}
            >
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                {/* 智能大脑图标 */}
                <motion.path
                  d="M40 10 L50 15 L58 25 L60 38 L55 50 L45 58 L40 60"
                  stroke="#22d3ee"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
                <motion.path
                  d="M40 10 L30 15 L22 25 L20 38 L25 50 L35 58 L40 60"
                  stroke="#0ea5e9"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, delay: 0.7 }}
                />
                {/* 中央核心 */}
                <circle cx="40" cy="35" r="8" fill="#22d3ee" opacity="0.6">
                  <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
                </circle>
                {/* 连接点 */}
                {[
                  [50, 20], [30, 20], [25, 35], [55, 35], [35, 50], [45, 50]
                ].map(([cx, cy], i) => (
                  <motion.circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r="3"
                    fill="#0ea5e9"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                    transition={{
                      duration: 2,
                      delay: 1 + i * 0.2,
                      repeat: Infinity,
                    }}
                  />
                ))}
              </svg>
            </motion.div>
          </div>

          {/* 角落装饰 */}
          {[0, 90, 180, 270].map((rotation, i) => (
            <motion.div
              key={i}
              className="splash-corner-mark"
              style={{ 
                transformOrigin: '70px 70px',
                transform: `rotate(${rotation}deg)`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            >
              <div className="splash-corner-h" />
              <div className="splash-corner-v" />
            </motion.div>
          ))}
        </motion.div>

        {/* 标题区域 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
          className="splash-title-area"
        >
          <motion.h1 
            className="splash-title"
          >
            智慧城市政务热线
          </motion.h1>
          
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="splash-divider"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="splash-subtitle-en"
          >
            AI INTELLIGENT ASSISTANT SYSTEM
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="splash-subtitle-tech"
          >
            基于百度千帆大模型 · ERNIE-Speed-128k
          </motion.div>
        </motion.div>

        {/* 数据流动效果 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="splash-stats-grid"
        >
          {[
            { value: '95%+', label: '识别准确率', unit: 'ACCURACY' },
            { value: '<2s', label: '响应速度', unit: 'RESPONSE' },
            { value: '150×', label: '效率提升', unit: 'EFFICIENCY' },
            { value: '6+', label: 'AI模块', unit: 'MODULES' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 + i * 0.1 }}
              className="splash-stat-item-wrapper"
            >
              <div className="splash-stat-card">
                {/* 数据流光效 */}
                <motion.div
                  className="splash-stat-shimmer"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ 
                    duration: 2,
                    delay: 2.5 + i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 3,
                  }}
                />
                
                <div className="splash-stat-content">
                  <div className="splash-stat-unit">{item.unit}</div>
                  <div className="splash-stat-value">{item.value}</div>
                  <div className="splash-stat-label">{item.label}</div>
                </div>

                {/* 角落标记 */}
                <div className="splash-stat-corner-tr" />
                <div className="splash-stat-corner-bl" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* 加载进度 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8 }}
          className="splash-progress-container"
        >
          <div className="splash-progress-wrapper">
            {/* 进度条容器 */}
            <div className="splash-progress-bar-bg">
              <motion.div
                className="splash-progress-bar-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              >
                {/* 流光效果 */}
                <motion.div
                  className="splash-progress-shimmer"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>

            {/* 进度文本 */}
            <div className="splash-progress-text">
              <motion.span 
                className="splash-progress-status"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                SYSTEM INITIALIZING...
              </motion.span>
              <span className="splash-progress-percent">{progress}%</span>
            </div>
          </div>

          {/* 加载状态提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="splash-loading-steps"
          >
            {[
              { text: '正在加载 AI 模型...', threshold: 25 },
              { text: '连接千帆平台...', threshold: 50 },
              { text: '初始化系统组件...', threshold: 75 },
              { text: '准备就绪', threshold: 100 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: progress >= item.threshold ? 1 : 0.3,
                  x: progress >= item.threshold ? 0 : -20,
                }}
                className={`splash-loading-step ${progress >= item.threshold ? 'active' : ''}`}
              >
                <span className="splash-loading-dot" />
                {item.text}
                {progress >= item.threshold && progress < 100 && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ marginLeft: 8 }}
                  >
                    ✓
                  </motion.span>
                )}
                {progress >= 100 && progress >= item.threshold && (
                  <span style={{ marginLeft: 8, color: '#22d3ee' }}>✓</span>
                )}
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* 底部信息和跳过按钮 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="splash-footer"
        >
          <button 
            onClick={handleSkip}
            className="splash-skip-button"
          >
            跳过 →
          </button>
          <div className="splash-footer-title">
            2025 中软国际"卓越杯"技术竞赛 · 赛题三
          </div>
          <div className="splash-footer-tech">
            Powered by React + FastAPI + Baidu Qianfan AI Platform
          </div>
        </motion.div>
      </div>
    </div>
  );
}
