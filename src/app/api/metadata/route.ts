import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  let url: string | null = null; // 在函数开头声明url变量
  try {
    const { searchParams } = new URL(request.url);
    url = searchParams.get('url'); // 在try块中赋值

    if (!url) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000 // 设置5秒超时
    });
    const html = response.data;

    // 提取网页标题
    let title = '';
    const titleMatches = [
      html.match(/<title[^>]*>([^<]+)<\/title>/),
      html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i),
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["'][^>]*>/i),
      html.match(/<h1[^>]*>([^<]+)<\/h1>/)
    ];
    
    for (const match of titleMatches) {
      if (match && match[1]) {
        title = match[1].trim();
        break;
      }
    }

    // 如果还是没有找到标题，使用URL作为标题
    if (!title) {
      title = url.replace(/^https?:\/\//, '').split('/')[0];
    }

    // 提取网页描述
    let description = '';
    const descriptionMatches = [
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i),
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["'][^>]*>/i),
      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i),
      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["'][^>]*>/i)
    ];

    for (const match of descriptionMatches) {
      if (match && match[1]) {
        description = match[1].trim();
        break;
      }
    }

    // 如果没有找到描述，使用默认描述
    if (!description) {
      description = `访问 ${title} 获取更多信息`;
    }

    return NextResponse.json({
      title,
      description,
      url
    });
  } catch (error) {
    console.error('Error fetching metadata:', error);
    // 确保即使在错误情况下也返回一个可用的响应
    return NextResponse.json({
      title: '未能访问的网页',
      description: '该网页暂时无法访问，您可以点击上方的"自定义标题和描述"来编辑显示内容',
      url: url || '' // 现在可以安全地访问url变量
    }, { status: 200 }); // 返回200状态码，因为这是一个有效的响应
  }
}