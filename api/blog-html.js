// blog-html.js - 渲染博客教程为HTML
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 为博客内容创建一个路由
router.get('/', (req, res) => {
  try {
    // 读取blog.md文件内容
    const blogPath = path.join(__dirname, '../blog.md');
    const blogContent = fs.readFileSync(blogPath, 'utf8');
    
    // 简单的Markdown转HTML (这是非常基础的，实际中可能需要使用markdown-it等库)
    const htmlContent = markdownToHtml(blogContent);
    
    // 返回完整的HTML页面
    res.send(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Next.js流式传输和Suspense原理详解</title>
        <style>
          body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 2rem;
          }
          
          h1 {
            font-size: 2.5rem;
            margin-top: 2rem;
            margin-bottom: 1.5rem;
            color: #0070f3;
          }
          
          h2 {
            font-size: 1.8rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #eaeaea;
            color: #333;
          }
          
          h3 {
            font-size: 1.4rem;
            margin-top: 1.5rem;
            color: #444;
          }
          
          pre {
            background-color: #f6f8fa;
            border-radius: 5px;
            padding: 1rem;
            overflow-x: auto;
          }
          
          code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            font-size: 0.9em;
            background-color: #f6f8fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
          }
          
          pre code {
            background-color: transparent;
            padding: 0;
          }
          
          p {
            margin: 1rem 0;
          }
          
          ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
          }
          
          li {
            margin: 0.5rem 0;
          }
          
          blockquote {
            margin: 1rem 0;
            padding: 0.5rem 1rem;
            border-left: 4px solid #0070f3;
            background-color: #f6f8fa;
          }
          
          img {
            max-width: 100%;
            height: auto;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 1rem 0;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 0.5rem;
          }
          
          th {
            background-color: #f6f8fa;
            font-weight: bold;
          }
          
          .demo-link {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.75rem 1.5rem;
            background-color: #0070f3;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: background-color 0.2s;
          }
          
          .demo-link:hover {
            background-color: #005cc5;
          }
          
          .nav {
            display: flex;
            justify-content: space-between;
            padding: 1rem 0;
            margin-bottom: 2rem;
            border-bottom: 1px solid #eaeaea;
          }
          
          .nav a {
            color: #0070f3;
            text-decoration: none;
            font-weight: bold;
          }
          
          .nav a:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="nav">
          <a href="/">← 返回首页</a>
          <div>
            <a href="/blog">查看$RC演示</a> | 
            <a href="/next-demo">查看__next_f演示</a>
          </div>
        </div>
        
        <div class="content">
          ${htmlContent}
        </div>
        
        <div style="margin-top: 3rem; text-align: center;">
          <a href="/" class="demo-link">返回演示首页</a>
        </div>
      </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`<h1>Error loading blog</h1><pre>${error.stack}</pre>`);
  }
});

// 简单的Markdown转HTML函数
function markdownToHtml(markdown) {
  // 处理标题
  let html = markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
    .replace(/^###### (.*$)/gm, '<h6>$1</h6>');
  
  // 处理粗体和斜体
  html = html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // 处理链接
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  
  // 处理列表
  html = html
    .replace(/^\s*-\s*(.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n)+/g, '<ul>$&</ul>');
  
  // 处理代码块
  html = html.replace(/```([\s\S]*?)```/g, function(match, p1) {
    const code = p1.trim();
    return `<pre><code>${code}</code></pre>`;
  });
  
  // 处理行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 处理段落
  html = html.replace(/^\s*(\S[\s\S]*?)(?=\n\s*\n|\n\s*$|$)/gm, function(match, p1) {
    // 跳过已经是HTML标签的行
    if (p1.trim().startsWith('<') && !p1.trim().startsWith('<code>')) {
      return match;
    }
    return `<p>${p1}</p>`;
  });
  
  // 处理表格
  const tableRegex = /\|([^|]*)\|([^|]*)\|/g;
  if (tableRegex.test(html)) {
    const tableRows = html.match(/^.*\|.*\|.*$/gm);
    if (tableRows && tableRows.length > 2) {
      let tableHtml = '<table>';
      
      // 表头
      const headerRow = tableRows[0];
      tableHtml += '<thead><tr>';
      const headerCells = headerRow.split('|').filter(cell => cell.trim() !== '');
      headerCells.forEach(cell => {
        tableHtml += `<th>${cell.trim()}</th>`;
      });
      tableHtml += '</tr></thead>';
      
      // 忽略分隔行
      
      // 表体
      tableHtml += '<tbody>';
      for (let i = 2; i < tableRows.length; i++) {
        const dataRow = tableRows[i];
        tableHtml += '<tr>';
        const dataCells = dataRow.split('|').filter(cell => cell.trim() !== '');
        dataCells.forEach(cell => {
          tableHtml += `<td>${cell.trim()}</td>`;
        });
        tableHtml += '</tr>';
      }
      tableHtml += '</tbody></table>';
      
      // 替换原始表格文本
      html = html.replace(/(\|.*\|\n)+/g, tableHtml);
    }
  }
  
  return html;
}

module.exports = router; 