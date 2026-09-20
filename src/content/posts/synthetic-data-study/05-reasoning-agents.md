---
title: '5강 · 추론·에이전트 데이터와 최신 흐름'
description: 'DeepSeek-R1과 ESAT을 통해 추론 응답·보상·행동 궤적의 역할을 구분하고, 생성·검증·학습·실제 환경 평가를 연결합니다.'
publishedAt: 2026-09-21
topic: synthetic-data-study
tags: ['합성데이터스터디', '5강', 'Reasoning', 'Agent', 'Synthetic Data']
kind: research-note
readingTime: 30
featured: false
draft: false
navLabel: '5강 · 추론·에이전트 데이터와 최신 흐름'
sourceLinks:
  - title: 'DeepSeek-AI (2025) — 추론 강화학습·선별·증류'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/'
    kind: '필수 사례'
  - title: 'Lee et al. (2026) — ESAT'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/lee-2026/'
    kind: '필수 사례'
  - title: 'Zhang et al. (2026) — 추론·Agent 평가'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/zhang-2026/'
    kind: '필수 서베이 C'
  - title: 'Wang et al. (2024) — 학습 단계별 데이터'
    url: 'https://wooix.github.io/notes/synthetic-data-study/00-introduction/papers/wang-2024/'
    kind: '보충 서베이 D'
takeaway: '정답 응답, 보상, 도구 관측, 다음 행동은 서로 다른 학습 신호입니다. 모사된 관측을 실제 실행 결과와 구분하고, 선별된 궤적의 유효성과 실제 환경에서의 학습 효과를 따로 확인해야 합니다.'
---

[← 4강 · 코드와 실행 기반 검증](/notes/synthetic-data-study/04-code-verification/) · [0강 · 전체 학습 계획](/notes/synthetic-data-study/00-introduction/)

## Required Reading(필수 읽기 자료)

<p class="heading-subtitle" data-heading-id="required-reading"><span aria-hidden="true">💡</span> 답안에서 행동 경험으로 확장하기</p>

| 역할 | 자료와 읽을 범위 | 읽으며 답할 질문 |
| --- | --- | --- |
| 필수 · 추론 데이터 | [DeepSeek-R1 — DeepSeek-AI (2025)](/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/) §2.2–2.4, §3의 평가 설정, §4.1 | 생성 응답은 언제 보상 표본이고 언제 고정된 학습 자료가 되는가? |
| 필수 · 행동 데이터 | [ESAT — Lee et al. (2026)](/notes/synthetic-data-study/01-foundations/papers/lee-2026/) §3–4, Figure 1; 부록 D·G.5·H.1–H.6·J | 모사 관측의 검증과 실제 환경 평가는 무엇이 다른가? |
| 필수 · 평가 관점 | [Zhang et al. (2026)](/notes/synthetic-data-study/01-foundations/papers/zhang-2026/) §3.2–3.4, §7.1–7.4 | 최종 답·중간 과정·상태 변화 중 무엇을 검사했는가? |
| 보충 · 단계 지도 | [Wang et al. (2024)](/notes/synthetic-data-study/00-introduction/papers/wang-2024/) §3.3–3.5 | 같은 합성 자료가 어떤 학습 목적에 쓰이는가? |

<details class="paper-reading-list">
<summary>논문별 절별 해설 펼치기 · 4편</summary>
<ul>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/">DeepSeek-AI (2025)</a><span class="paper-one-line">필수 · R1-Zero, R1, 선별한 응답을 이용한 작은 모델의 학습을 구분합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/lee-2026/">Lee et al. (2026)</a><span class="paper-one-line">필수 · 실제 API 환경 없이 행동 기록을 만들고 실제 환경 전이를 평가합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/zhang-2026/">Zhang et al. (2026)</a><span class="paper-one-line">필수 · 추론과 Agent 데이터에서 검증 단위가 달라지는 이유를 설명합니다.</span></li>
<li><a href="/notes/synthetic-data-study/00-introduction/papers/wang-2024/">Wang et al. (2024)</a><span class="paper-one-line">보충 · 미세조정·지시학습·선호 정렬에 쓰이는 데이터를 연결합니다.</span></li>
</ul>
</details>

