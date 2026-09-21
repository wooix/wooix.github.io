---
title: '2강 · 텍스트·지시문 생성과 데이터셋 설계'
description: '생성 목표를 주제·조건·난이도로 나누고, Self-Instruct·Evol-Instruct·Persona Hub·Magpie를 비교해 출처와 검증 기준을 갖춘 생성 계획을 만듭니다.'
publishedAt: 2026-09-20
topic: synthetic-data-study
category: synthetic-data
tags: ['합성데이터스터디', '2강', 'Instruction Data', 'Dataset Design', 'Synthetic Data']
kind: research-note
readingTime: 30
featured: false
draft: false
navLabel: '2강 · 텍스트·지시문 생성과 데이터셋 설계'
sourceLinks:
  - title: 'Long et al. (2024) — 생성 조건과 다단계 생성'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/long-2024/'
    kind: '서베이 A 요약'
  - title: 'Wang et al. (2024) — 데이터 준비와 지시 미세조정'
    url: 'https://wooix.github.io/notes/synthetic-data-study/00-introduction/papers/wang-2024/'
    kind: '서베이 D 요약'
  - title: 'Nadaș et al. (2025) — 텍스트 생성 방법'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/nadas-2025/'
    kind: '서베이 B 요약'
  - title: 'Wang et al. (2023) — Self-Instruct'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/wang-2023/'
    kind: '복습'
  - title: 'Ge et al. (2024) — Persona Hub'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/ge-2024/'
    kind: '대표 논문'
  - title: 'Xu et al. (2023) — WizardLM / Evol-Instruct'
    url: 'https://wooix.github.io/notes/synthetic-data-study/02-text-instructions/papers/xu-2023/'
    kind: '심화 읽기'
  - title: 'Xu et al. (2024) — Magpie'
    url: 'https://wooix.github.io/notes/synthetic-data-study/02-text-instructions/papers/xu-2024/'
    kind: '심화 읽기'
takeaway: '좋은 생성 계획은 요청 횟수가 아니라 필요한 학습 경험을 정의합니다. 주제·조건·난이도를 나누고, 질문과 답변의 출처 및 검증 상태를 분리해 기록해야 합니다.'
---

[← 0강 · Introduction](/notes/synthetic-data-study/00-introduction/) · [1강 · 역사와 학습 신호](/notes/synthetic-data-study/01-foundations/)

## Required Reading(필수 읽기 자료)

<p class="heading-subtitle" data-heading-id="required-reading"><span aria-hidden="true">💡</span> 생성 설계를 위한 읽기 지도</p>

이번에는 서베이를 완독하지 않고 **생성 입력과 생성 순서**를 설명하는 부분을 읽습니다. 논문 제목은 절별 요약으로 연결되며, 실제 원문은 각 요약 상단에서 열 수 있습니다. 심화 논문 두 편은 조별로 나눠 읽고 비교해도 됩니다.

| 역할 | 읽을 자료와 범위 | 읽으며 답할 질문 |
| --- | --- | --- |
| 필수 · 공통 틀 | [Long et al. (2024)](/notes/synthetic-data-study/01-foundations/papers/long-2024/) §3.1.1–3.1.2, Figure 3 | 과제·조건·예제는 각각 무엇을 결정하는가? |
| 필수 · 생성 범위 | [Persona Hub — Ge et al. (2024)](/notes/synthetic-data-study/01-foundations/papers/ge-2024/) §2–3, Figures 3–6; §4.1의 평가 주의사항 | Persona를 늘리는 것과 과제 범위를 늘리는 것은 어떻게 다른가? |
| 복습 · 생성 순서 | [Self-Instruct — Wang et al. (2023)](/notes/synthetic-data-study/01-foundations/papers/wang-2023/) §2.2, Figure 2 | 지시문과 입력·출력을 왜 나누어 만드는가? |
| 심화 A · 난이도 | [WizardLM — Xu et al. (2023)](/notes/synthetic-data-study/02-text-instructions/papers/xu-2023/) §3.1–3.3, Figures 1–2; 부록 A–D·F | 조건을 추가했을 때 실제 요구 능력이 달라졌는가? |
| 심화 B · 시드 의존 | [Magpie — Xu et al. (2024)](/notes/synthetic-data-study/02-text-instructions/papers/xu-2024/) §2.1–2.2, §3.1–3.2, Figures 1–4 | 사람이 작성한 시드가 없어도 남는 생성 조건은 무엇인가? |
| 보충 · 단계 구분 | [서베이 D — Wang et al. (2024)](/notes/synthetic-data-study/00-introduction/papers/wang-2024/) §3.1, §3.4 | 생성 텍스트가 어느 학습 단계에서 쓰이는가? |
| 보충 · 문헌 비교 | [서베이 B — Nadaș et al. (2025)](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/) §IV.B, §V.A–B | 생성 방식, 품질 속성, 분포 정렬은 어떻게 연결되는가? |

