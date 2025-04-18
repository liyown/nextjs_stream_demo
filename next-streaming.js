/**
 * next-streaming.js - Next.js流式传输客户端处理演示
 */

(function() {
  // 初始化队列
  self.__next_f = self.__next_f || [];
  
  // 记录已处理组件
  const processedComponents = new Set();
  
  // 组件注册表
  const ComponentRegistry = {
    // 用户资料组件
    UserProfile: function(props, data) {
      const user = data || { name: "加载中...", bio: "加载中..." };
      
      const element = document.createElement('div');
      element.className = 'user-profile';
      element.innerHTML = `
        <h2>${user.name}</h2>
        <p>${user.bio}</p>
        <button class="like-button" data-user-id="${props.userId}">点赞👍</button>
        <span class="like-count">0</span>
      `;
      
      // 添加点赞功能
      const likeButton = element.querySelector('.like-button');
      const likeCount = element.querySelector('.like-count');
      let likes = 0;
      
      likeButton.addEventListener('click', function() {
        likes++;
        likeCount.textContent = likes;
      });
      
      return element;
    },
    
    // 帖子列表组件
    PostsList: function(props, data) {
      const posts = data || [];
      
      const element = document.createElement('div');
      element.className = 'posts-list';
      
      const heading = document.createElement('h3');
      heading.textContent = '用户帖子';
      element.appendChild(heading);
      
      const ul = document.createElement('ul');
      posts.forEach(post => {
        const li = document.createElement('li');
        li.className = 'post-item';
        li.innerHTML = `
          <span class="post-title">${post.title}</span>
          <button class="upvote-button" data-post-id="${post.id}">👍 ${post.upvotes || 0}</button>
          <button class="comment-button" data-post-id="${post.id}">💬 评论</button>
        `;
        
        // 添加点赞交互
        const upvoteButton = li.querySelector('.upvote-button');
        let upvotes = post.upvotes || 0;
        
        upvoteButton.addEventListener('click', function() {
          upvotes++;
          upvoteButton.textContent = `👍 ${upvotes}`;
        });
        
        // 添加评论交互
        const commentButton = li.querySelector('.comment-button');
        commentButton.addEventListener('click', function() {
          alert(`您正在评论帖子: "${post.title}"`);
        });
        
        ul.appendChild(li);
      });
      
      element.appendChild(ul);
      return element;
    }
  };
  
  // 处理队列
  function processQueue() {
    console.log('处理指令队列');
    
    // 处理所有待处理的指令
    while (self.__next_f.length > 0) {
      const instruction = self.__next_f.shift();
      
      // 跳过无效指令
      if (!instruction || !Array.isArray(instruction) || instruction.length < 2) {
        continue;
      }

      const payload = instruction[1];

      processInstruction(payload);
    }
    
    // 重写push方法
    const originalPush = self.__next_f.push;
    self.__next_f.push = function() {
      const result = originalPush.apply(this, arguments);
      setTimeout(processQueue, 0);
      return result;
    };
  }
  
  // 处理单个指令
  function processInstruction(payload) {
    // 解析payload
    let data;
    if (typeof payload === 'string') {
      try {
        data = JSON.parse(payload);
      } catch (e) {
        console.error('解析指令失败');
        return;
      }
    } else {
      data = payload;
    }
    
    // 检查有效性
    if (!data || typeof data !== 'object') {
      return;
    }
    
    // 根据指令类型处理
    if (data.component) {
      // 组件渲染指令
      handleComponentInstruction(data);
    }
  }
  
  // 处理组件渲染
  function handleComponentInstruction(instruction) {
    // 基本验证
    if (!instruction || !instruction.id || !instruction.component) {
      return;
    }
    
    const { id, component, props, data } = instruction;
    
    // 跳过已处理的组件
    if (processedComponents.has(id)) {
      return;
    }
    
    // 检查组件是否存在
    if (!ComponentRegistry[component]) {
      console.error(`组件 ${component} 未注册`);
      return;
    }
    
    // 实例化组件
    const componentInstance = ComponentRegistry[component](props || {}, data);
    
    // 创建容器并添加到DOM
    const container = document.createElement('div');
    container.id = `container-${id}`;
    container.appendChild(componentInstance);
    container.style.display = 'none';
    document.body.appendChild(container);
    
    // 替换组件
    setTimeout(() => {
      $RC(id, `container-${id}`);
      processedComponents.add(id);
    }, 0);
  }

  window.$RC = function(b, c, e) {
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
    
  
  // 初始化
  document.addEventListener('DOMContentLoaded', function() {
    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      .user-profile {
        padding: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      .like-button, .upvote-button, .comment-button {
        background: #f0f0f0;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 5px 10px;
        margin: 5px 5px 5px 0;
        cursor: pointer;
      }
      .like-button:hover, .upvote-button:hover, .comment-button:hover {
        background: #e0e0e0;
      }
      .posts-list {
        margin-top: 20px;
      }
      .post-item {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #eee;
        border-radius: 4px;
      }
      .post-title {
        font-weight: bold;
        margin-right: 10px;
      }
    `;
    document.head.appendChild(style);
    
    // 处理队列
    processQueue();
  });
})(); 