4강에서는 코드 답안을 검사했습니다. 이번에는 **풀이 연습과 업무 실습 기록**을 만듭니다. 수학 문제의 최종 답이 맞는 것, 풀이의 각 단계가 타당한 것, 에이전트가 실제 상태를 올바르게 바꾼 것은 서로 다른 주장입니다. 무엇을 모델에 보여주고 어떤 출력을 학습시킬지부터 분리해야 합니다.

> **읽기 기준** · 2026년 9월 21일 작성. DeepSeek-R1은 기존 요약의 2025-01-22 v1, ESAT은 그림·구현 대조에 사용한 arXiv v2를 기준으로 읽습니다. 최신 모델 순위를 비교하는 강의가 아닙니다. 아래 도서관 API·상태·행동 기록은 사람이 작성한 창작 예시이며 실제 API 호출·모델 생성·학습 결과가 아닙니다.

## 1. 학습 신호의 확장

<p class="heading-subtitle" data-heading-id="learning-signals"><span aria-hidden="true">💡</span> 같은 텍스트도 역할이 다르면 학습 대상이 달라진다</p>

### 1.1 네 가지 기록

<strong>Chain-of-Thought(단계적 추론, CoT)</strong>는 문제를 풀며 생성한 중간 설명을 포함합니다. <strong>Trajectory(행동 궤적)</strong>는 과제·행동·관측이 시간 순서로 이어진 기록입니다. 둘 다 길 수 있지만, 단순히 긴 텍스트라는 이유로 같은 데이터로 취급할 수는 없습니다.

| 기록 | 무엇을 담는가? | 주의할 구분 |
| --- | --- | --- |
| 응답·풀이 | 문제에 대한 생성 결과와 중간 설명 | 최종 답의 정확성 ≠ 모든 단계의 타당성 |
| 보상 | 결과·형식·선호 등 기준에 따른 신호 | 높은 보상 ≠ 목표의 모든 조건 충족 |
| 도구 관측 | 조회 결과·오류·변경 확인 | 실제 실행 / 모사 / 수작업 예시 구별 |
| 다음 행동 | 현재 이력에서 선택할 호출·응답 | 관측은 입력 맥락, 행동은 예측 대상일 수 있음 |

<strong>Supervised Fine-Tuning(지도 미세조정, SFT)</strong>은 정해진 예제의 목표 출력을 학습합니다. <strong>Reinforcement Learning(강화학습, RL)</strong>은 정책이 만든 결과에 대한 보상으로 정책을 갱신합니다. RL 중 생성한 좋은 응답을 나중에 고정해 SFT에 쓸 수도 있습니다. 자료를 생성하는 것만으로 가중치가 바뀌지는 않습니다.

### 1.2 2024–2026년 읽기의 연결

이번 시리즈의 시간축은 연구를 서로 대체하는 유행으로 외우기 위한 것이 아닙니다. 2024년의 생성·선별·학습 단계 지도 위에서, 2025년 R1은 추론 생성과 보상·선별·증류의 연결을, 2026년 ESAT과 평가 서베이는 행동 관측과 실제 환경 검증의 문제를 구체화합니다.

공통 질문은 **생성량이 늘었는가**보다 **어떤 근거를 가진 학습 신호가 새로 확보됐는가**입니다. 연구마다 출발 모델·과제·검증 방식이 달라 결과 수치를 하나의 발전 순위로 나열하지 않습니다.

## 2. 추론 생성과 학습

<p class="heading-subtitle" data-heading-id="reasoning-pipeline"><span aria-hidden="true">💡</span> R1-Zero, R1, Distillation을 구분하기</p>

### 2.1 R1-Zero의 보상

[DeepSeek-R1 §2.2](/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/)에서 R1-Zero는 이미 사전학습된 기본 모델에 초기 SFT 없이 RL을 적용합니다. “SFT 없이”를 사전학습·정답 기준·보상이 모두 없다는 뜻으로 읽으면 안 됩니다.