<details class="paper-reading-list">
<summary>논문별 절별 해설 펼치기 · 7편</summary>
<ul>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/long-2024/">Long et al. (2024)</a><span class="paper-one-line">과제 설명·조건·예제와 샘플 단위·데이터셋 단위 생성을 구분합니다.</span></li>
<li><a href="/notes/synthetic-data-study/00-introduction/papers/wang-2024/">Wang et al. (2024)</a><span class="paper-one-line">데이터 준비와 지시 미세조정에서 합성 자료의 역할을 연결합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/nadas-2025/">Nadaș et al. (2025)</a><span class="paper-one-line">텍스트 생성법을 품질 속성과 분포 정렬의 관점으로 비교합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/wang-2023/">Wang et al. (2023)</a><span class="paper-one-line">시드 과제에서 새 지시문과 수행 예제를 생성·선별하는 과정을 설명합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/ge-2024/">Ge et al. (2024)</a><span class="paper-one-line">텍스트와 인물 관계에서 Persona를 확보해 생성 관점을 넓힙니다.</span></li>
<li><a href="/notes/synthetic-data-study/02-text-instructions/papers/xu-2023/">Xu et al. (2023)</a><span class="paper-one-line">지시문을 단계적으로 바꾸어 복잡성과 범위를 확장합니다.</span></li>
<li><a href="/notes/synthetic-data-study/02-text-instructions/papers/xu-2024/">Xu et al. (2024)</a><span class="paper-one-line">정렬된 모델의 대화 형식을 이용해 사용자 지시문부터 생성합니다.</span></li>
</ul>
</details>

1강에서 우리는 모델에 어떤 연습문제가 부족한지 정했습니다. 2강에서는 출제자가 **출제 범위표와 정답 기준**을 만드는 단계로 넘어갑니다. “다양한 문제를 100개 만들어 줘”라는 요청만으로는 어느 영역이 채워졌는지 알기 어렵습니다. 필요한 영역을 정하고 생성 결과가 그 영역에 대응하는지 기록해야 합니다.

> **읽기 기준** · 2026년 9월 20일 작성. 아래 도서관 규정, 설계표, JSON, 프롬프트, 실습의 표본 수는 강의용 창작 예시입니다. 실제 생성·학습·성능 측정을 수행한 결과가 아닙니다. 논문별 검토 판본은 각 요약 상단에 표시했습니다. 2023–2024년 방법을 이후 서베이의 관점으로 읽으며, 최신 성능 순위를 주장하지 않습니다.

## 1. 목표 정의

<p class="heading-subtitle" data-heading-id="learning-target"><span aria-hidden="true">💡</span> 어떤 행동을 학습할 것인가?</p>

### 1.1 1강의 정의서를 생성 계약으로 바꾸기

<strong>Instruction Data(지시문 데이터)</strong>를 설계할 때는 문장의 모양보다 학습자가 해야 할 행동을 먼저 정합니다. 사용자 질문에 답하기, 문서에서 근거 찾기, 정해진 형식으로 출력하기는 서로 다른 요구입니다. 한 데이터셋에 함께 넣을 수 있지만, 어떤 요구를 훈련하는 샘플인지 알아야 합니다.

이번 공통 사례는 **도서관 규정에 근거해 답하는 안내 모델**입니다. 우리가 원하는 행동은 규정에 있는 내용으로 답하고, 근거가 없으면 임의로 정책을 만들지 않는 것입니다. 모델의 일반 상식을 풍부하게 만드는 목표와는 다릅니다.

| 설계 항목 | 이번 강의의 가상 설정 | 샘플에 남길 정보 |
| --- | --- | --- |
| 사용 상황 | 이용자가 대출·예약·시설 규정을 질문 | 주제와 사용자 요청 |
| 근거 범위 | 제공된 가상 규정 문서만 사용 | 문서 ID·버전·근거 구절 |
| 원하는 행동 | 답변, 조건 적용, 근거 부족 표시 | 목표 행동과 판정 기준 |
| 출력 형식 | 답변과 근거 ID를 구조화 | 형식 버전 |
| 확인할 실패 | 없는 정책 생성, 예외 누락, 근거 불일치 | 실패 이유와 검토 상태 |

<strong>Dataset Specification(데이터셋 명세)</strong>은 이러한 선택을 고정한 문서입니다. 명세를 먼저 작성하면 여러 생성법을 써도 “유용한 샘플”의 기준이 바뀌지 않습니다. 이 표는 강의의 설계 도구이며 특정 논문이 제시한 표준 규격은 아닙니다.

### 1.2 생성 텍스트의 사용 단계를 구분하기

<strong>Pretraining(사전학습)</strong>에 넣을 연속 텍스트와 <strong>Supervised Fine-Tuning(지도 미세조정, SFT)</strong>에 넣을 사용자·응답 쌍은 형식과 목적이 다릅니다. 같은 도서관 설명글이라도 설명문 자체로 학습할지, 질문에 답하는 예제로 변환할지에 따라 생성 단위가 바뀝니다.

[서베이 D의 §3.1·§3.4](/notes/synthetic-data-study/00-introduction/papers/wang-2024/)는 이 단계 구분을 확인하는 읽기 자료입니다. 이번 강의의 최종 단위는 **지시문·입력·응답과 검토 기록을 갖춘 SFT 후보 사례**로 한정합니다. 선호 쌍, 장기 추론, 실행 환경의 행동 궤적은 이후 강의에서 확장합니다.

