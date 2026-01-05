# Links 项目说明

## 添加链接流程

当用户提供一个 URL 时，自动执行以下操作（无需询问用户）：

1. 使用 WebFetch 获取页面信息，提取：
   - title: 页面标题
   - description: 页面描述（meta description）
   - cover: 页面封面图（og:image）
   - tags: 从 meta keywords 或页面内容推断 2-4 个标签

2. 若 cover 获取不到，依次尝试常见路径：
   - `{origin}/logo.png`
   - `{origin}/logo512.png`
   - `{origin}/apple-touch-icon.png`
   - `{origin}/favicon.ico`

3. 检查 `data.js` 中是否已存在该链接（URL 完全匹配或去除协议/尾斜杠后匹配）
   - 若已存在，先展示对比表格（字段 | 当前值 | 新值），然后使用 AskUserQuestion 询问用户处理方式：
     - **跳过**：不添加该链接
     - **更新**：用新信息刷新已存在条目的 title/description/cover/tags
     - **仍添加**：在开头添加新条目（允许重复）

4. 若不存在或用户选择"仍添加"，在 `linksData` 数组**开头**添加新条目
   - note 和 highlights 留空

## 数据结构

```javascript
{
  cover: "",           // 封面图 URL，可为空
  title: "",           // 标题
  description: "",     // 描述
  link: "",            // 原始链接
  tags: [],            // 标签数组
  note: "",            // 个人笔记，可为空
  highlights: []       // 重点列表，可为空数组
}
```

## 文件说明

- `data.js` - 链接数据，新链接添加到数组开头
- `app.js` - 页面逻辑
- `style.css` - 样式
- `index.html` - 主页面
