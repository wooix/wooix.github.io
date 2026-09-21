---
title: '6강 · 평가·신뢰성과 종합 설계'
description: '네 서베이의 평가 관점을 연결하고, 비교 조건·지표의 분모·평가 분포·신뢰성·비용을 명시한 합성 데이터 연구 설계서를 완성합니다.'
publishedAt: 2026-09-21
topic: synthetic-data-study
category: evaluation
tags: ['합성데이터스터디', '6강', 'Evaluation', 'Trustworthiness', 'Synthetic Data']
kind: research-note
readingTime: 35
featured: false
draft: false
navLabel: '6강 · 평가·신뢰성과 종합 설계'
sourceLinks:
  - title: 'Long et al. (2024) — 직접·간접 평가'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/long-2024/'
    kind: '필수 서베이 A'
  - title: 'Wang et al. (2024) — 한계와 과제'
    url: 'https://wooix.github.io/notes/synthetic-data-study/00-introduction/papers/wang-2024/'
    kind: '필수 서베이 D'
  - title: 'Nadas et al. (2025) — 평가·비용·재현성'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/nadas-2025/'
    kind: '필수 서베이 B'
  - title: 'Zhang et al. (2026) — 품질과 신뢰성'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/zhang-2026/'
    kind: '필수 서베이 C'
takeaway: '좋은 데이터, 유용한 학습 결과, 신뢰할 수 있는 시스템은 서로 다른 주장입니다. 비교 조건과 지표의 분모를 고정하고, 실제로 확보한 근거와 아직 확인하지 못한 항목을 구분해 보고합니다.'
---

[← 5강 · 추론·에이전트 데이터와 최신 흐름](/notes/synthetic-data-study/05-reasoning-agents/) · [0강 · 전체 학습 계획](/notes/synthetic-data-study/00-introduction/)

## Required Reading(필수 읽기 자료)

<p class="heading-subtitle" data-heading-id="required-reading"><span aria-hidden="true">💡</span> 네 서베이를 평가 질문으로 다시 연결하기</p>

| 역할 | 자료와 읽을 범위 | 읽으며 답할 질문 |
| --- | --- | --- |
| 평가의 기본 구조 | [Long et al. (2024)](/notes/synthetic-data-study/01-foundations/papers/long-2024/) §3.3, §4, Figure 5 | 데이터 검사와 학습 효과 검사는 무엇이 다른가? |
| 한계와 적용 범위 | [Wang et al. (2024)](/notes/synthetic-data-study/00-introduction/papers/wang-2024/) §5.1–5.5 | 품질·다양성·일반화·개인정보에서 무엇이 남는가? |
| 비교와 재현성 | [Nadas et al. (2025)](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/) §VII.A–F, §VIII, Table 6 | 어떤 비교 조건과 전체 비용을 기록해야 하는가? |
| 신뢰성과 통합 관점 | [Zhang et al. (2026)](/notes/synthetic-data-study/01-foundations/papers/zhang-2026/) §8–10; 자신의 과제에 해당하는 §2·3·7 | 데이터 유형별 검사를 공통 질문으로 어떻게 연결하는가? |

<details class="paper-reading-list">
<summary>논문별 절별 해설 펼치기 · 4편</summary>
<ul>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/long-2024/">Long et al. (2024)</a><span class="paper-one-line">생성·선별 이후 데이터 자체와 학습 효과를 나누어 평가합니다.</span></li>
<li><a href="/notes/synthetic-data-study/00-introduction/papers/wang-2024/">Wang et al. (2024)</a><span class="paper-one-line">학습 단계별 활용과 품질·다양성·개인정보의 한계를 연결합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/nadas-2025/">Nadas et al. (2025)</a><span class="paper-one-line">텍스트·코드의 비교 실험, 전체 비용, 반복 생성과 재현성 문제를 다룹니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/zhang-2026/">Zhang et al. (2026)</a><span class="paper-one-line">유형별 품질·신뢰성 검사를 공통 평가 관점과 연결합니다.</span></li>
</ul>
</details>