<figure class="paper-figure" id="study-flow"><a href="/images/synthetic-data-study/02-text-instructions/design-flow.svg" target="_blank" rel="noopener"><img src="/images/synthetic-data-study/02-text-instructions/design-flow.svg" width="900" height="540" alt="부족한 행동을 명세와 생성 범위로 바꾼 뒤 질문, 답변, 검토 기록을 만들어 3강 큐레이션으로 전달하는 흐름" loading="lazy" /></a><figcaption>학습 도식 1. 생성 계획에서 검토 가능한 후보 사례까지. 강의용으로 작성한 개념도이며 논문의 Figure가 아닙니다.</figcaption></figure>

파란 영역은 사람이 먼저 고정할 설계, 주황 영역은 모델이 만들 후보, 초록 영역은 근거와 함께 남길 기록입니다. 마지막에 완성되는 것은 품질이 보장된 학습 데이터가 아니라 **검토할 수 있는 후보 묶음**입니다. 이 구분이 3강의 출발점입니다.

## 2. 생성 범위

<p class="heading-subtitle" data-heading-id="generation-coverage"><span aria-hidden="true">💡</span> 주제·조건·난이도를 분리하기</p>

### 2.1 표현의 다양성과 요구 능력의 다양성

“책은 며칠 빌리나요?”와 “도서 대출 기간이 궁금해요”는 표현이 다르지만 같은 규정을 조회합니다. 반면 “연체 중에도 예약할 수 있나요?”는 여러 규정의 관계나 예외를 확인해야 할 수 있습니다. <strong>Lexical Diversity(표현 다양성)</strong>와 <strong>Task Diversity(과제 다양성)</strong>를 구분해야 하는 이유입니다.

문체를 바꾸는 작업도 실제 사용자 표현을 다루는 데 도움이 될 수 있습니다. 다만 문장 중복이 낮다는 이유만으로 요구 능력이 넓어졌다고 판정할 수는 없습니다. 이 질문은 [Self-Instruct의 §3.2, Figures 3–5](/notes/synthetic-data-study/01-foundations/papers/wang-2023/)와 [Persona Hub의 Figure 10](/notes/synthetic-data-study/01-foundations/papers/ge-2024/)을 비교해 읽습니다. 두 논문이 측정하는 다양성의 단위도 함께 확인합니다.

### 2.2 먼저 축을 정하고, 그다음 값을 채우기

<strong>Conditional Generation(조건부 생성)</strong>에서는 원하는 샘플의 속성을 명시합니다. [서베이 A §3.1.1](/notes/synthetic-data-study/01-foundations/papers/long-2024/)는 조건의 범위를 정하는 문제와 각 조건에 들어갈 값을 확보하는 문제를 구분합니다.

| 축 | 강의용 값의 예 | 점검할 혼동 |
| --- | --- | --- |
| 주제 | 대출 / 예약 / 시설 | 문체를 바꿨다고 주제가 늘지는 않음 |
| 근거로 답할 수 있는가 | 답변 가능 / 정보 부족 | 어려운 질문과 정보가 없는 질문은 다름 |
| 제약 수준 | 단일 조건 / 복합 조건 | 길이 증가만으로 난이도를 정하지 않음 |
| 표현 | 짧은 구어 / 자세한 상황 설명 | 표현 변형은 별도로 기록 |
| 관점 | 처음 방문한 이용자 / 기존 이용자 | Persona와 실제 이용자 분포는 다름 |

모든 축의 조합이 유효한 것은 아닙니다. 예를 들어 문서에 없는 예외를 “복합 조건 문제”라는 이유로 생성하면, 어려운 문제가 아니라 정답을 만들 수 없는 문제가 됩니다. 불가능한 조합은 제외 이유를 기록하거나, 의도적으로 정보 부족 사례로 분류합니다.

### 2.3 분포를 요청하는 것과 확보하는 것은 다르다

예를 들어 주제 3개, 답변 가능 여부 2개, 제약 수준 2개를 조합하면 설계상 12칸입니다. 각 칸에서 후보 하나를 요청했다고 12칸이 실제로 채워지는 것은 아닙니다. 출력이 잘못된 주제로 빠지거나 여러 칸에서 같은 문제를 만들 수 있기 때문입니다.

다음 식은 **이 강의에서 정의한 설계 점검용 값**입니다. 논문의 성능 지표나 의미 다양성의 완전한 측정치가 아닙니다.

$$
C_{\mathrm{plan}} = \frac{|\{c\in\mathcal C: n_c^{\mathrm{valid}}>0\}|}{|\mathcal C|}
$$

$\mathcal C$는 명세에서 유효하다고 정한 칸의 집합이고, $n_c^{\mathrm{valid}}$는 검토 뒤 그 칸에 남은 사례 수입니다. 이 비율은 **계획한 칸 중 검토를 통과한 예제가 하나라도 있는 칸의 비율**입니다. 한 칸에 비슷한 문제가 몰려도 점수가 더 오르지 않지만, 칸 내부의 의미적 중복이나 충분한 표본 수까지 보장하지는 않습니다. 분모가 0이면 계산하지 않고 명세를 먼저 고칩니다.

## 3. 생성 입력

