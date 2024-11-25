[cn](./README.md) | [en](./README.en.md)

# LenML LLM Leaderboard

[![GitHub stars](https://img.shields.io/github/stars/lenML/lenml-llm-leaderboard)](https://github.com/lenML/lenml-llm-leaderboard/stargazers)
[![GitHub license](https://img.shields.io/github/license/lenML/lenml-llm-leaderboard)](https://github.com/lenML/lenml-llm-leaderboard/blob/main/LICENSE)

一个专注于评测实用性开源模型的排行榜。我们只测试：
- 可本地部署运行的模型
- 量化后的模型
- 20GB显存以内可运行的模型

🔗 在线榜单：[https://lenml.github.io/lenml-llm-leaderboard/](https://lenml.github.io/lenml-llm-leaderboard/)

## 为什么需要这个榜单？

现有的开源模型评测存在以下问题：
- 大多数榜单仅关注英语能力或标准化测试分数
- 主要评测大型模型(100B+参数)，实用性不高
- 测评方式过于学术化，难以反映实际使用体验
- 较少覆盖社区模型，特别是各类 ERP 模型

## 评测指标

我们设计了一系列更贴近实际使用场景的评测指标：

| 指标 | 说明 |
|------|------|
| Hardcore | 评估模型对特定领域 (你懂的) 知识的掌握程度 |
| Reject | 测试模型的回答限制程度（分数越低越好）|
| Creative | 评估创意写作能力 |
| Long | 测试指定长度内容生成的准确率 |
| ACG | 评估动漫、漫画、游戏相关知识（二次元知识水平）|

## 开发路线

- [ ] 支持自定义评测公式
- [ ] 支持自定义测试数据
- [ ] 新增自动化测评方案
- [ ] 加入更多评测维度（如海龟汤推理测试）

## 参与贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

## License

[GPL-3.0 License](LICENSE)