---
title: '0강 · Introduction'
description: '핵심 서베이 4편을 중심으로 역사, 생성, 큐레이션, 코드, 추론·에이전트, 평가·신뢰성을 연결하는 6강 학습 지도입니다.'
publishedAt: 2026-09-14
updatedAt: 2026-09-20
topic: synthetic-data-study
tags: ['합성데이터스터디', 'Introduction', '학습 계획']
kind: research-note
readingTime: 12
featured: false
draft: false
navLabel: '0강 · Introduction'
sourceLinks:
  - title: 'Long et al. (2024) — On LLMs-Driven Synthetic Data Generation, Curation, and Evaluation: A Survey'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/long-2024/'
    kind: '핵심 서베이 A'
  - title: 'Ke Wang et al. (2024) — A Survey on Data Synthesis and Augmentation for Large Language Models'
    url: 'https://wooix.github.io/notes/synthetic-data-study/00-introduction/papers/wang-2024/'
    kind: '핵심 서베이 D'
  - title: 'Nadaș et al. (2025) — Synthetic Data Generation Using Large Language Models: Advances in Text and Code'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/nadas-2025/'
    kind: '핵심 서베이 B'
  - title: 'Zhang et al. (2026) — A Survey on Evaluating Quality and Trustworthiness in LLM-Generated Data'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/zhang-2026/'
    kind: '핵심 서베이 C'
takeaway: '역사에서 출발해 무엇을 생성하고, 무엇을 남기고, 무엇으로 검증할지 배웁니다. 서베이는 진도별로 나누어 읽고, 대표 원논문으로 방법과 근거를 확인합니다.'
---

## Required Reading: 핵심 서베이 4편

네 편을 처음부터 모두 완독하지 않습니다. 아래 자료를 공통 지도로 삼고, 각 강의에서 지정한 부분을 나누어 읽습니다. 기존 1강과의 연결을 위해 A·B·C 표기는 유지하고, 추가한 2024년 자료를 D로 부릅니다. 표는 연도순입니다.

| 서베이 · 절별 요약 | 읽는 관점 | 주로 연결할 강의 |
| --- | --- | --- |
| **A · Long et al. (2024)** — [On LLMs-Driven Synthetic Data Generation, Curation, and Evaluation: A Survey](/notes/synthetic-data-study/01-foundations/papers/long-2024/) | 생성 → 큐레이션 → 평가의 공통 작업 흐름 | 1·2·3·6강 |
| **D · Ke Wang et al. (2024)** — [A Survey on Data Synthesis and Augmentation for Large Language Models](/notes/synthetic-data-study/00-introduction/papers/wang-2024/) | 데이터 준비부터 사전학습·미세조정·지시학습·선호 정렬까지, 학습 단계별 합성 데이터의 역할 | 1·2·5강, 6강 종합 |
| **B · Nadaș et al. (2025)** — [Synthetic Data Generation Using Large Language Models: Advances in Text and Code](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/) | 텍스트와 코드의 생성 방법·검증 수단 비교 | 1·2·4·5강 |
| **C · Zhang et al. (2026)** — [A Survey on Evaluating Quality and Trustworthiness in LLM-Generated Data](/notes/synthetic-data-study/01-foundations/papers/zhang-2026/) | 데이터 유형별 품질·신뢰성 지표와 평가 공백 | 3·4·5·6강 |

<details class="paper-reading-list">
<summary>서베이 절별 해설 펼치기 · 4편</summary>
<ul>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/long-2024/">Long et al. (2024)</a><span class="paper-one-line">생성 조건, 큐레이션, 직접·간접 평가를 하나의 흐름으로 읽습니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/nadas-2025/">Nadaș et al. (2025)</a><span class="paper-one-line">텍스트와 코드의 방법을 비교하고 원문 설명의 적용 범위를 확인합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/zhang-2026/">Zhang et al. (2026)</a><span class="paper-one-line">여러 데이터 유형에서 품질과 신뢰성을 무엇으로 측정하는지 살펴봅니다.</span></li>
<li><a href="/notes/synthetic-data-study/00-introduction/papers/wang-2024/">Wang et al. (2024)</a><span class="paper-one-line">합성·증강 기법을 LLM 학습 단계와 핵심 기능으로 나누어 읽습니다.</span></li>
</ul>
</details>

