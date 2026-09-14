---
title: '합성데이터스터디 1강: Synthetic Data(합성 데이터)의 역사와 학습 신호'
description: '데이터 증강·의사 라벨링·지식 증류를 구분하고, 역번역에서 Self-Instruct까지 이어지는 역사를 통해 무엇을 생성하고 어떻게 검증할지 배웁니다.'
publishedAt: 2026-09-14
topic: synthetic-data-study
tags: ['합성데이터스터디', '1강', 'Synthetic Data', 'Data Augmentation', 'Self-Instruct']
kind: research-note
readingTime: 25
featured: false
draft: false
navLabel: '1강 · 역사와 학습 신호'
sourceLinks:
  - title: 'Long et al. — On LLMs-Driven Synthetic Data Generation, Curation, and Evaluation: A Survey (ACL Findings 2024)'
    url: 'https://aclanthology.org/2024.findings-acl.658/'
    kind: '기본 서베이'
  - title: 'Nadaș et al. — Synthetic Data Generation Using Large Language Models: Advances in Text and Code (2025)'
    url: 'https://doi.org/10.1109/ACCESS.2025.3589503'
    kind: '기본 서베이'
  - title: 'Zhang et al. — A Survey on Evaluating Quality and Trustworthiness in LLM-Generated Data (v3, 2026)'
    url: 'https://arxiv.org/abs/2601.17717v3'
    kind: '후속 강의 서베이'
  - title: 'Wang et al. — Self-Instruct: Aligning Language Models with Self-Generated Instructions (ACL 2023)'
    url: 'https://arxiv.org/html/2212.10560v2'
    kind: '대표 논문'
  - title: 'Sennrich et al. — Improving Neural Machine Translation Models with Monolingual Data (ACL 2016)'
    url: 'https://aclanthology.org/P16-1009/'
    kind: '역사적 연결'
  - title: 'Wei and Zou — EDA: Easy Data Augmentation Techniques for Boosting Performance on Text Classification Tasks (2019)'
    url: 'https://aclanthology.org/D19-1670/'
    kind: '역사적 연결'
  - title: 'Hinton et al. — Distilling the Knowledge in a Neural Network (2015)'
    url: 'https://arxiv.org/abs/1503.02531'
    kind: '개념 비교'
  - title: 'Chawla et al. — SMOTE: Synthetic Minority Over-sampling Technique (JAIR 2002)'
    url: 'https://doi.org/10.1613/jair.953'
    kind: '역사적 연결'
takeaway: 'Synthetic Data(합성 데이터)는 모델에 필요한 학습 경험을 설계하는 수단입니다. 생성량보다 무엇을 새로 만들었는지, 어떤 근거로 검증했는지, 실제 과제에서 도움이 되는지를 먼저 확인합니다.'
---

## Required Reading(필수 읽기 자료)

이번 강의에서는 아래 세 자료의 지정 범위를 읽습니다. 전문을 모두 읽을 필요는 없습니다.