이 단계는 정확도와 출력 형식의 보상을 사용합니다. 규칙으로 확인할 수 있는 답이나 코드 실행 결과가 신호가 됩니다. <strong>GRPO(Group Relative Policy Optimization, 집단 상대 정책 최적화)</strong>는 같은 문제에 생성한 응답들의 보상을 비교해 상대적으로 나은 응답 쪽으로 학습을 유도합니다. 이는 정답을 정의하는 규칙 자체를 만들어 주지는 않습니다.

<figure class="paper-figure" id="r1-length"><a href="https://arxiv.org/html/2501.12948v1/figures/plot_length.png" target="_blank" rel="noopener"><img src="https://arxiv.org/html/2501.12948v1/figures/plot_length.png" width="357" height="225" alt="DeepSeek-R1 Figure 3의 학습 단계별 평균 응답 길이" loading="lazy" /></a><figcaption>DeepSeek-R1 Figure 3. RL 중 평균 응답 길이의 변화. <a href="/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/#figure-3">원문 출처와 그림 해설</a></figcaption></figure>

가로축은 학습 단계, 세로축은 평균 응답 길이입니다. 더 긴 출력을 사용하는 경향을 보여주지만, 길이가 늘었다고 모든 추론 단계가 옳다는 증거는 아닙니다. 길이·정답성·과정 타당성을 별도로 읽어야 합니다.

### 2.2 R1의 다단계 구성

R1은 초기 SFT, 추론 중심 RL, 응답 선별과 새로운 SFT, 전체 시나리오의 RL을 연결합니다. 중간 선별 자료로 기본 모델을 다시 SFT하는 단계까지 구분해야 하며, 하나의 체크포인트를 같은 방식으로 계속 학습한다고 단순화하지 않습니다.

| 위치 | 데이터·신호의 역할 | 확인할 점 |
| --- | --- | --- |
| 초기 SFT | 읽기 좋은 추론 응답의 초기 형식 학습 | 초기 지도 자료가 있음 |
| 추론 중심 RL | 생성 응답에 대한 보상으로 정책 학습 | 검증 가능한 보상의 범위 |
| 응답 선별 → SFT | 추론·비추론 자료를 고정하여 학습 | 모든 자료가 같은 검증기를 거치지는 않음 |
| 전체 시나리오 RL | 추론 성능과 일반 응답의 선호를 함께 다룸 | 규칙 보상과 모델 보상을 구분 |

[§2.3.3](/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/)의 <strong>Rejection Sampling(기준을 통과한 응답의 선별)</strong>에는 규칙 판정뿐 아니라 모델 판정도 포함됩니다. 모든 선별 예제를 완전한 실행·증명 검증으로 승인했다고 가정하면 안 됩니다. 추론 자료와 비추론 자료의 목표 출력 형식도 동일하지 않습니다.

### 2.3 작은 모델로 전달하기

[§2.4](/notes/synthetic-data-study/01-foundations/papers/deepseek-2025/)의 <strong>Distillation(지식 증류)</strong>은 선별한 생성 응답을 작은 모델의 SFT 자료로 사용합니다. 이 논문에 보고한 증류 모델은 추가 RL 없이 학습했습니다. 큰 모델이 발견한 패턴을 전달하는 것과 작은 모델이 스스로 RL 탐색을 수행하는 것은 다른 경로입니다.

논문의 일부 조건에서 증류가 작은 모델의 직접 RL보다 좋았다는 결과를 “모든 규모·보상·예산에서 증류가 우월하다”로 확대하지 않습니다. 실제 비교에는 생성 교사의 자원, 선별 비용, 학습 토큰, 추론 시 후보 수까지 포함해야 합니다.

## 3. 행동 궤적의 구조

<p class="heading-subtitle" data-heading-id="trajectory-structure"><span aria-hidden="true">💡</span> 다음 행동은 어떤 관측에 근거하는가?</p>

### 3.1 상태와 관측을 구별한다