위 논문 제목을 누르면 절별 요약으로 이동하며, 실제 원문 링크는 각 요약 상단에서 확인할 수 있습니다. B는 출판본의 실제 절 제목을 기준으로 찾고, C는 2026년 6월 개정판 v3를 기준으로 읽습니다. 서베이 D의 학습 단계 구분은 [서베이 D §3 요약](/notes/synthetic-data-study/00-introduction/papers/wang-2024/)에 제시되어 있습니다.

## 1. 학습 방향: 논문 목록을 판단 기준으로 바꾸기

### 공통 질문

문제집을 만들 때 문제 수만 늘리지 않고 학습자의 부족한 능력과 정답의 근거를 먼저 생각하듯, <strong>Synthetic Data(합성 데이터)</strong>도 어떤 학습 경험이 필요한지부터 정합니다. 목표는 방법 이름을 외우는 것이 아니라 다음 질문에 근거를 들어 답하는 것입니다.

- 무엇이 부족한가: 입력, 정답, 지시문, 추론 과정, 행동 경험 중 어느 부분인가?
- 무엇을 만들 것인가: 실제 자료를 변형할 것인가, 새 사례를 생성할 것인가?
- 무엇을 남길 것인가: 정확성·다양성·난이도·비용을 어떤 기준으로 판단할 것인가?
- 무엇으로 검증할 것인가: 원문 근거, 실행, 사람 검토, 모델 판정 중 무엇이 가능한가?
- 무엇을 개선했는가: 데이터가 좋아 보이는 것과 학습 후 성능 개선을 구분했는가?

### 역사와 2024–2026년을 연결하는 방식

역번역·증강·증류에서 출발해 지시문, 코드, 추론, 행동 궤적으로 읽기 범위를 넓힙니다. 2024년의 두 서베이로 작업 흐름과 학습 단계를 함께 보고, 2025년 서베이로 텍스트·코드의 차이를, 2026년 서베이로 평가의 세부 차원을 살펴봅니다.

이는 이 스터디의 학습 경로입니다. 해당 연도에 특정 주제가 처음 생겼다거나 새 방법이 이전 방법을 모두 대체했다는 뜻은 아닙니다. 평가와 출처 기록은 1강부터 적용하고, 6강에서 종합합니다.

## 2. 전체 지도: 6강의 역할과 연결

| 강의 | 역할 | 핵심 질문 | 누적 산출물 |
| --- | --- | --- | --- |
| [1강 · 역사와 학습 신호](/notes/synthetic-data-study/01-foundations/) | 문제 정의 | 무엇을 합성하며 왜 학습에 도움이 될 수 있는가? | 데이터 부족 정의서 |
| [2강 · 텍스트·지시문 생성과 데이터셋 설계](/notes/synthetic-data-study/02-text-instructions/) | 생성 설계 | 어떤 주제·조건·난이도로 예제를 만들 것인가? | 생성 계획과 예제 형식 |
| [3강 · 큐레이션과 데이터 구성](/notes/synthetic-data-study/03-curation/) | 선택과 구성 | 무엇을 버리고 고치며 어떤 비율로 남길 것인가? | 선별 기준과 구성표 |
| 4강 · 코드와 실행 기반 검증 | 검증 설계 | 실행으로 확인되는 것과 남는 오류는 무엇인가? | 검증 절차와 실패 분류 |
| 5강 · 추론·에이전트 데이터와 최신 흐름 | 학습 신호 확장 | 풀이와 행동 경험을 어떻게 생성·선별·전달하는가? | 학습 단계별 데이터 지도 |
| 6강 · 평가·신뢰성과 종합 설계 | 근거 판단 | 개선을 어떤 평가와 비교 조건으로 입증할 것인가? | 종합 설계서와 근거 장부 |

현재 상세 강의는 1–3강이 공개되어 있습니다. 4–6강은 아래 계획을 바탕으로 작성할 예정입니다. 누적 산출물은 생각을 구체화하기 위한 문서 과제이며, 대규모 생성이나 모델 학습 실행을 필수로 요구하지 않습니다.

## 3. 강의별 계획: 개념 → 읽기 → 토론 → 적용

