'use client';

import { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import axios from 'axios';

// Toast 组件
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-[slideInDown_0.3s_ease-in-out_forwards]">
      {message}
    </div>
  );
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [metadata, setMetadata] = useState({ title: '', description: '' });
  const [customMetadata, setCustomMetadata] = useState({ title: '', description: '' });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastKey, setToastKey] = useState(0); // 添加 toastKey 状态用于强制重新渲染 Toast

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastKey(prev => prev + 1); // 更新 toastKey 触发重新渲染
  };

  const validateUrl = (input: string) => {
    if (!input) {
      setUrlError('');
      return false;
    }

    const processedUrl = input.trim();
    if (!/^https?:\/\//i.test(processedUrl)) {
      setUrlError('请输入以 http:// 或 https:// 开头的完整网址');
      return false;
    }

    try {
      new URL(processedUrl);
      setUrlError('');
      setUrl(processedUrl);
      return true;
    } catch (e) {
      setUrlError('请输入有效的网址');
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setUrl(input);
    validateUrl(input);
  };

  const generateImage = async () => {
    if (!validateUrl(url)) return;
    setLoading(true);

    try {
      // 获取网站元数据
      const response = await axios.get(`/api/metadata?url=${encodeURIComponent(url)}`);
      const { title, description } = response.data;
      setMetadata({ title, description });

      // 创建 Canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建 Canvas 上下文');

      // 设置画布大小和设备像素比
      canvas.width = 1200;  // 提高分辨率
      canvas.height = 400;
      ctx.scale(2, 2);  // 设置设备像素比

      // 设置背景色和圆角
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(0, 0, 600, 200, 16);  // 调整圆角大小
      ctx.fill();

      // 绘制标题
      const displayTitle = customMetadata.title || title;
      if (displayTitle) {
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = '#1F2937';
        const titleLines = wrapText(ctx, displayTitle, 380);
        titleLines.forEach((line, index) => {
          ctx.fillText(line, 24, 40 + index * 28);
        });
      }

      // 绘制描述
      const displayDescription = customMetadata.description || description;
      if (displayDescription) {
        ctx.font = '14px Arial';
        ctx.fillStyle = '#4B5563';
        const descLines = wrapText(ctx, displayDescription, 380);
        const startY = displayTitle ? 100 : 40;
        descLines.forEach((line, index) => {
          if (index < 3) { // 最多显示3行
            ctx.fillText(line, 24, startY + index * 20);
          }
        });
      }

      // 生成并绘制二维码
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: 400,  // 提高二维码分辨率
        margin: 0,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        quality: 1  // 最高质量
      });

      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrCodeDataUrl;
      });

      ctx.drawImage(qrImage, 440, 20, 140, 140);

      // 绘制提示文字
      ctx.font = '12px Arial';
      ctx.fillStyle = '#6B7280';
      ctx.fillText('长按或扫码访问', 440 + (140 - ctx.measureText('长按或扫码访问').width) / 2, 180);

      // 转换为图片 URL
      setPreviewImage(canvas.toDataURL('image/png', 1.0));  // 使用最高质量
    } catch (error) {
      console.error('Error:', error);
      alert('生成图片时出错，请检查链接是否正确');
    } finally {
      setLoading(false);
    }
  };

  // 文本换行函数
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
    const words = text.split('');
    const lines = [];
    let currentLine = words[0] || '';

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + word).width;
      if (width < maxWidth) {
        currentLine += word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {toastMessage && (
          <Toast
            key={toastKey}
            message={toastMessage}
            onClose={() => setToastMessage('')}
          />
        )}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">链接转二维码图片生成器</h1>
          <p className="text-gray-600 mb-8">输入链接，一键生成包含二维码的精美图片</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={handleUrlChange}
              placeholder="请输入需要转换的链接"
              className={`flex-1 px-4 py-2 border ${urlError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500`}
            />
            <button
              onClick={generateImage}
              disabled={loading || !url || urlError}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '生成中...' : '生成'}
            </button>
          </div>
          {urlError && (
            <p className="mt-2 text-sm text-red-600">{urlError}</p>
          )}
          
          <div className="mt-4">
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              {isCustomizing ? '收起编辑' : '自定义标题和描述'}
              <svg
                className={`w-4 h-4 transform transition-transform ${isCustomizing ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isCustomizing && (
              <div className="mt-4 space-y-4">
                <div>
                  <label htmlFor="customTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    自定义标题
                  </label>
                  <input
                    id="customTitle"
                    type="text"
                    value={customMetadata.title}
                    onChange={(e) => setCustomMetadata(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="输入自定义标题"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="customDescription" className="block text-sm font-medium text-gray-700 mb-1">
                    自定义描述
                  </label>
                  <textarea
                    id="customDescription"
                    value={customMetadata.description}
                    onChange={(e) => setCustomMetadata(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="输入自定义描述"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {previewImage && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="bg-gray-100 rounded-lg p-4 overflow-hidden">
              <img
                src={previewImage}
                alt="Preview"
                className="w-full h-auto"
              />
            </div>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewImage;
                  const now = new Date();
                  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
                  link.download = `qrcode-${timestamp}.png`;
                  link.click();
                  showToast('图片已下载');
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                下载图片
              </button>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(previewImage);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                      new ClipboardItem({
                        'image/png': blob
                      })
                    ]);
                    showToast('图片已复制到剪贴板');
                  } catch (error) {
                    console.error('复制图片失败:', error);
                    showToast('复制图片失败，请重试');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                复制图片
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
