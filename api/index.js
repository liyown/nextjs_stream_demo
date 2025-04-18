// Next.js 流式传输和Suspense原理演示API
const express = require('express');
const path = require('path');
const app = express();

// 导入博客HTML路由
const blogHtmlRouter = require('./blog-html');

// 静态文件服务
app.use(express.static(path.join(__dirname, '../')));

// 添加博客HTML路由
app.use('/blog-html', blogHtmlRouter);

// 原始路由 - 使用直接的$RC函数实现
app.get('/blog', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Transfer-Encoding', 'chunked');

  // 发送初始HTML和第一个Suspense fallback
  res.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>RC函数流式传输演示</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .loading { padding: 1rem; background-color: #f3f4f6; border-radius: 0.375rem; margin: 1rem 0; }
        .content { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; margin: 1rem 0; }
        .explanation { background-color: #fffbeb; padding: 1rem; border-radius: 0.375rem; margin: 1rem 0; }
      </style>
    </head>
    <body>
      <h1>原始$RC函数流式传输演示</h1>
      <a href="/">首页</a> | <a href="/next-demo">查看__next_f实现</a>
      
      <div class="explanation">
        <h3>原始流式传输原理</h3>
        <p>这个演示使用原始的$RC函数实现，直接替换DOM节点。没有使用__next_f队列。</p>
      </div>

      <!-- 主要内容区域，使用Suspense包裹 -->
      <div><!--$$--><template id="B:0"></template><div class="loading">正在加载博客内容...</div><!--/$--></div>
      
      <script>
        // 原始的$RC函数实现
        $RC = function(b, c, e) {
          c = document.getElementById(c);
          c.parentNode.removeChild(c);
          var a = document.getElementById(b);
          if (a) {
            b = a.previousSibling;
            if (e)
              b.data = "$!",
              a.setAttribute("data-dgst", e);
            else {
              e = b.parentNode;
              a = b.nextSibling;
              var f = 0;
              do {
                if (a && 8 === a.nodeType) {
                  var d = a.data;
                  if ("/$" === d)
                    if (0 === f)
                      break;
                    else
                      f--;
                  else
                    "$" !== d && "$$" !== d && "$!" !== d || f++
                }
                d = a.nextSibling;
                e.removeChild(a);
                a = d
              } while (a);
              for (; c.firstChild; )
                e.insertBefore(c.firstChild, a);
              b.data = "$"
            }
            b._reactRetry && b._reactRetry()
          }
        }
      </script>
    </body>
  `);

  // 模拟第一层动态内容 - 3秒后加载
  setTimeout(() => {
    res.write(`
      <div hidden id="S:0">
        <div class="content">
          <h2>博客内容第一层</h2>
          <p>这部分内容在服务器上需要3秒钟加载。在真实的Next.js应用中，这可能是数据库查询或API调用的结果。</p>
          
          <!-- 嵌套的Suspense边界 -->
          <div><!--$$--><template id="B:1"></template><div class="loading">正在加载评论...</div><!--/$--></div>
        </div>
      </div>
      <script>
        console.log('第一层内容已加载，直接调用$RC替换...');
        // 直接调用$RC函数，不使用__next_f
        $RC("B:0", "S:0");
      </script>
    `);
  }, 3000);

  // 模拟嵌套的动态内容 - 再等3秒加载
  setTimeout(() => {
    res.write(`
      <div hidden id="S:1">
        <div class="content">
          <h3>评论已加载</h3>
          <ul>
            <li>评论1: 很棒的文章!</li>
            <li>评论2: 学到了很多关于流式传输的知识。</li>
          </ul>
        </div>
      </div>
      <script>
        console.log('评论内容已加载，直接调用$RC替换...');
        // 直接调用$RC函数，不使用__next_f
        $RC("B:1", "S:1");
      </script>

      <div class="explanation">
        <h3>原始$RC实现总结</h3>
        <p><strong>实现原理:</strong> 直接使用$RC函数替换DOM节点，不需要__next_f。</p>
        <p><strong>优点:</strong> 简单直接，容易理解。</p>
        <p><strong>缺点:</strong> 只替换HTML，无法添加交互性和事件处理。</p>
      </div>
      </body></html>
    `);
    res.end();
  }, 6000);
});

// 新路由 - 使用__next_f队列实现
app.get('/next-demo', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Transfer-Encoding', 'chunked');

  // 发送初始HTML和Suspense fallback
  res.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Next.js __next_f流式传输演示</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .loading { padding: 1rem; background-color: #f3f4f6; border-radius: 0.375rem; margin: 1rem 0; }
        .content { padding: 1rem; border: 1px solid #e5e7eb; border-radius: 0.375rem; margin: 1rem 0; }
        .explanation { background-color: #fffbeb; padding: 1rem; border-radius: 0.375rem; margin: 1rem 0; }
      </style>
      <script>
        // __next_f 是Next.js用于流式传输组件的关键
        // 它存储了需要被替换的组件和它们的渲染指令
        self.__next_f = self.__next_f || [];
        self.__next_f.push([0]); // 初始化渲染队列
      </script>
      <!-- 引入Next.js流式传输处理脚本 -->
      <script src="/next-streaming.js" defer></script>
    </head>
    <body>
      <h1>Next.js __next_f流式传输演示</h1>
      <a href="/">首页</a> | <a href="/blog">查看原始$RC实现</a>
      
      <div class="explanation">
        <h3>__next_f流式传输原理</h3>
        <p>这个演示使用__next_f队列来存储组件数据，启用交互性功能。</p>
      </div>

      <div class="content">
        <h2>用户资料与帖子示例</h2>
        <p>这个示例展示了如何使用__next_f传递组件数据并启用交互性。</p>
        
        <!-- 用户资料组件 Suspense -->
        <div><!--$$--><template id="profile-boundary"></template><div class="loading">正在加载用户资料...</div><!--/$--></div>
        
        <!-- 帖子列表组件 Suspense -->
        <div><!--$$--><template id="posts-boundary"></template><div class="loading">正在加载帖子列表...</div><!--/$--></div>
      </div>
    </body>
  `);

  // 模拟第一个组件(用户资料)数据 - 3秒后加载
  setTimeout(() => {
    res.write(`
      <script>
        // 使用__next_f传递组件信息和数据
        self.__next_f.push([1, JSON.stringify({
          id: "profile-boundary",
          component: "UserProfile",
          props: { userId: "user123" },
          data: { 
            name: "张三", 
            bio: "资深前端开发者，喜欢研究Next.js流式传输技术。" 
          }
        })]);
        
        console.log('用户资料数据已加载，推送到__next_f队列...');
      </script>
    `);
  }, 3000);

  // 模拟第二个组件(帖子列表)数据 - 再等3秒加载
  setTimeout(() => {
    res.write(`
      <script>
        // 使用__next_f传递组件信息和数据
        self.__next_f.push([2, JSON.stringify({
          id: "posts-boundary",
          component: "PostsList",
          props: { userId: "user123" },
          data: [
            { id: 1, title: "React服务器组件入门", upvotes: 42 },
            { id: 2, title: "Next.js流式传输原理详解", upvotes: 18 },
            { id: 3, title: "如何优化React性能", upvotes: 27 }
          ]
        })]);
        
        console.log('帖子列表数据已加载，推送到__next_f队列...');
      </script>

      <div class="explanation">
        <h3>__next_f实现总结</h3>
        <p><strong>__next_f的作用:</strong> 存储组件数据和渲染指令，使服务器能将组件信息流式传输到客户端。</p>
        <p><strong>组件交互性:</strong> 通过__next_f传递的数据，客户端可以实例化组件并添加交互功能。</p>
        <p><strong>交互演示:</strong> 试试点击"点赞"按钮和帖子中的按钮，这些交互功能是通过__next_f传递的数据启用的。</p>
        <p><strong>比较:</strong> 相比原始$RC实现，__next_f不仅替换HTML，还传递了组件数据，启用了交互性。</p>
      </div>
      </body></html>
    `);
    res.end();
  }, 6000);
});

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Next.js 流式传输演示</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
        .card { border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f9f9f9; }
        .button { display: inline-block; padding: 10px 20px; background: #0070f3; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
        .comparison { display: flex; gap: 20px; }
        .comparison > div { flex: 1; }
      </style>
    </head>
    <body>
      <h1>Next.js 流式传输和Suspense比较演示</h1>
      <p>这个演示展示了两种不同的Next.js流式传输实现方式。</p>
      
      <div class="comparison">
        <div class="card">
          <h2>原始$RC实现</h2>
          <p>直接使用$RC函数替换DOM节点，不使用__next_f队列</p>
          <ul>
            <li>简单直接，容易理解</li>
            <li>只替换HTML，无交互性</li>
            <li>轻量级实现</li>
          </ul>
          <a href="/blog" class="button">查看$RC实现演示</a>
        </div>
        
        <div class="card">
          <h2>__next_f队列实现</h2>
          <p>使用__next_f队列存储组件数据，支持交互性</p>
          <ul>
            <li>传递完整组件数据</li>
            <li>支持事件处理和交互</li>
            <li>更接近真实Next.js实现</li>
          </ul>
          <a href="/next-demo" class="button">查看__next_f实现演示</a>
        </div>
      </div>

      <div class="card">
        <h2>项目文档</h2>
        <p>详细了解Next.js流式传输和Suspense原理，请查看我们的教程文档。</p>
        <a href="/blog-html" class="button">查看教程文档</a>
      </div>
    </body>
    </html>
  `);
});

// 如果在本地开发环境运行，监听端口3012
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3012;
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}

// 导出Express应用以供Vercel使用
module.exports = app;