<p class="heading-subtitle" data-heading-id="generation-inputs"><span aria-hidden="true">💡</span> 과제·조건·예제를 각각 설계하기</p>

### 3.1 시드는 형식과 범위의 출발점이다

<strong>Seed Data(시드 데이터)</strong>는 생성할 사례의 출발점입니다. 좋은 시드는 출력 형식뿐 아니라 “무엇을 근거로 어떤 응답을 해야 하는지”를 보여줍니다. 도서관 사례에서는 근거 있는 답변만 넣지 않고, 문서에 없는 정책을 묻는 질문과 정보 부족 응답도 넣을 수 있습니다.

[Self-Instruct §2.2](/notes/synthetic-data-study/01-foundations/papers/wang-2023/)는 사람의 시드와 이미 생성한 지시문을 활용하여 새 과제를 만드는 구조를 설명합니다. 이를 읽을 때 시드 개수만 기록하지 말고 시드가 포함한 과제의 범위, 새 예제를 다시 넣는 위치, 필터링 기준을 구분합니다.

### 3.2 예제 선택은 단순한 복사가 아니다

<strong>In-Context Learning(문맥 내 학습, ICL)</strong>용 예제는 모델의 출력에 영향을 줍니다. 모든 예제가 대출 기간 조회라면 “다양하게 생성하라”는 지시를 추가해도 그 유형을 반복할 수 있습니다. 반대로 복잡한 예제만 주면 실제 이용자가 자주 묻는 단순한 질문을 놓칠 수 있습니다.

따라서 시드의 역할을 형식 시범과 범위 시범으로 나누어 봅니다. 형식은 일관되게 보여주되, 내용은 서로 다른 목표 행동을 포함하도록 고릅니다. 이것은 이번 실습의 설계 원칙이며 특정 선택 알고리즘의 우월성을 검증한 결과는 아닙니다. 예제 선택의 일반적인 논점은 [서베이 A §3.1.1](/notes/synthetic-data-study/01-foundations/papers/long-2024/)과 연결됩니다.

### 3.3 프롬프트를 세 부분으로 나누기

아래는 **실습용 템플릿**입니다. 중괄호 안을 실제 값으로 바꾸고, 원문과 예제를 명확히 구획하여 사용합니다. `temperature`만 높이는 대신 생성할 조건을 먼저 제어합니다.

```text
[과제]
제공된 가상 도서관 규정으로 학습할 사용자 질문 후보 1개를 작성한다.
이 단계에서는 답변을 생성하지 않는다.

[근거 문서]
{문서_ID와_버전}
{규정_본문}

[생성 조건]
주제: {대출/예약/시설}
답변 가능 여부: {가능/정보_부족}
제약 수준: {단일/복합}
표현: {짧은_구어/상황_설명}
없는 정책을 사실로 전제하지 않는다.
정보 부족 조건이라면 문서에 없는 정보가 무엇인지 별도로 적는다.

[예제]
{형식은_같고_목표_행동은_다른_검토된_예제}

[출력]
JSON 객체 1개만 반환한다.
필드: instruction, input, target_cell, missing_information
```

이 프롬프트는 출력 형식을 요청하는 단계입니다. JSON을 요청했다고 형식이 항상 맞는 것도 아니고, `target_cell`을 출력했다고 실제로 그 칸에 속하는 것도 아닙니다. **생성기의 자기 설명과 검토 결과를 다른 필드로 저장**해야 합니다.

## 4. 방법 선택

<p class="heading-subtitle" data-heading-id="generation-methods"><span aria-hidden="true">💡</span> 네 가지 연구가 바꾸는 지점</p>

### 4.1 Self-Instruct

<p class="heading-subtitle" data-heading-id="self-instruct"><span aria-hidden="true">💡</span> 과제 풀을 확장한다</p>

[Self-Instruct](/notes/synthetic-data-study/01-foundations/papers/wang-2023/)는 지시문을 만들고, 분류 과제 여부를 판단하고, 입력·출력을 생성한 뒤 선별합니다. 새로운 결과를 과제 풀에 되돌려 다음 생성에 활용한다는 점이 중요합니다. 지시문 생성과 답변 생성, 모델 학습은 같은 작업이 아닙니다.

분류 과제에서는 가능한 라벨을 먼저 정하고 각 라벨에 대응하는 입력을 만드는 <strong>Output-first Generation(출력 우선 생성)</strong>을 사용합니다. 입력부터 만들 때 특정 라벨에 치우치는 문제를 완화하려는 선택입니다. 이를 문서 질의응답에 그대로 적용하여 근거 없는 정답부터 정해 두는 방식으로 바꾸면 원래 목적과 달라집니다.

**설계에 가져올 질문:** 생성 단위를 지시문과 수행 예제로 나누었는가? 새로 생성한 시드를 다시 쓰기 전에 어떤 최소 검토를 거치는가?

### 4.2 Evol-Instruct

<p class="heading-subtitle" data-heading-id="evol-instruct"><span aria-hidden="true">💡</span> 복잡성과 범위를 변화시킨다</p>