| 자료 | 필수 읽기 범위 | 예상 시간 |
| --- | --- | --- |
| **[서베이 A — On LLMs-Driven Synthetic Data Generation, Curation, and Evaluation (2024)](https://aclanthology.org/2024.findings-acl.658.pdf)** | §1–2와 Figure 2: 문제 정의·요구 조건·전체 과정 | 25~35분 |
| **[서베이 B — Synthetic Data Generation Using Large Language Models: Advances in Text and Code (2025)](https://www.researchgate.net/publication/393726695_Synthetic_Data_Generation_Using_Large_Language_Models_Advances_in_Text_and_Code)** | §IV, Background and Motivation: 배경과 기존 증강 방법 | 20~30분 |
| **[대표 논문 — Self-Instruct: Aligning Language Models with Self-Generated Instructions (ACL 2023, v2)](https://arxiv.org/html/2212.10560v2)** | §2와 Figure 2, §3–4의 데이터 통계·대표 평가: 생성·선별·학습·평가 | 40~60분 |

> 서베이 B는 서론의 구성 안내보다 실제 본문의 **§IV Background and Motivation** 제목을 기준으로 찾으세요. 선택 읽기와 원문을 읽으며 남길 질문은 아래 Reading Guide(읽기 안내)에 정리했습니다.

<details class="paper-reading-list">
<summary>논문별 절 요약 펼치기 · 12편</summary>
<p>각 논문은 1강 하위의 별도 글로 연결됩니다. 필수 읽기는 위 표의 범위이며, 아래 요약은 논문 전체의 절 구조를 따라 정리했습니다.</p>
<ul>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/long-2024/"><strong>Long et al. (2024)</strong> — On LLMs-Driven Synthetic Data Generation, Curation, and Evaluation</a> <small>· 필수</small><span class="paper-one-line">생성·큐레이션·평가라는 전체 과정으로 LLM 합성 데이터 연구를 정리합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/nadas-2025/"><strong>Nadaș et al. (2025)</strong> — Synthetic Data Generation Using Large Language Models: Advances in Text and Code</a> <small>· 필수</small><span class="paper-one-line">텍스트와 코드의 생성 방법 및 검증 수단이 어떻게 다른지 비교합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/wang-2023/"><strong>Wang et al. (2023)</strong> — Self-Instruct</a> <small>· 필수</small><span class="paper-one-line">시드 과제에서 지시문·수행 예제를 생성하고 선별해 같은 모델을 학습합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/hinton-2015/"><strong>Hinton et al. (2015)</strong> — Distilling the Knowledge in a Neural Network</a> <small>· 개념 비교</small><span class="paper-one-line">교사의 출력 분포를 학생 모델의 학습 신호로 전달하는 방법을 설명합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/chawla-2002/"><strong>Chawla et al. (2002)</strong> — SMOTE</a> <small>· 역사</small><span class="paper-one-line">소수 클래스의 예제를 합성해 불균형 분류 학습을 보완합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/goodfellow-2014/"><strong>Goodfellow et al. (2014)</strong> — Generative Adversarial Networks</a> <small>· 역사</small><span class="paper-one-line">생성기와 판별기의 경쟁으로 데이터 분포를 학습하는 원리를 제시합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/sennrich-2016/"><strong>Sennrich et al. (2016)</strong> — Improving Neural Machine Translation Models with Monolingual Data</a> <small>· 역사</small><span class="paper-one-line">실제 목표 언어 문장을 남기고 역번역한 입력을 만들어 번역을 학습합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/wei-2019/"><strong>Wei &amp; Zou (2019)</strong> — EDA</a> <small>· 역사</small><span class="paper-one-line">단어 수준 변형을 통한 간단한 텍스트 증강과 적용 조건을 살펴봅니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/ge-2024/"><strong>Ge et al. (2024)</strong> — Scaling Synthetic Data Creation with 1,000,000,000 Personas</a> <small>· 후속 읽기</small><span class="paper-one-line">다양한 인물 설정으로 생성 조건을 확장하는 Persona Hub를 소개합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/"><strong>DeepSeek-AI (2025)</strong> — DeepSeek-R1</a> <small>· 후속 읽기</small><span class="paper-one-line">강화학습에서 생성한 추론을 선별·미세조정·증류로 연결합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/lee-2026/"><strong>Lee et al. (2026)</strong> — Environment-free Synthetic Data Generation for API-Calling Agents</a> <small>· 후속 읽기</small><span class="paper-one-line">실행 환경 대신 LLM이 API 응답을 모사하여 행동 궤적을 만듭니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/zhang-2026/"><strong>Zhang et al. (2026)</strong> — A Survey on Evaluating Quality and Trustworthiness in LLM-Generated Data</a> <small>· 후속 서베이</small><span class="paper-one-line">여러 데이터 유형의 품질·신뢰성과 실제 평가에서 빠진 항목을 점검합니다.</span></li>
</ul>
</details>

시험 준비를 위해 문제집 한 권을 샀다고 생각해 봅시다. 문제 수가 많으면 공부할 거리는 늘어납니다. 하지만 같은 유형만 반복되거나 정답이 틀렸다면, 두꺼운 문제집이 좋은 문제집은 아닙니다. 자신이 자주 틀리는 조건을 정확히 짚어 주는 몇 문제가 더 도움이 될 수도 있습니다.

<strong>Synthetic Data(합성 데이터)</strong>도 비슷합니다. 모델의 학습 자료를 인공적으로 만들 수 있게 되면, 중요한 질문은 “얼마나 많이 만들까?”에서 “어떤 경험을 제공해야 할까?”로 이어집니다. 이 강의에서는 <strong>연습문제를 만드는 출제자</strong>라는 비유를 따라, 데이터의 입력·정답·검증 과정을 나누어 살펴봅니다.

> <strong>읽기 기준</strong> · 합성데이터스터디 6강 중 첫 번째 자료입니다. 본문 읽기는 약 25분, 원문 읽기와 토론은 별도입니다. 문헌 확인일과 원고 작성일은 2026년 9월 14일입니다. 아래 가상의 도서관 사례와 실험 설계는 이해를 위한 창작 예시이며, 실행하거나 측정한 결과가 아닙니다.

## Learning Goals(학습 목표): 읽고 나서 설명할 세 가지

1. Synthetic Data(합성 데이터), Data Augmentation(데이터 증강), Pseudo-labeling(의사 라벨링), Knowledge Distillation(지식 증류)을 구분합니다.
2. 역사를 연도 암기 대신 <strong>해결하려던 데이터 부족의 종류</strong>로 설명합니다.
3. 자기 과제에서 무엇을 생성하고, 무엇으로 검증할지 한 페이지로 정의합니다.

Pretraining(사전학습)은 많은 자료에서 일반적인 패턴을 배우는 단계이고, SFT(Supervised Fine-Tuning, 지도 미세조정)는 입력과 바람직한 출력의 예제로 과제 수행을 학습하는 단계입니다. 이 두 개념을 알고 있으면 충분합니다. 이번 강의에서는 모델 학습을 실행하지 않아도 됩니다.

## A Running Example(공통 사례): 문서는 있는데 좋은 문답이 없다

가상의 도서관 안내 문서가 다음과 같다고 합시다.

> 일반 도서는 14일 동안 대출할 수 있다. 다른 이용자의 예약이 없으면 1회, 7일 연장할 수 있다. 참고도서는 관내에서만 이용할 수 있다.

이 문서에 답하는 QA(Question Answering, 질의응답) 모델을 만들고 싶습니다. 문서는 이미 있지만, 사용자가 어떻게 질문하는지와 어떤 답이 적절한지 보여 줄 예제는 부족합니다.

| 만들거나 확보할 부분 | 설명용 예시 | 확인할 질문 |
| --- | --- | --- |
| Source(원천 자료) | 위 안내 문서 | 실제 적용할 규정과 같은가? |
| Instruction(지시문) | 문서에 근거해 답하고, 정보가 없으면 없다고 말하라 | 원하는 행동을 명시했는가? |
| Input(입력) | 예약자가 있으면 연장할 수 있나요? | 중요한 조건을 묻는가? |
| Target(목표 응답) | 문서상 예약자가 없는 경우에만 연장할 수 있습니다 | 조건을 보존했는가? |
| Evidence(근거) | 다른 이용자의 예약이 없으면… | 응답이 의존하는 부분을 찾을 수 있는가? |

여기서 문서는 사람이 작성하고, 질문과 답변은 LLM(Large Language Model, 대규모 언어 모델)이 생성할 수 있습니다. 그러면 전부 인공적으로 만든 세계가 아니라 <strong>실제 원천 자료와 합성한 문답이 결합한 학습 데이터</strong>가 됩니다.

출제자 비유로 돌아가면 문서는 교과서, 질문은 연습문제, 목표 응답은 해설입니다. 교과서가 정확하더라도 출제자가 조건을 빼먹으면 해설은 틀릴 수 있습니다. 따라서 원천의 신뢰성과 생성 결과의 정확성은 따로 확인해야 합니다.

## Definition(정의): 데이터의 어느 부분을 만드는가

이 스터디에서 Synthetic Data(합성 데이터)는 규칙·시뮬레이션·생성 모델 등을 통해 인공적으로 구성한 데이터를 뜻합니다. 특히 LLM(Large Language Model, 대규모 언어 모델)이 생성하는 텍스트·코드·추론·행동 데이터를 중심으로 다룹니다.

<strong>“인공적으로 생성했다”는 말과 “현실을 정확히 복제했다”는 말은 다릅니다.</strong> 안내 문서에서 드물지만 중요한 예외 질문을 더 많이 만들 수도 있습니다. 목표는 실제 빈도를 그대로 복제하는 것일 수도, 부족한 능력을 집중적으로 학습시키는 것일 수도 있습니다. 어느 쪽인지는 실험 전에 정해야 합니다.

2024년 기본 서베이는 원천 예제나 입력을 활용해 생성하는 문제를 정의하고, 자동 주석도 특별한 형태의 생성으로 다룹니다. 그러므로 파일 전체에 “합성”이라는 이름만 붙이기보다, 어떤 필드가 실제 자료이고 어떤 필드가 모델 산출물인지 기록하는 것이 유용합니다. [서베이 A, §2.1](https://aclanthology.org/2024.findings-acl.658.pdf)

| 접근 | 주로 바꾸는 것 | 도서관 사례에 적용하면 |
| --- | --- | --- |
| Data Augmentation(데이터 증강) | 기존 예제의 표현·형태 | 기존 질문을 다른 표현으로 바꾸기 |
| Pseudo-labeling(의사 라벨링) | 기존 입력에 붙이는 예측 라벨 | 실제 질문에 ‘대출·연장·반납’ 분류 붙이기 |
| Synthetic Generation(합성 생성) | 입력·정답·문제 조건 중 일부 또는 전부 | 문서에서 새로운 질문과 답을 함께 만들기 |
| Knowledge Distillation(지식 증류) | 교사에서 학생으로 전달하는 학습 신호 | 교사의 응답 또는 확률 분포를 학생이 배우기 |

이 표는 배타적인 분류표가 아닙니다. LLM이 질문을 바꿔 쓰는 작업은 Data Augmentation(데이터 증강)이면서 Synthetic Generation(합성 생성)입니다. 교사 모델이 만든 답으로 학생을 학습하면 Knowledge Distillation(지식 증류)과 합성 데이터 활용이 겹칩니다.

반대로 Knowledge Distillation(지식 증류)은 기존 입력에서 교사가 내놓은 확률 분포만 전달할 수도 있으므로, 반드시 새 입력을 만드는 것은 아닙니다. 2015년 대표 논문은 Soft Targets(부드러운 목표 분포)를 통한 전달을 다룹니다. 오늘날 생성된 풀이 문장을 배우는 방식과 전달 신호를 구분해야 합니다. [Hinton et al., 2015](https://arxiv.org/abs/1503.02531)

<strong>외부 문서를 검색해서 응답에 활용하기만 했다면, 그것만으로 학습용 합성 데이터셋을 구축한 것은 아닙니다.</strong> 검색한 문서에서 문답을 생성·저장하고 학습에 사용하면, 검색은 합성 데이터 파이프라인의 근거 공급 단계가 됩니다.

## History(역사): 더 많은 표본에서 더 나은 연습문제로

합성 데이터에는 하나의 출발점이나 단일한 발전 순서가 있는 것이 아닙니다. 통계적 표본 생성, 가상 환경, 데이터 증강, 생성 모델은 서로 다른 목적에서 발전했습니다. 아래는 그 전체 역사의 축약본이 아니라, LLM 기반 학습 데이터를 이해하기 위한 연결 경로입니다.

### Before LLMs(LLM 이전): 무엇을 통제해서 만들 것인가

규칙으로 덧셈 문제를 만들면 출제자가 숫자 범위를 정하고 정답을 직접 계산할 수 있습니다. 가상 환경에서 물체 위치를 정하고 관측을 만들면, 환경의 내부 상태를 정답의 근거로 사용할 수 있습니다. 이는 생성 과정에 정답을 판정할 구조를 함께 넣는 방식입니다. 다만 가상 조건에서의 성공이 실제 환경의 성공을 보장하지는 않습니다.

데이터의 특정 부분이 부족한 문제도 오래전부터 있었습니다. <strong>SMOTE(Synthetic Minority Over-sampling Technique, 합성 소수 클래스 과표집 기법)</strong>는 소수 클래스의 예제를 합성하는 대표적인 2002년 연구입니다. 이 연구가 겨냥한 문제는 클래스 불균형이며, 자연어 지시문을 따르는 범용 생성기가 아닙니다. [SMOTE, JAIR 2002](https://doi.org/10.1613/jair.953)

이 사례에서 얻을 질문은 “원래 분포를 복사했는가?”보다 “어떤 부족을 보완했는가?”입니다. 도서관 질문의 대부분이 단순 대출 기간 문의여도, 조건부 연장 질문을 별도로 늘리는 학습 설계가 가능하다는 뜻입니다. 이 연결은 강의의 해석이며 SMOTE가 자연어 문답 생성을 검증했다는 의미는 아닙니다.

### Generative Models(생성 모델): 생성 규칙도 데이터에서 배우기

수작업 규칙으로 복잡한 문장이나 이미지를 모두 만들기는 어렵습니다. Generative Model(생성 모델)은 관찰한 자료에서 생성에 필요한 패턴을 학습합니다. 2014년 GAN(Generative Adversarial Network, 생성적 적대 신경망)은 생성기와 판별기의 경쟁을 통해 분포를 학습하는 대표적인 이정표입니다. [Goodfellow et al., 2014](https://arxiv.org/abs/1406.2661)

출제자가 모든 규칙을 직접 적는 대신, 기존 문제집을 보고 새 문제의 패턴을 익히는 쪽으로 비유할 수 있습니다. 그러나 그럴듯한 결과물을 만들 수 있다는 사실과, 그 결과물을 다른 모델의 학습에 쓰면 도움이 된다는 사실은 별개입니다. 생성 모델의 샘플 품질과 학습 데이터의 효용은 서로 다른 질문입니다.

### Back-translation(역번역): 실제 정답 쪽을 남기고 입력을 만들기

<strong>Back-translation(역번역)</strong>은 목표 언어의 실제 문장을 출발점으로 반대 방향 번역 모델을 사용해 합성 입력을 만드는 접근입니다. Sennrich 등의 연구는 이 방식으로 단일언어 자료를 번역 학습에 활용했습니다. 논문은 2015년 선공개 후 ACL 2016에 발표되었습니다. [원 논문](https://aclanthology.org/P16-1009/)

영어에서 한국어로 번역하는 모델을 학습한다고 합시다. 다음은 논문의 구조를 설명하기 위해 만든 예시입니다.

```text
실제 한국어 문장: 다른 이용자가 예약한 책은 연장할 수 없습니다.
    ↓ 한국어→영어 번역 모델
합성 영어 문장: You cannot renew a book reserved by another user.
    ↓ 학습 쌍 구성
입력 = 합성 영어 / 목표 = 실제 한국어
```

학습 쌍의 양쪽을 모두 생성할 필요가 없다는 점이 핵심입니다. 이 구조는 “어느 쪽에 믿을 수 있는 자료가 이미 있는가?”를 먼저 묻게 합니다. 도서관 문서가 있다면 문서까지 꾸며 내기보다, 그 문서에서 질문과 답을 만드는 설계를 고려할 수 있습니다.

### EDA(쉬운 데이터 증강): 작은 변형에도 가정이 있다

<strong>EDA(Easy Data Augmentation, 쉬운 데이터 증강)</strong>는 동의어 치환, 무작위 삽입·교환·삭제로 텍스트 분류 학습 자료를 늘리는 2019년 접근입니다. [Wei and Zou, 2019](https://aclanthology.org/D19-1670/)

“예약자가 없으면 연장 가능”에서 “없으면”을 삭제하면 문장의 의미와 정답 조건이 달라집니다. 이 문장은 강의의 반례 예시입니다. 가벼운 편집도 Label Preservation(라벨 보존)을 전제하며, 그 전제가 깨지면 잘못된 연습문제가 됩니다.

이 문제는 현대 LLM에도 이어집니다. 표현을 자연스럽게 바꾸었다고 의미가 보존된 것은 아닙니다. “조건·부정·수량이 유지됐는가?”를 확인하는 이유는 생성기가 더 유창해졌어도 사라지지 않습니다.

### Instruction Data(지시문 데이터): 문제 유형 자체를 만들기

앞선 방식은 주어진 문제의 입력을 보충하거나 바꾸는 데 집중했습니다. Instruction Data(지시문 데이터)는 무엇을 수행해야 하는지 나타내는 지시까지 학습 예제에 포함합니다. 분류·요약·추출·작성처럼 과제의 종류도 데이터 설계 대상이 됩니다.

<strong>Self-Instruct</strong>는 적은 수의 사람이 쓴 시드 과제에서 출발해 지시문과 수행 예제를 생성하고, 선별한 결과로 모델을 미세조정하는 대표 사례입니다. 2022년 12월 최초 공개되었고 ACL 2023에 발표되었습니다. [Self-Instruct, v2](https://arxiv.org/html/2212.10560v2)

| 연결점 | 데이터 부족의 종류 | 1강에서 기억할 질문 |
| --- | --- | --- |
| 규칙·가상 환경 | 실제로 수집하기 어려운 조건 | 정답을 생성 과정에서 알 수 있는가? |
| SMOTE — 2002 | 소수 클래스의 예제 | 부족한 영역을 의도적으로 늘렸는가? |
| GAN — 2014 | 복잡한 생성 규칙 | 학습한 분포의 한계는 무엇인가? |
| 역번역 — 2015/2016 | 입력–정답의 쌍 | 실제 자료가 남아 있는 쪽은 어디인가? |
| EDA — 2019 | 기존 예제의 변형 | 변형 후 정답이 유지되는가? |
| Self-Instruct — 2022/2023 | 다양한 과제와 수행 예제 | 무엇을 가르칠지까지 생성했는가? |

이 표의 연도는 위 원문의 공개·발표 정보를 따릅니다. 새 방법이 옛 방법을 모두 대체했다는 뜻은 아닙니다. 정답을 계산할 수 있는 문제에는 지금도 규칙 기반 검증이 유용합니다.

## Self-Instruct Reading(원문 읽기): 생성과 학습을 나누어 보기

### Method(방법): 출제·선별·학습의 연결

원 논문은 사람이 작성한 175개 시드 과제로 시작합니다. 기존 과제를 예시로 제시해 새 지시문을 만들고, 분류 과제인지 판별한 다음 입력·출력 예제를 생성합니다. 부적절하거나 유사한 결과를 걸러 과제 풀에 추가하고, 모은 데이터로 GPT-3를 미세조정합니다. 분류 과제와 다른 과제에 서로 다른 예제 생성 순서를 사용한다는 점에도 주목합니다. [Self-Instruct, §2](https://arxiv.org/html/2212.10560v2#S2)

```text
사람의 시드 과제 → 새 지시문 → 과제 유형 판별 → 입력·출력 생성
                        ↑                         ↓
                     과제 풀 ←──────────── 선별한 결과

수집한 지시문 데이터 → 별도의 미세조정 → 새로운 지시에서 평가
```

생성 반복 중 과제 풀이 커지는 것과 매 반복마다 모델 가중치가 갱신되는 것은 다릅니다. 위 그림은 데이터 수집 루프와 이후 학습을 분리해 그린 개념도입니다.

### Evidence(근거): 무엇을 확인했고 무엇이 남았는가

논문은 약 5만 2천 개 지시문과 8만 2천 개 입력·출력 예제를 보고하고, Super-NaturalInstructions 및 별도의 사용자 지향 과제로 지시 수행 능력을 평가합니다. 지시문 수와 수행 예제 수는 다른 단위입니다. 시드와 선별 규칙이 있으므로 “사람의 설계가 전혀 없다”는 해석도 맞지 않습니다. [Self-Instruct, §3–4](https://arxiv.org/html/2212.10560v2#S3)

### Critical Reading(비판적 읽기): 네 질문을 원문에 표시하기

1. 사람이 제공한 부분은 어디인가?
2. 생성과 미세조정은 각각 언제 일어나는가?
3. 필터가 확인하는 것은 중복인가, 형식인가, 정답성인가?
4. 평가 과제가 달라져도 결론이 유지된다는 근거가 있는가?

이 질문은 논문의 주장을 과장하지 않고 후속 연구로 연결하기 위한 읽기 도구입니다. 예를 들어 단어 유사성이 낮은 두 질문도 같은 능력을 반복할 수 있으므로, 중복 제거와 능력 범위 확보를 별도로 생각해 볼 수 있습니다.

## Learning Signal(학습 신호): 이미 아는 것으로 다시 배우는 이유

“모델이 자기 지식으로 문제를 만들었다면, 새로운 지식을 얻은 것도 아닌데 왜 학습할까?”라는 질문이 자연스럽습니다. 여기서는 <strong>새로운 사실의 획득</strong>과 <strong>원하는 행동을 더 안정적으로 수행하는 학습</strong>을 구분해야 합니다.

다음은 결과를 보장하는 법칙이 아니라, 합성 데이터가 도움이 될 수 있는 이유를 이해하기 위한 설명 틀입니다.

| 가능한 역할 | 도서관 예시 | 확인할 한계 |
| --- | --- | --- |
| 지식의 과제 형태 변환 | 규정 문장을 질문–응답 예제로 바꾸기 | 변환 중 조건을 잃을 수 있음 |
| 부족한 조건의 반복 연습 | 예약·참고도서 같은 예외 질문 늘리기 | 실제 질문의 분포와 멀어질 수 있음 |
| 행동의 일관성 학습 | 정보가 없으면 없다고 답하는 예제 제공 | 무조건 답변을 거부하는 편향 가능 |
| 교사 신호의 전달 | 교사의 적절한 답을 학생이 배우기 | 교사 오류도 전달될 수 있음 |

교과서를 읽어서 알고 있는 내용도 연습문제를 통해 더 안정적으로 적용할 수 있습니다. 모델에서도 필요한 출력 형식과 조건을 반복적으로 학습시키는 것은 가능한 역할입니다. 다만 실제 개선 여부는 독립 평가로 확인해야 합니다.

또한 닫힌 생성 루프와 외부 정보가 들어오는 루프를 구분해야 합니다. 새로운 규정 문서나 코드 실행 결과가 제공되면 추가 근거가 들어옵니다. 그런 입력 없이 같은 모델이 여러 번 동의했다고 해서 새로운 현실의 사실이 확인된 것은 아닙니다.

<strong>Generation Volume(생성량)은 Independent Evidence(독립적인 근거)의 양과 같지 않습니다.</strong> 같은 교과서에서 비슷한 문제 천 개를 만들었다고 교과서 천 권을 새로 읽은 것은 아닙니다. 이 비유는 생성량을 곧 정보량으로 해석하지 않기 위한 기준입니다.

## Pipeline(전체 과정): 생성 결과가 학습 데이터가 되기까지

2024년 서베이의 Generation(생성)–Curation(큐레이션)–Evaluation(평가) 구조를 우리 사례에 적용하면 다음과 같습니다. 학습과 평가셋의 분리는 이 강의에서 실험 설계를 위해 덧붙인 표현입니다. [서베이 A, Figure 2 및 §3](https://aclanthology.org/2024.findings-acl.658.pdf)

```text
원천 문서와 시드 예제
    ↓
Generation(생성): 질문·목표 응답·근거 후보 만들기
    ↓
Curation(큐레이션): 조건 오류 수정, 중복 제거, 과제 구성 조정
    ↓
Training(학습): 선택한 데이터로 모델의 행동 학습
    ↓
Evaluation(평가): 별도로 확보한 실제 질문에서 확인
```

좋은 생성 결과의 조건과 좋은 학습 데이터셋의 조건도 구분해야 합니다. 하나의 문답이 정확하더라도, 전체가 대출 기간 질문뿐이면 예외 조건에 대한 연습은 부족합니다. 반대로 다양한 질문이 있어도 답이 틀리면 잘못된 신호를 전달합니다.

평가용 질문을 그대로 프롬프트에 넣어 학습 예제를 만들면 독립성을 잃습니다. 모델 선택과 필터 조정에 사용하는 Development Set(개발용 평가셋)과 마지막 확인에 사용하는 Held-out Test Set(분리해 둔 최종 평가셋)을 구분해 둡니다. 문서 기반 과제에서는 같은 문서의 새 질문으로 평가할지, 새로운 문서로 평가할지도 목표에 맞춰 명시합니다.

## Looking Ahead(다음 흐름): 2024~2026을 읽을 좌표

다음 표는 세 서베이와 대표 논문을 연결한 <strong>스터디의 학습 경로</strong>입니다. 각 연도에 오직 하나의 주제만 연구되었다거나, 분야 전체가 일제히 이동했다는 주장은 아닙니다.

| 읽기 좌표 | 핵심 관심 | 연결 강의 |
| --- | --- | --- |
| 2024: 생성 과정의 체계화 | 생성 조건, 다양성, 큐레이션을 어떻게 구성하는가 | 2~3강 |
| 2025: 추론과 학습 신호 | 생성된 풀이를 어떻게 선별하고 증류하는가 | 4~5강 |
| 2026: 행동 궤적과 평가 범위 | 상호작용을 어떻게 합성하고 신뢰성을 점검하는가 | 5~6강 |

2024년 Persona Hub는 페르소나를 통한 생성 조건 확장의 사례이고, 2025년 DeepSeek-R1은 추론 학습과 증류를 연결해 읽을 사례입니다. 2026년에는 LLM이 API 응답을 모사해 행동 궤적을 만드는 연구도 등장합니다. 각각을 해당 강의에서 살펴봅니다. [Persona Hub](https://arxiv.org/abs/2406.20094), [DeepSeek-R1](https://arxiv.org/abs/2501.12948), [API-Calling Agents, 2026](https://arxiv.org/abs/2607.16900)

2026년 서베이 C는 여러 데이터 유형의 품질·신뢰성 평가를 정리합니다. 1강에서는 목차만 확인하고, 텍스트·추론에 해당하는 부분을 진도에 맞춰 읽겠습니다. [서베이 C, v3](https://arxiv.org/html/2601.17717v3)

## Reading Guide(읽기 안내): 이번 주에 읽을 범위

서베이를 처음부터 끝까지 한 번에 읽기보다, 같은 질문에 답하는 부분을 연결합니다. 아래 시간은 스터디 운영을 위한 예상치입니다.

| 우선순위 | 읽을 부분 | 원문 옆에 남길 메모 |
| --- | --- | --- |
| 필수 · 25~35분 | 서베이 A §1–2, Figure 2 | 생성되는 데이터와 요구 조건 |
| 필수 · 20~30분 | 서베이 B §IV, Background and Motivation | 기존 증강과 LLM 생성의 연결 |
| 필수 · 40~60분 | Self-Instruct §2, Figure 2, §3–4의 대표 평가 | 사람의 개입·생성 루프·학습 시점·평가 조건 |
| 선택 · 20~30분 | 역번역 논문의 방법 부분 | 학습 쌍에서 실제인 쪽과 합성인 쪽 |
| 미리보기 · 5분 | 서베이 C 목차 | 텍스트와 추론 데이터의 평가 항목 |

서베이 B는 [제공된 전문](https://www.researchgate.net/publication/393726695_Synthetic_Data_Generation_Using_Large_Language_Models_Advances_in_Text_and_Code)의 실제 본문 제목을 기준으로 읽습니다. 서론의 구성 안내와 본문 절 번호가 일치하지 않는 부분이 있어, <strong>§IV Background and Motivation</strong>이라는 제목을 함께 확인하세요. 서베이 C는 2026년 6월 개정판인 v3로 통일합니다.

## Discussion(토론): 출제자의 결정을 설명해 보기

다음 질문은 정해진 한 문장을 맞히기 위한 퀴즈가 아닙니다. 자신이 선택한 목적과 가정을 함께 설명해 보세요.

1. 실제 질문은 충분하지만 정답이 없다면, 새 질문 생성부터 시작해야 할까요? 기존 입력에 라벨이나 응답을 붙이는 대안과 비교하세요.
2. 질문을 100가지 문체로 바꾸면 어떤 다양성이 늘고, 어떤 다양성은 그대로일까요? 표현과 요구 능력을 나눠 보세요.
3. 생성 모델과 평가 모델이 같은 답에 동의하면 정답이라고 판단할 수 있을까요? 필요한 외부 근거를 적어 보세요.
4. 실제보다 예외 질문을 많이 학습시키는 것은 분포 왜곡일까요, 필요한 설계일까요? 목표와 평가 기준을 함께 말해 보세요.
5. Self-Instruct를 “스스로 계속 학습하는 모델”이라고 설명하면 어떤 단계가 생략될까요? 데이터 수집과 미세조정을 분리해 보세요.

2시간 모임이라면 개념 연결 10분, 본문 설명 30분, 논문 발제 30분, 토론·과제 설계 35분, 정리 15분으로 진행할 수 있습니다.

## Assignment(1강 과제): 데이터 부족을 한 페이지로 정의하기

이번 주에는 대규모 생성보다 <strong>무엇이 부족한지 명확하게 적는 것</strong>을 목표로 합니다. 아래는 도서관 예시로 작성한 미실행 설계안입니다.

| 항목 | 예시 설계 |
| --- | --- |
| Target Task(목표 과제) | 안내 문서의 조건을 지키면서 사용자 질문에 답하기 |
| Data Gap(데이터 부족) | 문서는 있지만 예외·조건부 질문과 검증된 답변이 부족함 |
| Source(원천) | 버전을 고정한 안내 문서와 사람이 쓴 소수 문답 |
| Generated Fields(생성 필드) | 질문, 목표 응답, 근거 문장 후보 |
| Fixed Fields(고정 필드) | 원문, 문서 식별자, 적용 버전 |
| Verification(검증) | 근거와 조건 일치 확인, 사람의 표본 검토 |
| Failure Cases(실패 유형) | 예약 조건 누락, 없는 연체료 추정, 참고도서 혼동 |
| Evaluation(평가) | 생성에 쓰지 않은 실제 질문에서 정답성과 근거 일치 확인 |
| Baseline(기준선) | 같은 모델에서 사람이 만든 예제만 사용하는 조건 |
| Cost(비용) | 생성·검토·학습 시간을 구분해 기록 |

직접 제출할 문서에는 다음을 포함합니다.

- 목표 과제와 데이터 부족을 각각 한 문장으로 씁니다.
- 좋은 예제 두 개와 잘못된 예제 두 개를 직접 작성합니다.
- 각 예제에서 실제 자료와 합성할 필드를 표시합니다.
- 오류를 무엇으로 판정할지 적고, 판정하기 어려운 경우도 하나 남깁니다.
- 실제 평가 자료를 어디서 확보하고 어떻게 분리할지 설명합니다.

예를 들어 문서에 연체료 정보가 없는데 “하루 100원”이라고 답하면, 이 과제에서는 근거 없는 응답입니다. “문서에 연체료 정보가 없습니다”는 적절한 목표 응답이 될 수 있습니다. 이 판정은 실제 모든 도서관의 요금에 대한 주장과 다릅니다. <strong>주어진 문서에 근거해서 답한다는 과제 조건</strong>에서 판단한 것입니다.

평가 자료를 확보하지 못했다면 그 사실을 그대로 적습니다. 합성 예제를 사람이 검토한 결과와, 그 예제로 학습한 모델의 성능 개선은 서로 다른 결과입니다. 이번 과제는 후자를 측정하지 않습니다.

## Vocabulary(핵심 용어): 무엇을 가리키는지 다시 확인하기

| English | 한국어 | 이 강의에서의 의미 |
| --- | --- | --- |
| Synthetic Data | 합성 데이터 | 인공적으로 구성한 학습·평가 자료 |
| Data Augmentation | 데이터 증강 | 기존 예제로부터 학습에 유용한 변형 만들기 |
| Pseudo-labeling | 의사 라벨링 | 기존 입력에 모델 예측을 라벨로 붙이기 |
| Knowledge Distillation | 지식 증류 | 교사의 학습 신호를 학생에게 전달하기 |
| Seed Data | 시드 데이터 | 생성 방향을 잡는 초기 예제 |
| Instruction | 지시문 | 수행할 과제를 설명하는 문장 |
| Target | 목표 응답 | 학습 중 출력하도록 제시한 답; 반드시 참인 것은 아님 |
| Grounding | 근거 연결 | 응답을 원문·관측·실행 결과에 연결하기 |
| Curation | 큐레이션 | 제거·수정·선별·구성으로 학습 자료 다듬기 |
| Diversity | 다양성 | 표현뿐 아니라 주제·조건·능력의 범위를 포함 |
| Utility | 효용 | 목표 과제에 실제로 도움이 되는 정도 |
| Held-out Test Set | 분리해 둔 최종 평가셋 | 생성·선택·조정에서 분리한 마지막 평가 자료 |

## Next Lesson(다음 강의): 어떤 문제를 얼마나 만들까

1강에서 기억할 기준은 네 가지입니다.

- 데이터의 어느 부분을 만드는지 구분합니다.
- 어떤 부족을 해결하려는지 먼저 정의합니다.
- 생성과 검증, 데이터 수집과 모델 학습을 나눕니다.
- 생성량과 실제 학습 효용을 같은 것으로 취급하지 않습니다.

2강에서는 이 문제 정의를 Generation Plan(생성 계획)으로 바꿉니다. 같은 도서관 문서를 두고 주제·조건·난이도·사용자 표현을 어떻게 나눌지, Seed Data(시드 데이터)와 생성 조건이 데이터셋의 범위를 어떻게 바꾸는지 살펴보겠습니다.
