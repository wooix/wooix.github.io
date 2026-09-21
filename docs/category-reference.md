# Research Category Reference(연구 분류 참조)

적용: 논문 조사, 리뷰, 개념 노트, 연구그룹 블로그 소개, Daily 요약과 카테고리 추가. 새 글을 쓰기 전에 이 문서를 읽는다.

## 목적과 기준

연구 분야와 학습 순서를 분리한다. 연구 분류는 **대분류 → 세부 분야**의 두 단계이다. 논문·글은 반드시 하나의 `category`를 갖고, 추가 관점은 `tags`로 표현한다. 글 URL과 `parentPost`는 연구 분류와 독립적이다. 스터디 강의·참고 논문은 `navigation.ts`의 읽기 모음으로 재사용한다.

기계가 읽는 원장은 `src/data/category-reference.json`이다. ID, 짧은 메뉴명, 영어명, 범위, 검색 키워드, 대분류 색상, 출처와 확인일을 보관한다. `categories.ts`, 메뉴, 카테고리 페이지, 아카이브 필터, 그래프가 이를 공유한다. JSON의 키워드는 후보 탐색용이지 제목 문자열만 보고 자동 분류할 규칙이 아니다.

분류체계는 블로그 편집용으로 재구성한 것으로 학회의 공식 표준을 그대로 옮긴 것이 아니다. 2026-09-21에 확인한 Primary Source(1차 출처):