### 1강 · 역사와 학습 신호

#### 이해할 내용

<strong>Data Augmentation(데이터 증강)</strong>, <strong>Pseudo-labeling(의사 라벨링)</strong>, <strong>Knowledge Distillation(지식 증류)</strong>과 합성 생성의 관계를 구분합니다. 실제 목표 문장을 남기는 역번역에서 지시문 자체를 만드는 Self-Instruct까지, 데이터 부족의 종류가 어떻게 생성 대상을 바꾸는지 읽습니다.

#### 읽을 범위

- A: §1–2, Figure 2 — 문제 정의와 전체 지도.
- B: §IV Background and Motivation — 배경과 기존 증강.
- [Self-Instruct 절별 해설](/notes/synthetic-data-study/01-foundations/papers/wang-2023/)와 연결 원문: §2, Figure 2, §3–4의 대표 평가.
- D: §2 Taxonomy와 §3의 학습 단계 목차를 보충 읽기로 확인합니다.

#### 토론과 과제

“생성량이 늘면 새로운 정보도 늘어나는가?”를 토론합니다. 자신의 과제에서 실제 부분·합성할 부분·검증 근거를 표시한 한 페이지 정의서를 작성합니다. [1강 상세 자료로 이동](/notes/synthetic-data-study/01-foundations/).

### 2강 · 텍스트·지시문 생성과 데이터셋 설계

[2강 상세 자료로 이동](/notes/synthetic-data-study/02-text-instructions/)

#### 이해할 내용

<strong>Seed Data(시드 데이터)</strong>, 생성 조건, 예제 선택, 다단계 생성의 역할을 구분합니다. 주제·사용자 표현·난이도를 나누어 생성 범위를 설계하고, 문장 표현의 다양성과 요구 능력의 다양성을 분리합니다.

#### 읽을 범위

- A: §3.1 Data Generation — 프롬프트 설계와 다단계 생성.
- B: 텍스트 생성 방법을 다루는 절.
- D: §3.1 Data Preparation, §3.4 Instruction-Tuning — 데이터가 쓰일 단계와 연결.
- [Persona Hub 절별 해설](/notes/synthetic-data-study/01-foundations/papers/ge-2024/)와 원문 — 생성 조건을 확장하는 사례.

#### 토론과 과제

“문체만 다른 100개 질문은 얼마나 다양한가?”를 토론합니다. 1강의 정의서를 주제·조건·난이도별 생성 계획으로 바꾸고, 예제 형식과 출처 기록 항목을 정합니다. 실제 생성 결과와 직접 작성한 설명용 예제를 구분합니다.

### 3강 · 큐레이션과 데이터 구성

[3강 상세 학습자료 읽기 →](/notes/synthetic-data-study/03-curation/)

#### 이해할 내용

<strong>Data Curation(데이터 큐레이션)</strong>을 제거·수정·선택·비중 조정으로 나눕니다. 중복, 잘못된 라벨, 근거 누락, 편향을 살피고, 강한 필터가 희귀하지만 중요한 예제를 제거할 가능성도 검토합니다.

#### 읽을 범위

- A: §3.2 Data Curation, §3.3 Data Evaluation.
- C: §2 텍스트 데이터의 품질·신뢰성·평가 공백.
- Self-Instruct의 필터링과 데이터 분석을 다시 읽어 생성 단계와 선별 단계를 구분합니다.

#### 토론과 과제

“점수가 높은 예제만 남기면 학습 데이터가 좋아지는가?”를 토론합니다. 선별 기준별 목적·놓칠 오류·제거할 수 있는 유효 사례를 적고, 선별 전후 비교 항목을 정합니다. 모델 판정은 확인 근거와 구분해 기록합니다.

### 4강 · 코드와 실행 기반 검증

#### 이해할 내용

코드 생성에서는 문장 자연스러움뿐 아니라 실행 결과를 확인할 수 있습니다. 그러나 테스트 통과가 모든 입력에서의 정확성을 보장하지는 않습니다. 문제·정답 코드·테스트를 같은 생성기에 의존할 때 공통 오류가 남을 가능성도 검토합니다.

#### 읽을 범위