[WizardLM의 Evol-Instruct](/notes/synthetic-data-study/02-text-instructions/papers/xu-2023/)는 기존 지시문을 단계적으로 다시 써서 복잡성을 높이거나 새로운 지시로 범위를 넓힙니다. 지시문이 바뀌면 응답도 새로 생성하므로, 원래 답변을 변형된 질문에 그대로 붙이지 않습니다. 생성한 모든 문장을 성공한 진화로 취급하지 않고, 유효한 변화인지와 답변 가능성 등을 점검하는 과정도 함께 읽어야 합니다.

도서관 사례에서는 “대출 기간은?”을 “연장 가능 여부와 제한 조건도 함께 알려줘”로 바꿀 수 있습니다. 하지만 규정에 연장 조건이 없다면 단순히 더 어려운 질문으로 분류할 수 없습니다. 조건을 추가할수록 근거 문서와의 연결도 다시 확인해야 합니다. 이 예시는 논문 데이터가 아니라 강의용 변형입니다.

**설계에 가져올 질문:** 추가한 조건이 실제로 새로운 판단을 요구하는가? 답이 없어진 사례와 난도가 높아진 사례를 구분하는가?

### 4.3 Persona Hub

<p class="heading-subtitle" data-heading-id="persona-hub"><span aria-hidden="true">💡</span> 생성 관점을 넓힌다</p>

[Persona Hub](/notes/synthetic-data-study/01-foundations/papers/ge-2024/)는 텍스트에서 인물 설정을 얻거나 인물 관계를 통해 다른 설정을 확장하고, 이를 생성 요구와 결합합니다. Persona는 사용자의 실명이나 실제 인구를 조사한 표본이 아니라 **모델에 주는 관점 조건**입니다.

<figure class="paper-figure" id="persona-figure-3"><a href="https://arxiv.org/html/2406.20094v3/t2p1.png" target="_blank" rel="noopener"><img src="https://arxiv.org/html/2406.20094v3/t2p1.png" width="2036" height="752" alt="텍스트를 누가 읽거나 쓸 법한지 질문해 Persona를 얻는 원문 Figure 3" loading="lazy" /></a><figcaption>Persona Hub Figure 3. 텍스트에서 Persona를 얻는 과정. <a href="/notes/synthetic-data-study/01-foundations/papers/ge-2024/#figure-3">절별 해설과 원문 출처</a></figcaption></figure>

왼쪽의 텍스트를 그대로 학습 예제로 복제하는 대신, 그 글과 관계있는 사람의 관점을 생성 조건으로 바꿉니다. 이 구조는 도서관 안내에서도 “첫 방문자”와 “기존 이용자”가 묻는 내용을 달리 설계하는 데 참고할 수 있습니다. 다만 특정 인물 설정을 넣었다고 실제 사용자의 질문 빈도나 요구 분포가 재현됐다고 볼 수는 없습니다.

**설계에 가져올 질문:** Persona만 바뀌고 실제 질문은 그대로인가? 인물 설정이 규정에 없는 정책을 만들어 내도록 유도하지 않는가?

### 4.4 Magpie

<p class="heading-subtitle" data-heading-id="magpie"><span aria-hidden="true">💡</span> 정렬된 모델에서 지시문을 먼저 생성한다</p>

[Magpie](/notes/synthetic-data-study/02-text-instructions/papers/xu-2024/)는 정렬된 모델의 대화 템플릿에서 사용자 메시지가 시작되는 위치까지 입력하고, 모델이 그 뒤의 사용자 요청을 생성하도록 합니다. 이어서 생성한 요청에 대한 응답을 만듭니다.

“Nothing”은 아무 조건도 없다는 뜻이 아닙니다. 사람의 구체적인 시드 질문 대신 **학습된 모델과 대화 템플릿**이 생성 분포를 결정합니다. 임의의 채팅 화면에 빈 메시지를 보내면 같은 방법이 재현된다고 생각해서도 안 됩니다. 모델에 맞는 템플릿과 사용자 턴 생성 제어가 필요합니다.

또한 생성한 데이터와 그중 선별한 학습 데이터, 그 데이터로 미세조정한 모델의 평가를 구분합니다. 이 방법은 시드 작성 부담을 줄이는 방향을 보여주지만, 특정 도서관 규정을 따르는 데이터가 자동으로 충분히 나온다는 보장은 없습니다.

**설계에 가져올 질문:** 생성기에 어떤 지시 분포가 내재돼 있는가? 목표 도메인에 맞추는 조건과 선별은 어디서 수행하는가?

### 4.5 방법 비교표: 강한 모델 하나보다 역할을 먼저 정하기

아래는 논문 실험 점수표가 아니라 **이 강의의 설계 관점 비교표**입니다. 네 방법이 같은 조건에서 경쟁한 것처럼 순위를 매기지 않습니다.

| 방법 | 출발점 | 주로 바꾸는 것 | 생성 뒤 확인할 것 |
| --- | --- | --- | --- |
| Self-Instruct | 소수 시드 과제 | 과제 풀과 수행 예제 | 반복·무효 과제·답변 오류 |
| Evol-Instruct | 기존 지시문 | 복잡성과 과제 범위 | 실제 변화·유효성·답변 가능성 |
| Persona Hub | 텍스트·인물 설정 | 관점과 생성 조건 | 의미적 중복·주제 적합성 |
| Magpie | 정렬된 모델의 대화 템플릿 | 사람이 쓴 시드 없이 요청 생성 | 생성 분포·도메인 적합성·품질 |