시험지를 잘 만들었다는 말과 그 시험지로 공부한 학생이 실력이 늘었다는 말은 다릅니다. 합성 데이터도 마찬가지입니다. **데이터 검사 → 학습 효과 → 실제 사용 조건**을 각각 확인해야 합니다. 이번 강의에서는 1–5강의 산출물을 모아 그 주장을 뒷받침할 연구 설계서를 만듭니다.

> **자료와 예시의 범위** · 2026년 9월 21일 작성. 읽기 범위는 연결된 개별 요약이 명시한 원문 버전을 따릅니다. 아래 12개 평가 문항과 Judge 판정표는 계산을 위한 창작 예시이며 모델 실험 결과가 아닙니다. 서베이의 미래 연구 방향을 검증이 끝난 방법으로 제시하지 않습니다.

## 1. 평가 질문의 분리

<p class="heading-subtitle" data-heading-id="evaluation-questions"><span aria-hidden="true">💡</span> 무엇이 좋아졌다는 주장인가?</p>

### 1.1 직접 검사와 학습 효과

[Long et al. §3.3](/notes/synthetic-data-study/01-foundations/papers/long-2024/)은 <strong>Direct Evaluation(직접 평가)</strong>과 <strong>Indirect Evaluation(간접 평가)</strong>을 구분합니다. 전자는 예제 자체의 품질을, 후자는 그 자료로 학습한 모델의 성능을 확인하는 관점입니다. 예제가 정확해도 이미 알고 있는 내용만 반복하면 학습 이득은 작을 수 있습니다.

<figure class="paper-figure" id="direct-indirect"><a href="/images/papers/long-2024/figure-5.png" target="_blank" rel="noopener"><img src="/images/papers/long-2024/figure-5.png" width="880" height="672" alt="Long et al. Figure 5의 합성 데이터 직접 평가와 간접 평가 분류" loading="lazy" /></a><figcaption>Long et al. Figure 5. 합성 데이터 평가의 분류. <a href="/notes/synthetic-data-study/01-foundations/papers/long-2024/#figure-5">원문 출처와 그림 해설</a></figcaption></figure>

그림은 데이터의 속성을 직접 검사하는 경로와, 학습 후 과제 수행을 통해 효과를 판단하는 경로를 나눕니다. 한쪽의 통과가 다른 쪽의 통과를 대신하지 않습니다. 사람이 자연스럽다고 판단한 답안도 사실 오류가 있을 수 있고, 일부 평가 성능이 높아져도 다른 사용자 집단에서 오류가 늘 수 있습니다.

### 1.2 주장에 맞는 증거

| 주장 | 필요한 관찰 | 이것만으로는 부족함 |
| --- | --- | --- |
| 자료의 정확성이 높아졌다 | 같은 기준의 전후 표본 검사와 오류 유형 | 생성기와 평가기의 동의 |
| 학습에 도움이 됐다 | 명시한 비교 모델과 독립 평가의 차이 | 학습 손실 감소·채택률 증가 |
| 코드가 명세를 만족한다 | 명세에 대응하는 실행 검사와 범위 | 몇 개 예제 테스트 통과 |
| Agent가 목표를 달성했다 | 실제 환경의 목표 상태·제약·부작용 검사 | 모사 기록의 완료 선언 |
| 개인정보 위험이 낮아졌다 | 정의한 위협과 검사 범위의 결과 | 합성 데이터라는 이름·PII 필터 적용 |

이 표는 네 서베이와 앞 강의를 연결한 **강의용 연구 설계 기준**입니다. 모든 논문이 이 조건을 동일하게 검증했다는 뜻은 아닙니다. 관찰하지 않은 항목은 `미측정`, 실행하지 않은 행동은 `미실행`, 확인할 수 없는 상태는 `미확인`으로 구별합니다.

## 2. 비교 설계

<p class="heading-subtitle" data-heading-id="comparison-design"><span aria-hidden="true">💡</span> 어떤 차이의 효과를 측정하는가?</p>

### 2.1 대조군과 예산