- B: 코드 생성과 평가를 다루는 절.
- C: §3 기호 및 논리 데이터의 코드 관련 항목과 검증 한계.
- D: §3.6.3 Code를 학습 단계 지도와 연결해 보충 읽기.

#### 토론과 과제

“정답 코드가 아니라 테스트가 틀렸다면 어떻게 발견할까?”를 토론합니다. 실행 실패·오답·명세 불일치·테스트 부족을 구분한 검증 절차를 설계합니다. 실행하지 않은 결과는 통과·실패로 기록하지 않습니다.

### 5강 · 추론·에이전트 데이터와 최신 흐름

#### 이해할 내용

<strong>Chain-of-Thought(단계적 추론)</strong>, 정답 선별, <strong>Reinforcement Learning(강화학습)</strong>, <strong>Knowledge Distillation(지식 증류)</strong>이 연결되는 지점을 읽습니다. 정적인 문답에서 행동·관측·피드백으로 구성된 <strong>Trajectory(행동 궤적)</strong>로 학습 신호를 확장합니다.

#### 읽을 범위

- [DeepSeek-R1 절별 해설](/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/)와 원문: §2의 학습 단계, §3–4의 평가와 논의.
- [Environment-free Synthetic Data Generation for API-Calling Agents 절별 해설](/notes/synthetic-data-study/01-foundations/papers/lee-2026/)와 원문: 방법·평가, 관련 구현 부록.
- C: §3의 추론 관련 부분, §7 Agent 데이터.
- D: §3.3–3.5 — 미세조정·지시학습·선호 정렬에 데이터가 쓰이는 위치.

#### 토론과 과제

“시뮬레이터가 일관되게 답하면 실제 환경에서도 성공하는가?”를 토론합니다. 생성·검증·학습·평가를 분리한 데이터 지도를 그리고, 실제 환경의 근거가 들어오는 지점을 표시합니다. 원문에서 확인된 구현 조건과 본문·부록의 불일치를 함께 기록합니다.

### 6강 · 평가·신뢰성과 종합 설계

#### 이해할 내용

데이터 자체의 품질과 학습 후 <strong>Utility(효용)</strong>를 구분합니다. 정확성·다양성·개인정보·편향·출처·평가 오염을 하나의 점수로 뭉치지 않고, 목표에 필요한 평가 항목과 미확인 항목을 드러냅니다.

#### 읽을 범위

- C: §8 평가 차원 종합, §9 열린 과제, §10 결론. 자신의 과제에 맞는 유형별 절도 재독합니다.
- A: §3.3 평가, §4 과제와 향후 방향.
- B의 한계·향후 방향, D의 §5 Challenges and Limitations를 비교합니다.

#### 토론과 과제

“합성 데이터가 좋아 보인다는 주장과 학습에 도움이 됐다는 주장은 각각 어떤 근거를 요구하는가?”를 토론합니다. 1–5강의 문서를 합쳐 목표·생성·선별·검증·평가·비용·실패 조건이 연결된 종합 설계서를 제출합니다. 결과가 없는 항목은 평가 계획으로 남깁니다.

## 4. 운영 방식: 같은 질문으로 반복해서 읽기

### 모임 전과 모임 중

주 1회, 약 2시간을 기본으로 제안합니다. 모임 전에는 지정 범위만 읽고 핵심 주장 하나와 의문 하나를 준비합니다. 모임에서는 개념 연결 10분, 본문 설명 30분, 논문 발제 30분, 토론·과제 설계 35분, 정리 15분으로 진행할 수 있습니다. 읽기 분량과 시간은 참여자의 배경에 맞춰 조절합니다.

### 논문 발제의 공통 형식

모든 발표에서 **주장 → 근거 위치 → 조건 → 한계 → 다음 확인**을 연결합니다. 원문 절·표·실험 설정을 표시하고, 서베이 저자의 분류와 원논문의 실험 결과를 구분합니다. 추가 논문은 현재 질문을 해결하는 데 필요할 때 선정합니다.

### 최종적으로 남길 것

여섯 강의를 마친 뒤에는 논문 목록과 함께 “이 조건에서는 왜 이 생성·선별·검증 방법을 선택하는가”를 설명할 수 있어야 합니다. 실패할 조건과 아직 확인하지 못한 근거까지 포함한 설계서가 이 스터디의 최종 결과물입니다.
