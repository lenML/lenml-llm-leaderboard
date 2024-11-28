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
| Reject Rv | = (1 - Reject) * 100 ，为了方便求平均分创建的，简单说，越高越自由无限制|
| Creative | 评估创意写作能力 |
| Long | 测试指定长度内容生成的准确率 |
| ACG | 评估动漫、漫画、游戏相关知识（二次元知识水平）|
| NP | 评估模型参与类似海龟汤（简化版）谜题游戏的能力 |

*所有测评均为 zero-shot ，因为测评方式特殊，增加 context 无法保证不泄露元知识给模型。

### 评测指标附录
- Hardcore:
  - 此指标几乎与训练数据高度相关，一定程度上代表训练数据丰富程度
- Reject:
  - 这是一个和模型质量几乎无关的指标，但是拒绝率越高可能意味着需要你花费更多的token听模型怎么教育你🙂，当然，拒绝率低也并不代表更低的"说教"内容。
  - 总之拒绝率越低，模型越灵活易用。
- Reject Rv:
  - 为了方便计算的重新映射的数据，就是 Reject 的反转缩放值。
- Creative:
  - 创造性，关于创意写作的创造性指标，指标是稳定的，但是会带有很强的 llm 评测主观性，相差5分，实际使用可能感觉不出来，但是相差10分的模型，创意性差距非常非常大。
- Long:
  - 这个指标是创意写作测评的副产品。如果要求模型写 100 字文本，但是输出 99 字，那么准确率大概 90。简而言之，分数越高，代表模型对于 `token` 到 `word` 的映射关系越清晰。
- ACG:
  - 一些 ACG 相关的题目，标准的单选测评题，分数越高代表越 "二次元"。
  - 也能代表一定程度的`世界知识`。
- NP:
  - 一个类似海龟汤的逻辑推理测评。使用极简的海龟汤，评测分数并非通过率，而是推理流程的`波动性+退火因子+轮次因子`的多方面的综合得分。
  - 代表上下文理解能力和应对噪声的主动退火冷却的能力。
  - 分数越高越像人。比如据我测试，只有 `40` 分以上的模型，会在对话中说出 "我的天哪，这根本不可能" 这样的话。而 `40` 分以下的模型则明显在 `假装推理` 。

## 开发路线

- [x] 增加海龟汤推理测试
- [ ] 支持自定义评测公式
- [ ] 支持加载评测数据

## 参与贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

## License

[GPL-3.0 License](LICENSE)