<strong>Baseline(비교 기준)</strong>은 “합성 데이터를 사용하지 않은 출발 모델”일 수도 있고 “기존 자료만으로 같은 학습을 수행한 모델”일 수도 있습니다. 둘은 다른 질문에 답합니다. 기존 자료가 없다면 있는 것처럼 대조군을 만들지 말고 가능한 비교와 한계를 적습니다.

[Nadas et al. §VII](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/)의 평가 관점을 바탕으로 다음 조건을 선택합니다. 실제 자료만, 합성 자료만, 혼합 자료의 비교도 자료 접근성과 연구 질문이 허용할 때 설계합니다.

| 고정할 조건 | 답할 수 있는 질문 | 남는 차이 |
| --- | --- | --- |
| 학습 예제 수 | 같은 개수에서 자료 구성이 유용한가? | 예제 길이·토큰·계산량 |
| 학습 토큰 수 | 같은 토큰 예산에서 유용한가? | 생성·선별 비용·문항 구성 |
| 학습 계산 예산 | 같은 학습 자원에서 유용한가? | 데이터 확보 비용 |
| 전체 비용 | 데이터 확보부터 평가까지 같은 예산에서 유용한가? | 비용 산정·상각 조건 |

모든 조건을 동시에 같게 만들 수 있다고 가정하지 않습니다. 주 비교 기준을 먼저 정하고 나머지는 함께 보고합니다. 모델 초기 상태, 학습 설정, 추론 예산, 중단 기준의 차이도 기록합니다. 구성 요소의 효과를 보려면 그 요소만 제거한 비교가 필요하지만, 제거와 동시에 토큰 수까지 바뀌면 두 효과가 섞입니다.

### 2.2 분할과 오염

<strong>Data Contamination(데이터 오염)</strong>은 평가 정보가 생성·선별·학습 결정에 들어가 독립 평가의 의미를 약하게 만드는 문제입니다. [Wang et al. §5](/notes/synthetic-data-study/00-introduction/papers/wang-2024/)이 지적하듯 표현을 바꾼 중복은 단순 문자열 검사만으로 찾기 어렵습니다.

원천 문서·문제·코드 계통·사용자 상태에서 파생한 예시들은 함께 묶어 분할합니다. 최종 평가 문항을 보고 프롬프트나 선별 문턱을 수정했다면 그 자료는 개발에 사용된 것입니다. 별도의 최종 평가가 필요합니다. 공개 평가셋과 문자열이 다르다는 사실만으로 생성 모델의 사전학습 오염까지 없다고 단정하지 않습니다.

### 2.3 재현할 수 있는 단위

생성 모델·판정 모델·프롬프트·자료 버전·랜덤 시드·선별 이유·학습 설정을 함께 기록합니다. 닫힌 모델의 버전을 고정할 수 없다면 호출 시점과 노출된 식별자를 남기고 한계를 적습니다. 재현성은 동일 문자열의 재생뿐 아니라 어떤 선택이 결과를 만들었는지 추적하는 문제입니다.

## 3. 지표와 분모

<p class="heading-subtitle" data-heading-id="metrics-denominators"><span aria-hidden="true">💡</span> 통과율은 무엇을 놓치고 있는가?</p>

### 3.1 하나의 품질 점수로 합치기 전에

[Zhang et al. §8](/notes/synthetic-data-study/01-foundations/papers/zhang-2026/)의 통합 관점은 데이터 유형이 달라도 품질과 신뢰성을 함께 질문하자는 틀입니다. 텍스트의 근거 일치, 코드의 실행 정확성, Agent의 상태 전이를 동일 검사 하나로 대신한다는 뜻은 아닙니다.

| 검사 대상 | 예시 지표·기록 | 분모·조건 |
| --- | --- | --- |
| 근거 일치 | 원문으로 뒷받침한 주장 수 | 검토한 주장 수·판정 기준 |
| 다양성 | 과제·난도·오류 유형별 분포 | 유형 정의·중복 처리 방식 |
| 선별 | 채택·탈락·보류 비율 | 전체 생성 후보 수 |
| 실행 | 성공·오류·시간 초과 | 실행한 사례 수·환경·제한 |
| 학습 효과 | 독립 과제의 성능 차이 | 같은 평가 문항·추론 조건 |