에이전트는 보통 환경의 전체 상태를 직접 보지 못하고 도구 응답을 통해 일부를 관측합니다. 문서에 적힌 API 형식, 도구가 반환한 문자열, 실제 데이터베이스의 상태는 서로 다릅니다. “성공했습니다”라는 문자열만으로 실제 변경이 이루어졌다고 확정할 수는 없습니다.

다음 식은 이 강의의 설명용 표기입니다. 특정 논문의 목적함수를 복사한 것이 아닙니다.

$$
h_t=(q,o_0,a_0,o_1,\ldots,a_{t-1},o_t),\qquad a_t\sim\pi_\theta(\cdot\mid h_t).
$$

$q$는 사용자 목표, $o_0$는 시작 시 제공한 관측·맥락, $a_t$는 현재 행동, $o_t$는 그때까지 받은 관측입니다. 정책 $\pi_\theta$는 이력 $h_t$에 조건부로 다음 행동을 만듭니다. 숨은 실제 상태 전체가 이 식에 그대로 들어온다고 가정하지 않습니다.

### 3.2 학습 대상과 입력 맥락

이력을 이용해 다음 API 호출을 SFT한다면, 이전 도구 응답은 중요한 입력이지만 현재 도구 응답을 정답 행동처럼 복제하도록 학습하는 것은 다른 목표입니다. 데이터 변환 시 사용자·에이전트·도구 메시지의 역할과 손실을 적용할 위치를 확인합니다.

실패 응답 이후 적절한 복구를 한 궤적은 유용할 수 있습니다. 그러나 실패를 성공한 행동으로 표시하거나, 도구가 돌려준 개인정보를 불필요한 목표 출력으로 학습시키면 목적이 바뀝니다. 행동의 적절성과 관측 내용의 검토를 각각 남깁니다.

## 4. 환경 모사와 실제 평가

<p class="heading-subtitle" data-heading-id="simulation-and-transfer"><span aria-hidden="true">💡</span> ESAT에서 ‘환경 없이’의 범위를 읽기</p>

### 4.1 생성의 세 단계

[ESAT §3](/notes/synthetic-data-study/01-foundations/papers/lee-2026/)은 API 명세에서 과제를 만들고, 에이전트와 모사기의 상호작용으로 행동 기록을 만든 뒤, 완성된 기록을 선별합니다. 생성 과정에서 실제 API 서버를 요구하지 않는 것이 핵심입니다. 이후 실제 환경에서의 평가까지 생략한 연구는 아닙니다.

<figure class="paper-figure" id="esat-overview"><a href="/images/papers/lee-2026/figure-1-01.png" target="_blank" rel="noopener"><img src="/images/papers/lee-2026/figure-1-01.png" width="954" height="172" alt="ESAT Figure 1의 API 명세, 과제 생성, Agent와 Simulator, 궤적 선별 과정" loading="lazy" /></a><figcaption>ESAT Figure 1. 과제·행동 기록·선별을 나눈 생성 흐름. <a href="/notes/synthetic-data-study/01-foundations/papers/lee-2026/#figure-1">원문 출처와 그림 해설</a></figcaption></figure>

왼쪽의 명세에서 과제를 만들고, 가운데 에이전트의 호출에 모사기가 응답하며, 오른쪽 판정기가 전체 기록을 고릅니다. 이 화살표는 생성 절차입니다. 각 응답이 실제 상태와 일치한다는 보장을 나타내는 그림이 아닙니다.

### 4.2 검증의 범위

<strong>Simulator(모사기)</strong>는 일관된 이력을 만들도록 지시받지만, 실제 데이터베이스와 같은 상태 보장이 자동으로 생기지는 않습니다. ESAT의 호출 이력은 동일 과제·동일 앱 범위로 관리됩니다. 서로 다른 앱 사이의 전역 상태까지 하나의 상태 저장소에서 검증한다고 읽지 않습니다.