하나의 계획에서 여러 아이디어를 결합할 수는 있습니다. 다만 어떤 선택이 결과를 바꿨는지 알고 싶다면 모든 요소를 한꺼번에 바꾸지 말고, 비교할 변화 하나를 정합니다. 생성량을 늘리기 전에 다음 절의 기록 형식을 고정하는 이유도 여기에 있습니다.

## 5. 생성 절차

<p class="heading-subtitle" data-heading-id="generation-workflow"><span aria-hidden="true">💡</span> 질문·답변·검토 기록을 연결하기</p>

### 5.1 하나의 샘플을 여러 단계로 만들기

[서베이 A §3.1.2](/notes/synthetic-data-study/01-foundations/papers/long-2024/)의 <strong>Multi-Step Generation(다단계 생성)</strong>은 한 샘플을 완성하는 단계 분해와 데이터셋 전체를 확장하는 반복을 구별합니다. 도서관 사례는 다음 순서로 설계할 수 있습니다.

1. 사람이 근거 문서의 버전과 목표 칸을 정합니다.
2. 생성기가 질문 후보를 만듭니다.
3. 응답 생성기가 같은 문서와 질문을 보고 답변·근거 후보를 만듭니다.
4. 형식 검사와 사람 검토로 조건 일치·근거·답변을 확인합니다.
5. 후보와 검토 결과를 함께 저장하여 3강에서 선별합니다.

단계를 나누면 어느 지점에서 오류가 생겼는지 확인하기 쉬워집니다. 그러나 앞 단계의 잘못된 질문을 뒤 단계가 그대로 정당화할 수도 있습니다. 같은 모델이 질문·답·검토를 모두 수행했다면 독립적인 검증이 추가됐다고 볼 수 없습니다.

### 5.2 출처와 검증 상태를 분리한 예제 형식

<strong>Provenance(출처·생성 이력)</strong>는 데이터가 어떤 자료와 과정에서 나왔는지를 추적하는 기록입니다. 실습에서는 최소한 문서 버전, 목표 칸, 생성 방법, 모델·프롬프트 버전, 검토 상태를 남깁니다. 나중에 정답이 바뀌거나 근거가 잘못됐을 때 같은 계통의 사례를 찾을 수 있어야 합니다.

아래 문서는 강의에서 만든 가상 규정입니다.

```text
문서 ID: library-demo-v1
R1: 일반 도서의 대출 기간은 14일이다.
R2: 예약자가 없는 도서에 한해 1회, 7일 연장할 수 있다.
R3: 연체 중에는 새 도서를 대출할 수 없다.
```

아래 JSON은 위 규정으로 **사람이 직접 작성한 형식 예시**입니다. 실제 모델이 생성하거나 검증한 결과가 아니므로 모델 이름을 꾸며 넣지 않습니다.

```json
{
  "sample_id": "demo-001",
  "instruction": "제공된 규정만 근거로 질문에 답하고 근거 ID를 적으세요.",
  "input": "예약자가 있는 책도 7일 더 빌릴 수 있나요?",
  "context": {
    "source_id": "library-demo-v1",
    "rules": {
      "R1": "일반 도서의 대출 기간은 14일이다.",
      "R2": "예약자가 없는 도서에 한해 1회, 7일 연장할 수 있다.",
      "R3": "연체 중에는 새 도서를 대출할 수 없다."
    }
  },
  "output": {
    "answer": "제공된 규정에서 연장은 예약자가 없는 도서에 한해 허용됩니다.",
    "evidence_ids": ["R2"],
    "answerability": "answerable"
  },
  "design": {
    "topic": "대출",
    "target_answerability": "가능",
    "constraint_level": "단일",
    "method": "human_authored_example"
  },
  "provenance": {
    "source_version": "v1",
    "generator_model": null,
    "prompt_version": null,
    "parent_sample_id": null
  },
  "review": {
    "status": "illustrative_only",
    "reviewer": null,
    "reason": "강의용 형식 예시이며 실습 검토 결과가 아님"
  }
}
```

`design`은 만들려고 했던 조건이고 `review`는 실제 확인한 결과입니다. 이 둘을 덮어쓰면 조건을 어긴 생성도 처음부터 목표를 만족한 것처럼 보이게 됩니다. `context`는 실제 학습 입력에도 전달되어야 하며, 근거 ID만 저장하고 문서 본문을 모델에 주지 않는 실수를 피합니다.

학습용 변환 과정에서는 검토 상태·생성기 이름 같은 관리 필드와 모델이 봐야 할 입력을 분리합니다. 어떤 필드를 학습에 넣을지 미리 정하고, 답변이나 검토 라벨이 질문 쪽에 섞이지 않게 확인합니다.

### 5.3 정보 부족 사례에도 정답 기준이 필요하다

“전자책도 14일인가요?”는 위 문서에 전자책 규정이 없으므로 답을 확정할 수 없습니다. 이때 목표 응답은 그럴듯한 전자책 정책이 아니라 **제공된 규정으로는 확인할 수 없다는 설명**입니다. 정보 부족을 표현하는 여러 문장을 허용하더라도, 없는 정책을 추가하지 않는다는 기준은 같아야 합니다.