보류를 실패나 성공으로 조용히 합치지 않습니다. 실행할 수 없는 자료를 제외했다면 제외 수와 이유를 별도로 보고합니다. 비율의 분모가 0이면 값은 정의되지 않으며 0%라고 쓰지 않습니다.

### 3.2 Judge 감사의 창작 예시

<strong>LLM-as-a-Judge(평가자로 쓰는 언어 모델)</strong>가 12개 후보를 채택 또는 탈락시켰다고 가정합니다. 사람이 명시한 기준으로 다시 검토한 참조 판정을 다음처럼 **설정한 예시**입니다. 사람 판정도 절대적 진실로 가정하지 않으며 이견 처리와 기준이 필요합니다.

| Judge 판정 | 사람 기준 유효 | 사람 기준 무효 | 합계 |
| --- | ---: | ---: | ---: |
| 채택 | 6 | 2 | 8 |
| 탈락 | 2 | 2 | 4 |
| 합계 | 8 | 4 | 12 |

- 채택 정밀도: 채택한 8개 중 유효한 6개, **6/8 = 75%**.
- 유효 보존율: 유효한 8개 중 채택한 6개, **6/8 = 75%**.
- 무효 통과율: 무효한 4개 중 채택한 2개, **2/4 = 50%**.
- 채택 자료의 무효 비율: 채택한 8개 중 무효한 2개, **2/8 = 25%**.

앞의 두 값은 우연히 같지만 분모의 집합이 다릅니다. 채택 자료만 감사하면 유효한 자료를 얼마나 버렸는지 알 수 없습니다. 통과·탈락 양쪽을 보고, 판정하기 어려운 유형을 따로 살펴야 합니다. 특정 오류를 많이 뽑은 감사 표본의 비율을 전체 데이터 비율로 곧바로 보고하지 않습니다. 표집 확률이나 모집단 구성이 필요한 이유입니다.

## 4. 신뢰성과 반복 생성

<p class="heading-subtitle" data-heading-id="trust-and-iteration"><span aria-hidden="true">💡</span> 기록·검증·보장은 서로 다르다</p>

### 4.1 출처와 권한

<strong>Provenance(출처와 처리 이력)</strong>는 어떤 자료에서 어떻게 만들어졌는지 추적하게 합니다. 출처를 알 수 있다는 사실만으로 내용이 정확하거나 사용 권한이 확보되지는 않습니다. 원천 자료의 이용 조건과 생성·변환·검토 이력을 각각 기록합니다. [Wang et al. §5](/notes/synthetic-data-study/00-introduction/papers/wang-2024/)과 [Nadas et al. §VII–VIII](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/)의 한계를 읽으며 “합성이라 원본 위험이 사라진다”는 전제를 점검합니다.

개인정보 패턴 필터를 적용한 결과는 해당 필터의 검사 결과입니다. 그것만으로 재식별·암기 정보 재현 등 모든 위험이 사라졌다는 보장은 할 수 없습니다. 검사하지 않은 위험과 공개할 수 없는 자료는 설계서에 구별해 남깁니다.

### 4.2 집단과 실패 비용

<strong>Fairness(공정성)</strong> 검토에는 어떤 집단과 어떤 오류를 비교할지가 필요합니다. 전체 정확도가 높아져도 일부 집단의 누락이나 과도한 거절이 늘 수 있습니다. 집단별 표본 수·성공·실패 유형을 함께 보고, 표본이 너무 적거나 없는 집단에 대해 안정된 결론을 내리지 않습니다.

위험이 큰 실패는 평균 성능으로 상쇄할 수 있는 항목인지 따로 정해야 합니다. [Zhang et al. §9](/notes/synthetic-data-study/01-foundations/papers/zhang-2026/)의 유용성·신뢰성 절충 논의는 연구 방향입니다. 모든 과제에서 반드시 같은 상충 관계가 발생한다고 입증한 결과는 아닙니다.

### 4.3 반복할 때 남겨야 할 기준점