- [ACL 2026 Submission Topics](https://2026.aclweb.org/calls/main_conference_papers/): 언어 모델, 에이전트, 검색 증강, 해석 가능성, 정렬, 금융, 멀티모달, 효율 등 NLP 분야의 범위 확인.
- [ICML 2026 Topics of Interest](https://icml.cc/Conferences/2026/CallForPapers): 학습 원리, 최적화, 강화학습, 평가, 시스템·하드웨어, 신뢰성과 응용의 범위 확인.
- [arXiv Category Taxonomy](https://arxiv.org/category_taxonomy): cs.AI, cs.CL, cs.LG, cs.CV, cs.RO, cs.DC, cs.AR 등 인접 분야 검색 시 활용. arXiv의 대분야 ID와 이 블로그의 세부 분야를 동일시하지 않는다.

## 작성 순서

1. 원문의 초록·방법·평가를 확인하고 “이 논문이 새롭게 바꾸는 것은 무엇인가?”를 한 문장으로 적는다.
2. 아래 참조표와 JSON 범위·키워드에서 후보를 고른다. 핵심 기여에 가장 가까운 세부 분야 하나를 `category`로 기록한다.
3. 모델 크기(SLM), 데이터 도메인(finance), 방법(DPO), 학회, 발표 연도, 연구그룹 등 부가 관점은 tags로 기록한다. 연구그룹 글도 내용 중심으로 분류하고 발표 자체의 동향 분석일 때만 research-trends를 사용한다.
4. 스터디에 쓰이면 기존 `topic: synthetic-data-study`, `parentPost`, `navigation.ts` 읽기 순서를 유지한다. FInject 모음은 `topic: finject`를 유지한다. 일반 글의 topic은 기존 URL 호환 필드이며 생략 시 llm-tech이다. category가 연구 분야의 기준이다.
5. 이미 원장에 있는 미사용 분야는 그대로 지정한다. 공개 일반 글이나 강의가 처음 생기면 왼쪽 연구 메뉴가 자동으로 활성화된다. `parentPost`가 있는 스터디·FInject 첨부 논문은 왼쪽 Study Collections의 강의 하위에만 표시한다. 연구 category 메타데이터와 전체 분류·아카이브 검색은 유지한다. 빈 분류는 `/categories/`에서 찾을 수 있다. 예약일 전·draft 글은 메뉴 활성화와 개수에 포함하지 않는다.
6. check, taxonomy 테스트, build와 Pagefind 미리보기를 확인한다. 다른 사람이 작성 중인 글의 분류를 추측해 채우거나 작업을 덮어쓰지 않는다.

## 경계가 겹칠 때

- Reasoning(추론) 능력·계획·RLVR을 개선하면 `reasoning`; GPU에서 실행 시간을 줄이면 `inference`. 같은 inference라는 영어라도 역할로 구분한다.
- 사람 선호·보상 모델·DPO가 핵심이면 `alignment`; 활성값을 조작하면 `steering`; 내부 회로 설명이 핵심이면 `interpretability`. 공격·방어는 `safety`이다.
- Teacher–Student(교사–학생) 전달이 기여이면 `distillation`; 학생 학습용 생성 데이터 자체가 기여이면 `synthetic-data`; 이미 존재하는 데이터의 선별·혼합은 `curation`이다. SLM이라는 이유만으로 효율 분야에 넣지 않는다.
- AWQ처럼 모델 표현의 비트 수·압축 방법이면 `compression`; 실제 NPU/FPGA 매핑·메모리 계층 설계이면 `hardware`; 서빙 스케줄링·캐시·디코딩 실행은 `inference`이다.
- 코드 생성·실행 검증이 핵심인 EvalPlus는 `code`이며 tags에 benchmark를 추가한다. 여러 과제에 적용하는 평가 방법론은 `evaluation`이다.
- ReAct처럼 환경·도구 상호작용이 핵심이면 `agents`; 문서 검색·지식 주입 메커니즘이면 `retrieval`이다.
- 금융에서 쓰였다는 이유만으로 `finance`로 옮기지 않는다. 범용 응답 유보·견고성 기여는 `reliability` + finance tag, 금융 수치·시계열 도메인 자체가 기여이면 `finance`이다. FInject 모음에는 어느 쪽도 연결할 수 있다.
- 생성 방식 자체의 기초 연구(GAN, VAE, diffusion)는 `generative-models`; 이를 사용한 학습자료 합성·증강은 `synthetic-data`이다.
- 분야 전체를 다루는 서베이도 대상 분야에 둔다. 여러 분야를 넘나드는 연구 흐름·모델 발표 비교만 `research-trends`로 둔다.

## 없는 분류를 추가하는 절차

기존 세부 분야·동의어·tags로 표현할 수 있는지 먼저 확인한다. 단일 논문명·모델명·연도·학회·조직 이름은 새 분류로 만들지 않는다. 기존 범위로 핵심 기여를 표현할 수 없다면, 관련 공식 학회 분야나 원 논문·서베이의 taxonomy를 확인한다. 새 분야라는 이유만으로 여러 글이 쌓일 때까지 기다릴 필요는 없다.

`category-reference.json`의 적합한 대분류 children에 `{id, label, english, scope, keywords}`를 추가한다. ID는 영문 kebab-case, 전체에서 유일하고 안정적으로 유지한다. scope에는 포함할 연구와 가까운 기존 분야와의 차이를 명시한다. 새 대분류가 꼭 필요한 경우에도 children 한 단계만 허용하고 색상을 추가한다. 이 문서에 경계 판단과 출처·확인일을 보완하고 editorial.config.json의 classification 계약과 일치하는지 확인한다. 글에 category를 적용하면 페이지·필터·메뉴는 원장에서 자동 생성된다.

이름 변경은 label만 바꾼다. ID 변경·분류 통합이 필요하면 기존 글과 외부 카테고리 URL의 이전 계획을 먼저 작성한다. 기존 논문 본문과 URL은 분류 변경 때문에 수정하지 않는다.

## 원고 예시

```yaml
category: agents
# 아래는 선택 사항: 학습 순서와 연구 분류는 독립적이다.
topic: synthetic-data-study
parentPost: synthetic-data-study/05-reasoning-agents
tags: [ReAct, Tool Use, Reasoning]
```

## 2단계 참조표

| 대분류 | 세부 분야 | category ID | 탐색 키워드 |
|---|---|---|---|
| Models & Learning(모델·학습) | Architecture(모델 구조) | `architecture` | Attention, Transformer, MoE, SSM, recurrent, diffusion LM |
| Models & Learning(모델·학습) | Pretraining & Scaling(사전학습·스케일링) | `pretraining` | scaling laws, compute optimal, pretraining, tokenizer |
| Models & Learning(모델·학습) | Post-training(사후학습) | `post-training` | SFT, fine-tuning, LoRA, PEFT, continual learning |
| Models & Learning(모델·학습) | Learning Theory(학습 원리) | `learning-theory` | optimization, generalization, representation learning, probabilistic methods |
| Data(데이터) | Synthetic Data(합성 데이터) | `synthetic-data` | synthetic data, instruction synthesis, persona, augmentation, back translation |
| Data(데이터) | Curation & Mixtures(선별·구성) | `curation` | filtering, deduplication, data selection, data mixture, curriculum |
| Data(데이터) | Datasets & Collection(데이터셋·수집) | `datasets` | annotation, corpus, data provenance, collection |
| Data(데이터) | Generative Models(생성 모델) | `generative-models` | GAN, VAE, diffusion, flow matching |
| Reasoning & Agents(추론·에이전트) | Reasoning & Planning(추론·계획) | `reasoning` | CoT, reasoning RL, RLVR, search, planning, test-time compute |
| Reasoning & Agents(추론·에이전트) | Agents & Tools(에이전트·도구) | `agents` | tool use, API calling, multi-agent, memory, browser agent |
| Reasoning & Agents(추론·에이전트) | Code & Verification(코드·검증) | `code` | code generation, execution feedback, program synthesis, unit tests |
| Reasoning & Agents(추론·에이전트) | Retrieval & RAG(검색·RAG) | `retrieval` | retrieval, RAG, grounding, knowledge graphs, embeddings |
| Alignment & Control(정렬·제어) | Preference Alignment(선호 정렬) | `alignment` | RLHF, DPO, reward modeling, preference learning |
| Alignment & Control(정렬·제어) | Steering(Steering) | `steering` | activation steering, representation engineering, control vectors |
| Alignment & Control(정렬·제어) | Interpretability(해석 가능성) | `interpretability` | mechanistic interpretability, circuits, sparse autoencoders, probing |
| Evaluation & Trust(평가·신뢰성) | Evaluation & Benchmarks(평가·벤치마크) | `evaluation` | benchmark, LLM judge, human evaluation, contamination, reproducibility |
| Evaluation & Trust(평가·신뢰성) | Reliability & Abstention(신뢰성·응답 유보) | `reliability` | hallucination, uncertainty, calibration, abstention, unanswerability, robustness |
| Evaluation & Trust(평가·신뢰성) | Safety & Security(안전·보안) | `safety` | jailbreak, prompt injection, privacy, adversarial attacks, fairness, bias |
| Efficiency & Systems(효율·시스템) | Knowledge Distillation(지식 증류) | `distillation` | teacher student, distillation, small language model |
| Efficiency & Systems(효율·시스템) | Quantization & Compression(양자화·압축) | `compression` | quantization, pruning, sparsity, low rank compression |
| Efficiency & Systems(효율·시스템) | Inference & Serving(추론 실행·서빙) | `inference` | KV cache, batching, speculative decoding, serving, latency |
| Efficiency & Systems(효율·시스템) | Hardware & On-device(하드웨어·온디바이스) | `hardware` | CPU, GPU, NPU, FPGA, ASIC, memory bandwidth, on-device, edge |
| Efficiency & Systems(효율·시스템) | Distributed Training(분산 학습) | `training-systems` | parallelism, distributed training, communication, kernels |
| Modalities & Interaction(멀티모달·상호작용) | Vision & Multimodality(비전·멀티모달) | `multimodal` | VLM, image, video, multimodal reasoning, document understanding |
| Modalities & Interaction(멀티모달·상호작용) | Speech & Language(음성·언어) | `speech-language` | speech, audio, multilingual, translation, low-resource NLP |
| Modalities & Interaction(멀티모달·상호작용) | Embodied AI(로봇·행동) | `embodied` | robotics, VLA, world model, embodied AI |
| Modalities & Interaction(멀티모달·상호작용) | Human–AI Interaction(인간·AI 상호작용) | `human-ai` | HCI, dialogue, usability, human collaboration |
| Applications(응용 분야) | Finance & Time Series(금융·시계열) | `finance` | financial reasoning, finance, time series, forecasting |
| Applications(응용 분야) | Science & Healthcare(과학·의료) | `science` | scientific discovery, biology, chemistry, medicine, healthcare |
| Applications(응용 분야) | Domain Applications(산업·교육) | `domain-applications` | legal, education, industry, recommendation |
| Research Landscape(연구 동향) | Trends & Technical Reports(동향·기술 보고) | `research-trends` | model release, research trend, lab blog, technical report |