[부록 H](/notes/synthetic-data-study/01-foundations/papers/lee-2026/)에서는 입력·출력 구조 검사와 의미 검사의 범위를 구분합니다. 특히 상세 구현의 의미 검사는 GET에 적용되고 변경 호출은 구조 검사를 통과하면 수용됩니다. 형식이 맞는 변경 응답이 실제로 타당한 상태 전이를 보장한다는 뜻은 아닙니다.

과제 재작성 뒤 거절된 자료의 처리도 본문과 부록 G.5의 설명이 다릅니다. 재현 설계에서는 하나를 임의로 원문의 확정 구현이라 쓰지 말고 선택한 처리 규칙과 차이를 밝힙니다. 이는 모사 방법을 사용할 수 없다는 결론보다, 어떤 검증을 수행했다고 주장할 수 있는지의 경계를 정하는 작업입니다.

완료 API로 끝난 기록에도 전체 궤적 판정을 여러 번 적용하고 다수의 긍정 판정을 받은 것만 남깁니다. 종료 신호와 선별 통과, 실제 평가 성공은 세 개의 다른 상태입니다.

### 4.3 전이의 근거

ESAT은 모사 자료로 학습한 모델을 AppWorld와 OfficeBench의 실제 평가 환경에서 검사합니다. 따라서 학습 자료의 내부 일관성만으로 효과를 주장하는 구성은 아닙니다. 동시에 평가 과제·앱 범위·비교 모델을 벗어난 모든 API 환경에 대한 보장도 아닙니다.

여러 번 실행한 평균 단일 시도 성공과 여러 시도 중 하나만 성공해도 되는 평가는 구별합니다. 에이전트가 종료 신호를 보낸 비율, 목표 상태를 달성한 비율, 불필요한 행동 없이 완료한 비율도 같은 지표가 아닙니다.

## 5. 데이터 지도

<p class="heading-subtitle" data-heading-id="data-map"><span aria-hidden="true">💡</span> 생성·판정·학습·평가의 경계를 그리기</p>

<figure class="paper-figure" id="agent-flow"><a href="/images/synthetic-data-study/05-reasoning-agents/workflow.svg" target="_blank" rel="noopener"><img src="/images/synthetic-data-study/05-reasoning-agents/workflow.svg" width="960" height="550" alt="목표와 명세, 후보 생성, 출처별 관측, 검증과 선별, 학습 신호 변환, 독립 환경 평가의 흐름" loading="lazy" /></a><figcaption>학습 도식 1. 추론·행동 데이터를 학습으로 연결하는 지도. 강의용 개념도입니다.</figcaption></figure>

### 5.1 같은 기준으로 두 연구 읽기

| 질문 | R1에서 볼 것 | ESAT에서 볼 것 |
| --- | --- | --- |
| 무엇을 생성하나? | 추론·응답 | 과제·도구 호출·모사 응답 |
| 무엇이 판정하나? | 단계별 규칙·모델·보상 | 구조 검사·의미 판정·전체 궤적 판정 |
| 무엇을 학습하나? | 보상에 의한 정책 갱신 또는 고정 응답의 SFT | 이력에 조건부인 에이전트 행동의 SFT |
| 어디서 효과를 보나? | 구분된 추론·일반 응답 평가 | 실제 환경의 목표 완료 평가 |
| 남은 한계는? | 답·과정·선호와 비용의 구분 | 상태 일관성·모사 편향·전이 범위 |

이 표는 강의용 비교입니다. 두 연구가 같은 조건으로 경쟁하는 방법이라는 뜻은 아닙니다.

### 5.2 최소 기록과 분할

각 샘플에 목표·명세 버전·원천 문제 또는 상태 계통·생성기·판정기·단계별 결과·선별 이유를 붙입니다. 관측 출처는 `real_execution`, `simulator`, `human_authored_example`처럼 구별합니다. 실제 실행 상태를 관측하지 못했다면 성공 여부를 `unknown`으로 남깁니다.