<strong>Model Collapse(모델 붕괴)</strong> 관련 논의는 합성 자료를 반복 사용하면 반드시 실패한다는 법칙으로 읽지 않습니다. [Nadas et al. §VII–VIII](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/)을 통해 실제 자료의 유지·축적, 분포, 선별과 반복 방식을 구분합니다.

반복마다 자료 버전, 원천 계통, 드문 유형의 비중, 오류율, 독립 평가를 추적합니다. 실제 자료를 기준점으로 유지할 수 있다면 그 역할도 기록합니다. 이전 평가셋으로 계속 최적화하면서 그 점수만 상승하는 현상과 새로운 자료에서의 개선을 구분합니다. 반복 횟수 자체보다 무엇이 유지되고 사라지는지를 봅니다.

## 5. 결과의 해석

<p class="heading-subtitle" data-heading-id="interpreting-results"><span aria-hidden="true">💡</span> 같은 결과도 목표 분포에 따라 의미가 달라진다</p>

### 5.1 문항 평균과 목표 분포

모델 A와 B를 **같은 가상 12문항**에서 평가했다고 가정합니다. 일반 문항 8개와 예외 문항 4개를 설정했습니다. 아래는 실제 모델의 결과가 아닙니다.

| 모델 | 일반 문항 | 예외 문항 | 전체 문항 평균 |
| --- | ---: | ---: | ---: |
| A | 7/8 = 87.5% | 1/4 = 25% | 8/12 ≈ 66.67% |
| B | 6/8 = 75% | 3/4 = 75% | 9/12 = 75% |

문항 평균은 일반 2/3·예외 1/3인 **이 표본의 구성**을 반영합니다. 두 범주의 정확도를 절반씩 평균한 값과도 다릅니다. 이제 목표 사용 환경의 비중을 일반 90%·예외 10%라고 **가정**하고, 범주별 성능이 그 환경에도 적용된다는 가정 아래 가중합니다.

$$
U_w=\sum_g w_g\hat{u}_g,\qquad w_g\geq 0,\quad \sum_g w_g=1.
$$

이 식은 강의용 가중 평균입니다. $\hat{u}_g$는 범주 $g$의 관측 성능, $w_g$는 목표 비중입니다. 범주 내 표본이 없으면 성능을 0으로 채워 계산하지 않습니다. 목표 비중도 실제로 추정한 것인지 가정인지 밝혀야 합니다.

$$
U_A=0.9\times 0.875+0.1\times 0.25=0.8125,\qquad
U_B=0.9\times 0.75+0.1\times 0.75=0.75.
$$

이 가정에서는 A가 81.25%, B가 75%입니다. **전체 문항 평균과 가중 평균의 순위가 달라집니다.** 그러나 A를 선택해야 한다는 결론은 아닙니다. 예외 실패의 비용이나 반드시 만족해야 할 기준이 있다면 함께 고려해야 합니다. 목표 비중을 결과를 보고 유리하게 고르지 않도록 사전에 정합니다.

### 5.2 불확실성과 비교의 단위

12문항의 창작 계산으로 통계적 우월성이나 실제 사용 성능을 주장할 수 없습니다. 같은 문항을 평가했다는 설정만 있고 문항별 A·B 공동 정오 기록은 없으므로, 이 표만으로 짝지은 비교의 불확실성도 계산하지 않습니다.

실제 설계에서는 문항별 결과를 보존하고, 같은 원천에서 나온 변형들을 독립 표본처럼 세지 않습니다. 과제 계통을 고려한 불확실성 추정과 학습 시드에 따른 변동을 구분합니다. 여러 시드에서 같은 평가 문항을 썼다는 사실은 독립 평가 문항 수가 늘었다는 뜻이 아닙니다.

### 5.3 비용의 경계

전체 비용은 원천 확보·생성·선별·사람 검토·학습·평가를 포함하도록 범위를 정합니다. 같은 비용을 두 항목에 중복 집계하지 않고, 재사용하는 판정기 구축 비용을 어떻게 배분했는지도 적습니다. 토큰 수, GPU 시간, 사람 시간은 단위가 다르므로 환산 기준 없이 더하지 않습니다.