이 사례에서 `evidence_ids`가 빈 배열이라고 곧바로 오류는 아닙니다. 답변 가능 사례와 정보 부족 사례에 같은 검증 규칙을 적용하면 의도한 행동을 제거할 수 있습니다. 데이터 유형별 판정 기준을 먼저 적어야 한다는 점을 3강으로 가져갑니다.

### 5.4 같은 계통의 사례가 평가셋에 섞이지 않게 하기

같은 문서나 같은 시드에서 나온 변형들을 개별 문장 단위로 무작위 분할하면, 내용이 거의 같은 예제가 학습·평가 양쪽에 들어갈 수 있습니다. 실습에서는 문서·시드·변형 계통을 기록하고 분할 단위를 먼저 정합니다.

<strong>Data Leakage(데이터 누출)</strong>를 막기 위해 **무엇에 대한 일반화를 평가할지**도 정해야 합니다. 같은 규정에 대한 새로운 표현을 평가하려면 질문 계통을, 새로운 규정에 대한 적용을 평가하려면 문서를 나누는 식입니다. 문서 단위 분할이 모든 목적의 정답이라는 뜻은 아닙니다. 이번 24개 후보 실습은 학습 성능을 평가하기에 충분한 시험셋으로 사용하지 않습니다.

## 6. 스터디 실습

<p class="heading-subtitle" data-heading-id="study-exercise"><span aria-hidden="true">💡</span> 최대 24개 후보로 생성 계획 점검하기</p>

### 6.1 실행 전 준비물과 중단 기준

1강의 데이터 부족 정의서, 짧은 가상 규정 문서, 목표 칸 목록, 기록용 표를 준비합니다. 실습용 규정을 만들 때는 예약·시설 등 계획에 넣은 주제도 포함시키고, 의도적으로 정보가 없는 질문을 만들 범위를 별도로 정합니다. 실제 개인정보나 비공개 규정을 가져올 필요는 없습니다.

모델 실행은 선택입니다. 실행하지 않는 조는 프롬프트와 예상 실패 사례를 작성하여 상호 검토합니다. 실행하는 조는 같은 모델·버전과 같은 출력 한도를 기록하고 **최대 24개 후보**에서 멈춥니다. 형식 오류나 조건 위반도 기록한 뒤, 성공 예제로 채워 넣기 위해 무제한 재시도하지 않습니다. 이 표본 수는 학습용 진행 한도이며 논문에서 제시한 최적값이 아닙니다.

### 6.2 기본 생성과 조건 명시 생성을 비교하기

| 조건 | 요청 방식 | 후보 수 | 고정할 것 |
| --- | --- | ---: | --- |
| A · 기본 생성 | 같은 규정으로 다양한 질문·응답 후보를 요청 | 12 | 근거 문서, 모델, 출력 형식 |
| B · 조건 명시 | 유효한 12칸마다 질문·응답 후보 하나를 요청 | 12 | 근거 문서, 모델, 출력 형식 |

유효한 칸이 12개인 경우의 예시입니다. 일부 칸을 제외하여 $k$개만 남았다면 두 조건 모두 $k$개씩, 총 $2k\leq24$개를 요청합니다. 제외한 칸을 억지로 채우지 않습니다.

두 조건 모두 §5의 질문→응답 단계를 따릅니다. A에는 목표 칸을 지정하지 않고 생성 후 사람이 분류합니다. B에는 생성 전에 칸을 지정하되, 생성 결과의 실제 분류는 별도로 검토합니다. 따라서 같은 칸끼리 짝지어진 실험이라고 가정하지 않습니다. 비교할 질문은 **조건을 명시했을 때 계획한 영역이 더 잘 채워졌는가**입니다.

| 기록 항목 | 기록 방법 | 피해야 할 해석 |
| --- | --- | --- |
| 형식 준수 | JSON과 필수 필드 확인 | 형식이 맞으니 정답이라는 판단 |
| 실제 목표 칸 | 사람이 질문·근거를 보고 배정 | 생성기의 자기 라벨을 그대로 사용 |
| 답변 근거 | 규정 ID와 응답의 관계 확인 | 문서 ID가 있으니 근거가 있다는 판단 |
| 의미 중복 | 같은 규칙·같은 판단을 요구하는 쌍 표시 | 단어가 다르면 다른 과제라는 판단 |
| 계획 충족 | 실제 유효 사례로 $C_{\mathrm{plan}}$ 계산 | 모델 성능이나 의미 다양성 점수로 확대 |
| 자원 사용 | 호출 수·토큰·실패·재시도 기록 | 후보 개수만으로 생성 비용을 비교 |

정보 부족으로 분류한 샘플도 규정만으로는 답할 수 없는지 사람이 확인합니다. B가 더 좋은 결과를 얻을 것이라고 미리 결론 내리지 않고, 어떤 칸에서 실패했는지를 기록합니다. 표본이 작으므로 이 비교는 생성 계획의 결함을 찾는 연습이며 통계적 우월성의 증거로 쓰지 않습니다.

