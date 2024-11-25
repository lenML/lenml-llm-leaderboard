[cn](./README.md) | [en](./README.en.md)

# LenML LLM Leaderboard

[![GitHub stars](https://img.shields.io/github/stars/lenML/lenml-llm-leaderboard)](https://github.com/lenML/lenml-llm-leaderboard/stargazers)
[![GitHub license](https://img.shields.io/github/license/lenML/lenml-llm-leaderboard)](https://github.com/lenML/lenml-llm-leaderboard/blob/main/LICENSE)

A leaderboard focused on evaluating practical open-source language models. We only test models that are:
- Locally deployable
- Quantized
- Runnable with 20GB or less VRAM

🔗 Online Leaderboard: [https://lenml.github.io/lenml-llm-leaderboard/](https://lenml.github.io/lenml-llm-leaderboard/)

## Why Another Leaderboard?

Current open-source model evaluations face several limitations:
- Most leaderboards focus solely on English capabilities or standardized test scores
- Primary emphasis on large models (100B+ parameters), which lack practicality
- Evaluation methods are too academic and fail to reflect real-world usage
- Limited coverage of community models, especially ERP variants

## Evaluation Metrics

We've designed a set of metrics that better align with real-world usage scenarios:

| Metric | Description |
|--------|-------------|
| Hardcore | Evaluates model knowledge in specific (you known) niche domains |
| Reject | Tests model's tendency to refuse responses (lower is better) |
| Creative | Assesses creative writing capabilities |
| Long | Measures accuracy in generating content of specified length |
| ACG | Evaluates knowledge of Anime, Comics, and Games (ACG culture) |

## Roadmap

- [ ] Custom evaluation formula support
- [ ] Custom test data support
- [ ] Automated evaluation implementation
- [ ] Additional evaluation dimensions (e.g., lateral thinking puzzles)

## Contributing

Issues and Pull Requests are welcome to help improve this project!

## License

[GPL-3.0 License](LICENSE)