채택 예제당 비용은 채택 수가 0이면 정의되지 않습니다. 저렴한 예제를 많이 만든 것과 같은 총예산에서 학습 효과가 큰 것은 별도의 결과입니다. [Nadas et al. §VII](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/)의 재현성·비용 관점을 이 구분에 적용합니다.

## 6. 종합 설계 실습

<p class="heading-subtitle" data-heading-id="integrated-design"><span aria-hidden="true">💡</span> 여섯 강의 산출물을 하나의 검증 계획으로 묶기</p>

[종합 연구 설계서 Markdown 양식 다운로드](/downloads/synthetic-data-study/06-evaluation-trust/study-design-template.md)

### 6.1 앞 강의에서 가져올 자료

| 강의 | 가져올 내용 | 이번에 연결할 질문 |
| --- | --- | --- |
| [1강 · 역사와 학습 신호](/notes/synthetic-data-study/01-foundations/) | 부족한 입력·정답·능력의 구분 | 무엇이 개선되면 성공인가? |
| [2강 · 텍스트·지시문 생성과 데이터셋 설계](/notes/synthetic-data-study/02-text-instructions/) | 생성 조건과 원천 근거 | 어떤 자료 계통과 버전을 비교하는가? |
| [3강 · 큐레이션과 데이터 구성](/notes/synthetic-data-study/03-curation/) | 선별·수정·보류 기록 | 통과와 탈락의 오류를 어떻게 감사하는가? |
| [4강 · 코드와 실행 기반 검증](/notes/synthetic-data-study/04-code-verification/) | 명세·테스트·실행 결과 | 검증 범위 밖의 조건은 무엇인가? |
| [5강 · 추론·에이전트 데이터와 최신 흐름](/notes/synthetic-data-study/05-reasoning-agents/) | 학습 신호·관측 출처·궤적 | 모사와 실제 환경의 차이를 어디서 검사하는가? |

<figure class="paper-figure" id="evaluation-flow"><a href="/images/synthetic-data-study/06-evaluation-trust/workflow.svg" target="_blank" rel="noopener"><img src="/images/synthetic-data-study/06-evaluation-trust/workflow.svg" width="960" height="550" alt="목표 주장, 자료 계통, 비교 조건, 지표와 감사, 독립 평가, 근거 보고로 이어지는 평가 설계" loading="lazy" /></a><figcaption>학습 도식 1. 자료 설계에서 근거 보고까지. 강의용 개념도입니다.</figcaption></figure>

### 6.2 근거 장부

설계서는 성공한 결과를 채워 넣는 문서가 아닙니다. 다음처럼 **주장·필요 근거·현재 상태·다음 확인**을 묶습니다. 표의 상태는 예시이며 실제 프로젝트의 상태로 바꿔야 합니다.

| 주장 후보 | 필요한 근거 | 현재 상태 예시 | 다음 확인 |
| --- | --- | --- | --- |
| 수정 후 정확성이 높아진다 | 같은 기준의 전후 표본 판정 | 미측정 | 표집·판정 기준을 고정 |
| 자료가 학생 모델에 유용하다 | 고정 예산의 비교 학습과 독립 평가 | 미실행 | 대조군·분할·예산 명시 |
| 행동 기록이 실제 환경에 전이된다 | 실제 환경의 목표·제약 검사 | 미확인 | 모사와 실행 기록 분리 |

실행하지 않아도 설계 과제를 완성할 수 있습니다. 이때 “실험 설계 완료”와 “효과 검증 완료”를 분리합니다. 4강의 실행 예제는 수작업 함수의 테스트 결과이고, 5강의 API 기록은 창작 예시입니다. 두 자료를 모델 학습 성능으로 바꾸어 쓰지 않습니다.

### 6.3 중단 기준과 제출물

생성·재시도·학습·평가의 최대 예산을 정하고, 어떤 관찰이면 방법을 수정하거나 중단할지 미리 적습니다. 오류율 문턱은 과제와 실패 비용에 맞춰 근거를 적으며 보편적인 숫자를 임의로 부여하지 않습니다. 최종 평가를 본 뒤 기준을 바꿨다면 변경 이력을 공개하고 새 평가 필요성을 기록합니다.