같은 과제·같은 환경 상태에서 파생한 궤적이 학습과 최종 평가 양쪽에 섞이지 않게 합니다. 새 앱 전이가 목표라면 앱·API 계통을, 새 사용자 상태 전이가 목표라면 상태 생성 계통을 별도로 확인합니다. 어떤 분할이 필요한지는 평가할 일반화 질문에 달려 있습니다.

## 6. 스터디 실습

<p class="heading-subtitle" data-heading-id="study-exercise"><span aria-hidden="true">💡</span> 모사 성공과 실제 성공을 분리해 판정하기</p>

### 6.1 가상 API와 요청

이 절의 API는 **수작업 교육용 명세**입니다. ESAT이 사용한 API도 실제 도서관 서비스도 아닙니다. 실제 호출은 수행하지 않습니다.

- `get_loan(book_id)`는 예약 여부·기존 연장 횟수·반납 예정일을 반환합니다.
- `extend_loan(book_id)`는 R2 조건이 맞을 때만 예정일을 7일 늘리고 연장 횟수를 1 증가시킵니다. 조건이 맞지 않으면 변경 없이 오류를 반환합니다.
- R2: 예약자가 없는 도서에 한해 1회, 7일 연장할 수 있습니다.
- 상태는 이 실습 도중 외부에서 바뀌지 않으며 조회 응답은 최신 상태를 반환한다고 **가정**합니다. 이 가정이 없는 실제 시스템에서는 일관성·동시성 정책을 더 정의해야 합니다.

가상 요청은 “내 도서 `b17`을 규정상 가능하면 7일 연장하고 결과를 알려 줘”입니다. 초기 상태는 `has_reservation=False`, `extensions=0`, `due=2026-10-01`입니다.

### 6.2 기준 궤적과 변형

아래 관측은 모두 사람이 쓴 예시입니다. 도구 반환처럼 표시했어도 실제 실행 로그가 아닙니다.

| 단계 | 에이전트 행동 | 가상 관측 | 검토 질문 |
| --- | --- | --- | --- |
| 1 | `get_loan("b17")` | 예약 없음, 횟수 0, 예정일 10-01 | 요청 대상과 필요한 조건을 확인했는가? |
| 2 | `extend_loan("b17")` | 성공, 횟수 1, 예정일 10-08 | 명세상 허용되는 변경인가? |
| 3 | `get_loan("b17")` | 예약 없음, 횟수 1, 예정일 10-08 | 변경 후 상태가 일치하는가? |
| 4 | 사용자에게 결과 설명 | “7일 연장되어 10-08까지입니다.” | 관측 범위를 넘어 주장하지 않는가? |

이 기록은 명시한 가정 아래 **내부적으로 일관된 예시**입니다. 실제 서버에서 성공했다는 근거는 없습니다. 마지막 문장을 자연스럽게 쓰는 것만으로 그 공백이 채워지지 않습니다.

| 변형 | 달라진 내용 | 예시 안에서의 판정 | 실제 실행 성공 |
| --- | --- | --- | --- |
| A | 위 기준 기록 | 명세·상태 연결이 일관됨 | 미확인 |
| B | 단계 3에서 횟수 0·예정일 10-01 반환 | 최신 조회·외부 변경 없음 가정과 모순 | 미확인 |
| C | 단계 2에서 명세에 없는 `renew_all()` 호출 | 지원하지 않는 행동, 명세 위반 | 미확인 |
| D | 같은 책을 두 번 연장해 횟수 2·예정일 10-15 | 1회 제한 위반 | 미확인 |

B의 “성공” 문자열을 믿고 통과시키거나, D의 최종 예정일만 보고 목표 달성으로 표시하지 않습니다. 실제 성공 칸은 네 행 모두 미확인입니다. 여기서 하는 일은 창작 기록을 명세와 대조하는 연습입니다.

### 6.3 제출물과 판정 기준

조별로 요청 하나와 변형 기록 두 개를 추가합니다. 조회만 요청했는데 변경한 경우, 필요 정보를 조회하지 않고 추측한 경우, 명세상 복구 가능한 오류에서 중단한 경우 등 **행동의 목적과 근거**가 달라지는 예시를 만듭니다.