### 6.3 제출물과 통과 기준

제출물은 **생성 계획 1쪽 + 후보 기록표 + 실패 사례 검토 최대 3개**입니다. 실제 실패가 3개보다 적다면 있는 사례만 기록하고, 추가로 검토한 예상 실패는 실제 관찰과 구분합니다. 모델을 실행하지 않았다면 후보 기록표 대신 작성한 프롬프트와 수작업 예제를 제출하고, 모두 설계 예시임을 표시합니다.

- 계획서에는 목표 행동, 사용 단계, 근거 범위, 유효한 칸과 제외한 칸이 있습니다.
- 기록표는 생성 조건과 실제 검토 결과를 분리합니다.
- 실패 사례는 원인과 수정할 단계가 연결됩니다. 예: 문체만 바뀐 반복→조건 축 수정, 정답 근거 없음→질문 생성 제약 수정, 형식 오류→형식 검사 보완.
- 성능을 측정하지 않았다면 “학습 성능이 개선됐다”고 쓰지 않습니다.

문서를 잘 꾸미는 것보다 **다른 조가 같은 계획을 읽고 어떤 자료를 만들지 이해할 수 있는지**를 통과 기준으로 삼습니다.

## 7. 토론과 정리

<p class="heading-subtitle" data-heading-id="discussion"><span aria-hidden="true">💡</span> 생성에서 큐레이션으로</p>

### 7.1 120분 스터디 운영안

아래 시간은 사전 읽기를 마친 뒤의 운영 제안입니다.

| 순서 | 시간 | 활동 | 남길 것 |
| --- | ---: | --- | --- |
| 목표 재확인 | 10분 | 1강 정의서와 이번 목표 행동 연결 | 생성 목적 한 문장 |
| 서베이·그림 읽기 | 20분 | 과제·조건·예제와 다단계 생성 구분 | 생성 입력 목록 |
| 방법 비교 | 25분 | 네 방법의 출발점·변화 지점·한계 비교 | 역할 비교표 |
| 설계·선택 실습 | 35분 | 12칸과 프롬프트 작성, 선택적으로 후보 생성 | 계획·기록표 |
| 교차 검토 | 20분 | 근거·중복·정보 부족 판정 | 관찰·예상 실패 사례 최대 3개 |
| 다음 강의 연결 | 10분 | 무엇을 남기고 고칠지 질문 정리 | 3강 검토 질문 |

### 7.2 토론 질문과 답의 기준

**문체만 다른 질문 100개는 다양할까요?** 표현 다양성에는 기여할 수 있습니다. 그러나 주제·필요 규칙·목표 행동이 같다면 과제 범위를 넓혔다고 결론 내릴 수 없습니다. 어떤 다양성이 목표인지부터 답해야 합니다.

**복잡한 질문일수록 좋은 데이터일까요?** 목표 사용 상황과 근거가 허용하는 복잡성인지 봐야 합니다. 정답을 만들 수 없게 된 질문, 불필요하게 길어진 질문, 실제 추가 판단을 요구하는 질문을 구분합니다.

**시드가 없는 생성은 편향도 없을까요?** 사람이 직접 지정한 시드가 없더라도 생성 모델과 학습된 대화 형식이 분포를 결정합니다. Magpie를 읽을 때 모델·템플릿·선별 조건을 함께 확인하는 이유입니다.

**질문과 답을 같은 모델로 만들면 무엇을 추가 확인해야 할까요?** 서로 일관된 오류가 생길 수 있으므로 원문 근거·독립적인 판정 기준을 확인합니다. 생성기의 설명을 곧바로 검증으로 취급하지 않습니다.

### 7.3 한눈 정리와 3강으로 넘길 질문

2강의 결과는 생성된 문장 수가 아니라 **목표에 대응하는 생성 계획과 추적 가능한 후보 데이터**입니다. 시드, 조건, 예제, 생성 순서가 각각 무엇을 바꾸는지 설명할 수 있어야 합니다.

<figure class="paper-figure" id="study-map"><a href="/images/synthetic-data-study/02-text-instructions/reading-map.svg" target="_blank" rel="noopener"><img src="/images/synthetic-data-study/02-text-instructions/reading-map.svg" width="900" height="520" alt="2강의 일곱 단계: 목표, 범위, 입력, 방법, 절차, 실습, 큐레이션 인계" loading="lazy" /></a><figcaption>학습 도식 2. 2강의 질문과 산출물 지도. 강의용 개념도입니다.</figcaption></figure>

3강에서는 이번 후보를 놓고 **제거할 것, 수정할 것, 선택할 것, 비중을 조정할 것**을 구분합니다. 생성한 데이터가 실제로 도움이 되는지 판단하려면 품질·구성·평가까지 이어져야 합니다. 다음 강의를 준비하며 계획에서 비어 있는 칸과, 검토 기준이 모호했던 사례를 남겨 둡니다.

[← 1강 · 역사와 학습 신호](/notes/synthetic-data-study/01-foundations/) · [전체 1–6강 학습 계획](/notes/synthetic-data-study/00-introduction/)

[다음 강의 → 3강 · 큐레이션과 데이터 구성](/notes/synthetic-data-study/03-curation/)