제출물은 **연구 설계서 + 자료·판정 계통도 + 근거 장부**입니다. 다른 조는 결과의 좋고 나쁨보다 “이 비교로 이 주장을 할 수 있는가”를 검토합니다. 실제 생성·학습은 선택 사항이며, 측정하지 않은 결과를 0이나 예상 성능으로 채우지 않습니다.

## 7. 토론과 정리

<p class="heading-subtitle" data-heading-id="discussion"><span aria-hidden="true">💡</span> 개선 주장과 근거의 범위를 맞추기</p>

### 7.1 120분 운영안

| 활동 | 시간 | 산출물 |
| --- | ---: | --- |
| 네 서베이의 평가 질문 연결 | 20분 | 주장과 필요한 증거 |
| 비교 조건·분할 설계 | 20분 | 대조군·예산·분할표 |
| Judge와 분포 계산 | 20분 | 분모·가정 검토표 |
| 종합 설계서 작성 | 35분 | 설계서·근거 장부 |
| 조별 교차 검토 | 20분 | 근거 공백·수정 사항 |
| 마무리 | 5분 | 첫 실행 또는 다음 확인 항목 |

### 7.2 Discussion(토론)

1. 선별 후 채택 자료의 정확도가 높아졌으면 학습 효과도 좋아졌다고 말할 수 있을까요?
2. 예외 사례를 많이 넣은 평가와 실제 비율을 반영한 평가 중 어느 쪽이 맞을까요?
3. Judge가 채택한 자료만 사람이 검토하면 충분할까요?
4. 아직 학습을 실행하지 않은 조는 무엇을 결과로 제출해야 할까요?

<details class="paper-reading-list">
<summary>토론 해설 펼치기 · 4개 질문</summary>

1. 직접 품질 개선과 학생 모델의 성능 개선은 다른 주장입니다. 유용한 어려운 예제를 버렸을 수도 있으므로 독립 평가에서 확인해야 합니다.
2. 두 평가는 다른 질문에 답합니다. 실제 평균 품질과 드문 중요 실패를 함께 보고, 표본 구성·목표 비중·실패 비용을 명시합니다.
3. 채택 자료의 오류는 볼 수 있지만 유효 자료의 탈락은 볼 수 없습니다. 통과·탈락 양쪽을 감사하고 표집 방식에 따른 해석 범위를 밝힙니다.
4. 비교 조건·지표·분모·분할·예산·중단 기준이 명확한 설계서와 근거 장부를 제출합니다. 학습 효과는 미측정으로 남기며 예상치를 관찰 결과처럼 쓰지 않습니다.

</details>

### 7.3 전체 스터디의 연결

1강은 부족한 학습 신호를 정의했고, 2강은 그것을 생성하는 조건을, 3강은 남길 자료를 판단하는 기준을 다뤘습니다. 4강은 실행 검증의 범위를, 5강은 추론·행동 경험의 출처를 구분했습니다. 6강에서는 이 선택들이 어떤 개선을 만들었는지 확인할 비교를 설계했습니다.

<figure class="paper-figure" id="study-map"><a href="/images/synthetic-data-study/06-evaluation-trust/reading-map.svg" target="_blank" rel="noopener"><img src="/images/synthetic-data-study/06-evaluation-trust/reading-map.svg" width="960" height="570" alt="6강 일곱 단계: 평가 질문, 비교, 분모, 신뢰성, 결과 해석, 종합 설계, 근거 보고" loading="lazy" /></a><figcaption>학습 도식 2. 6강의 질문과 최종 산출물. 강의용 개념도입니다.</figcaption></figure>

연구 설계서에서 **가장 중요한 미확인 주장 하나**를 고르고, 이를 판별할 수 있는 작은 검사를 첫 실행으로 정합니다. 생성량을 늘리는 결정도 그 검사에서 얻은 근거와 함께 내립니다.

[← 5강 · 추론·에이전트 데이터와 최신 흐름](/notes/synthetic-data-study/05-reasoning-agents/) · [전체 학습 계획으로 돌아가기](/notes/synthetic-data-study/00-introduction/)