제출물은 **생성·검증·학습·평가 지도 1장 + 궤적 판정표 + 관측 출처 기록**입니다. SFT에 사용할 에이전트 메시지와 입력으로만 사용할 도구 메시지를 표시하고, 실제 환경의 근거를 어디서 얻어야 하는지 적습니다. 모델을 호출하지 않아도 수행할 수 있으며, 생성·실행을 하지 않았다면 결과란에 그 사실을 유지합니다.

## 7. 토론과 정리

<p class="heading-subtitle" data-heading-id="discussion"><span aria-hidden="true">💡</span> 더 긴 기록보다 더 명확한 검증 근거</p>

### 7.1 120분 운영안

| 활동 | 시간 | 산출물 |
| --- | ---: | --- |
| 데이터 단위 구분 | 15분 | 응답·보상·관측·행동 구분표 |
| R1 단계 읽기 | 25분 | 생성·선별·SFT·RL 지도 |
| ESAT 방법·부록 읽기 | 25분 | 모사·검증 범위와 한계 |
| 궤적 실습 | 25분 | 출처·상태·행동 판정표 |
| 교차 검토 | 20분 | 실제 근거가 필요한 지점 |
| 다음 강의 연결 | 10분 | 평가 계획의 미확인 항목 |

### 7.2 Discussion(토론)

1. 정답을 맞힌 긴 풀이를 전부 정답 과정으로 학습해도 될까요?
2. R1-Zero는 감독이나 데이터가 전혀 없는 학습일까요?
3. 모사기가 앞뒤가 맞는 응답을 내면 실제 API에서도 성공할까요?
4. 에이전트가 완료를 선언한 것과 목표 상태를 달성한 것은 무엇이 다를까요?

<details class="paper-reading-list">
<summary>토론 해설 펼치기 · 4개 질문</summary>

1. 최종 답과 과정의 검증 상태를 분리해야 합니다. 정답 일치만으로 모든 중간 설명의 타당성이나 충실성이 증명되지는 않습니다.
2. 이미 사전학습된 모델과 보상 기준을 사용합니다. 초기 SFT가 없다는 조건을 감독 신호 전체가 없다는 말로 바꾸면 안 됩니다.
3. 내부 일관성은 필요한 검사이지만 실제 상태 전이와의 일치를 보장하지 않습니다. 독립된 실제 환경 평가가 추가로 필요합니다.
4. 완료 신호는 에이전트의 출력입니다. 대상 상태·제약·부작용을 검사해야 목표 달성 여부를 확인할 수 있습니다.

</details>

### 7.3 한눈 정리와 6강 연결

**응답·보상·관측·행동의 역할을 구분하고, 생성·학습·평가의 경계를 보존합니다.** 모사된 경험이 유용할 수 있다는 주장과 그 경험이 실제 환경을 정확히 재현한다는 주장은 별도의 근거를 요구합니다.

<figure class="paper-figure" id="study-map"><a href="/images/synthetic-data-study/05-reasoning-agents/reading-map.svg" target="_blank" rel="noopener"><img src="/images/synthetic-data-study/05-reasoning-agents/reading-map.svg" width="960" height="570" alt="5강 일곱 단계의 학습 지도: 신호, 추론, 궤적, 모사, 데이터 지도, 실습, 평가 인계" loading="lazy" /></a><figcaption>학습 도식 2. 5강 질문과 산출물 지도. 강의용 개념도입니다.</figcaption></figure>

6강에서는 1–5강의 문서를 모아 **데이터 품질·학습 효과·신뢰성·비용을 어떤 비교로 입증할지** 설계합니다. 미확인 항목을 감추지 않고, 관찰 결과와 다음 평가 계획을 구분한 종합 보고서를 만듭니다.

[← 4강 · 코드와 실행 기반 검증](/notes/synthetic-data-study/04-code-verification/) · [전체 학습 계획](/notes/synthetic-data-study/00-introduction/) · [6강 · 평가·신뢰성과 종합 설계 →](/notes/synthetic-data-study/06-evaluation-trust/)
