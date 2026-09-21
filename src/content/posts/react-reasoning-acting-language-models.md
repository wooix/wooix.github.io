---
title: 'ReAct — 추론과 행동을 결합하는 언어 모델'
description: 'ReAct의 추론·행동·관찰 구조, 검색과 의사결정 실험, 미세조정과 오류 분석을 Figure 1–5·Table 1–10·핵심 수식으로 읽습니다.'
publishedAt: '2026-09-21'
topic: llm-tech
category: agents
tags: ['ReAct', 'LLM Agents', 'Reasoning', 'Tool Use', 'Chain of Thought', 'Grounding', '논문 해설']
kind: research-review
readingTime: 35
featured: false
draft: false
sourceLinks:
  - title: 'Yao et al. · ReAct · arXiv v3'
    url: https://arxiv.org/abs/2210.03629v3
    kind: 원문
  - title: '검토 PDF · 2023-03-10 · ICLR 2023'
    url: https://arxiv.org/pdf/2210.03629v3
    kind: PDF
  - title: '저자 프로젝트와 코드'
    url: https://react-lm.github.io/
    kind: 공식 자료
takeaway: 'ReAct는 언어로 다음 행동을 계획하고, 외부 도구·환경에서 얻은 관찰로 추론을 갱신한다. 행동만 생성하는 비교군보다 유리했지만, 검색 실패와 반복 행동이 남았고 모든 과제에서 추론만 하는 방법을 이기지는 않았다.'
---

Shunyu Yao, Jeffrey Zhao, Dian Yu, Nan Du, Izhak Shafran, Karthik Narasimhan, Yuan Cao의 *ReAct: Synergizing Reasoning and Acting in Language Models*를 설명합니다. 최초 공개는 <strong>2022-10-06</strong>, 검토한 판본은 <strong>2023-03-10의 arXiv v3</strong>, 학회 발표는 <strong>ICLR 2023</strong>, 이 해설 게시일은 <strong>2026-09-21</strong>입니다. 당시 모델과 실험을 설명하며 최신 에이전트의 성능 순위로 소개하지 않습니다. [원문·판본](https://arxiv.org/abs/2210.03629v3)

본문과 부록 A–E를 원문 순서로 읽습니다. <strong>Figure 1–5 전체와 Table 1–10 전체</strong>를 각 설명 위치에 넣고, 원문에 번호 없이 제시된 정책·문맥 수식을 풀어 설명합니다. 부록의 긴 프롬프트와 실행 예시는 역할과 실패 원인을 한국어로 요약하며, 감사의 글·참고문헌 목록은 재수록하지 않습니다.

## Abstract

요리 중 재료가 없다는 사실을 발견하면 계획을 바꾸고, 필요한 정보를 찾아 다시 조리합니다. 논문이 도입에서 사용하는 이 사례처럼, <strong>ReAct(추론·행동 결합)</strong>는 먼저 완성한 계획을 끝까지 밀어붙이기보다 추론과 행동을 번갈아 사용합니다.

<strong>Thought(추론 기록)</strong>는 무엇을 할지 정리하고, <strong>Action(행동)</strong>은 검색하거나 환경에 명령을 보내며, <strong>Observation(관찰)</strong>은 그 결과를 다음 판단에 제공합니다. 핵심은 추론 문장을 길게 쓰는 것 자체보다, 외부 결과가 이후의 행동을 바꿀 수 있는 구조입니다.

논문은 지식 기반 질의응답·사실 검증과 상호작용 과제를 평가합니다. 초록의 성공률 개선 34와 약 10은 상대 증가율이 아니라 <strong>퍼센트포인트 차이</strong>로 읽어야 합니다. ALFWorld에서는 최선 프롬프트 실행 비교, WebShop에서는 별도의 구매 과제 비교이므로 하나의 종합 점수로 합치지 않습니다. [초록·§4](https://arxiv.org/pdf/2210.03629v3#page=1)

## 1. Introduction

<strong>CoT(Chain-of-Thought, 사고 사슬)</strong>는 중간 추론을 생성하지만 그 안에 쓰인 사실이 맞는지 외부에서 확인하지 않을 수 있습니다. 반대로 <strong>Act-only(행동만 생성)</strong>는 도구를 사용할 수 있어도, 현재 목표와 관찰의 의미를 정리하지 못해 잘못된 행동을 반복할 수 있습니다. ReAct는 두 방법의 장점을 결합하려고 합니다.

<figure>
  <a href="/images/papers/yao-2022/figure-1.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/figure-1.png" width="1215" height="1221" alt="Figure 1. 질의응답과 가정 환경에서 네 가지 프롬프트 방식 비교" loading="lazy" /></a>
  <figcaption>Figure 1. 질의응답과 가정 환경에서 네 가지 프롬프트 방식 비교 — Yao et al., arXiv v3, p. 2. <a href="https://arxiv.org/pdf/2210.03629v3#page=2">원문</a> · <a href="/images/papers/yao-2022/figure-1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

위쪽 (1)은 HotpotQA 질문입니다. (1a)는 바로 답하고, (1b)는 내부 추론만 하며, (1c)는 검색하지만 답을 잘못 종합합니다. (1d)는 검색 결과를 읽고 다음 검색 대상을 정하며, 이름이 모호하면 검색어를 수정합니다. 초록색은 유용한 근거·올바른 결과, 빨간색은 오류 지점입니다.

아래 (2)는 후추통을 서랍에 놓는 ALFWorld 과제입니다. 왼쪽은 없는 물건을 집으려는 행동을 반복하고, 오른쪽은 물건을 찾은 뒤 다음 하위 목표로 전환합니다. 파란색 부분은 계획·진행 상황을 정리하는 추론입니다. 그림은 선택된 실행 사례이며 성공률을 보여주는 통계 그래프는 아닙니다. 모델이 생성한 Thought·Action과 환경이 돌려준 Observation을 구분해서 읽어야 합니다.

연구의 질문은 <strong>“추론이 행동을 안내하고, 행동 결과가 다시 추론에 정보를 줄 때 무엇이 달라지는가?”</strong>입니다. 이를 질의응답뿐 아니라 여러 단계를 수행해야 하는 환경에서 비교합니다. [§1](https://arxiv.org/pdf/2210.03629v3#page=2)

## 2. ReAct: Synergizing Reasoning + Acting

시점 $t$에서 에이전트는 관찰 $o_t$를 받아 행동 $a_t$를 선택합니다. 원문은 정책을 다음처럼 표현합니다.

$$
\pi(a_t\mid c_t),\qquad c_t=(o_1,a_1,\ldots,o_{t-1},a_{t-1},o_t).
$$

$\pi$는 주어진 문맥에서 행동을 선택하는 Policy(정책), $c_t$는 지금까지의 관찰·행동 기록입니다. 처음 질문만 보고 행동을 고르는 것이 아니라 <strong>이미 시도한 일과 그 결과까지 조건으로 사용</strong>한다는 의미입니다.

ReAct는 외부 행동의 집합 $\mathcal A$에 언어 공간 $\mathcal L$을 더합니다.

$$
\hat{\mathcal A}=\mathcal A\cup\mathcal L.
$$

이때 언어 공간의 행동 $\hat a_t\in\mathcal L$이 Thought(추론 기록)입니다. 외부 환경을 직접 바꾸는 명령과 달리, 추론 기록은 문맥에 추가됩니다.

$$
c_{t+1}=(c_t,\hat a_t),\qquad \hat a_t\in\mathcal L.
$$

이 식은 <strong>추론 단계의 문맥 갱신</strong>을 설명합니다. 도구 호출 뒤의 관찰까지 이 식 하나로 생략해도 된다는 뜻은 아닙니다. 검색·이동 같은 외부 행동을 실행하면 그 결과를 환경에서 받아야 합니다. 출력에 Observation이라고 써 놓았다는 사실만으로 외부 검증을 거친 것은 아닙니다.

추론의 역할에는 목표 분해, 관찰에서 정보 추출, 상식 적용, 완료한 하위 목표 확인, 검색 실패 후 계획 수정이 포함됩니다. 주 실험은 가중치를 고정한 PaLM-540B에 소수의 시범을 제공하는 <strong>Few-shot prompting(소수 예시 프롬프팅)</strong>입니다. 별도로 작은 모델의 Fine-tuning(미세조정)도 실험합니다.

질의응답에서는 Thought → Action → Observation을 촘촘히 교차하지만, 의사결정 과제에서는 여러 행동 사이에 필요한 순간만 추론을 넣습니다. 따라서 모든 ReAct 실행이 반드시 매 행동마다 같은 세 줄을 반복해야 하는 것은 아닙니다. 원문이 말하는 해석 가능성은 실행 기록을 사람이 살펴볼 수 있다는 장점이지, 기록이 항상 옳거나 모델 내부 계산을 완전히 설명한다는 보장은 아닙니다. [§2](https://arxiv.org/pdf/2210.03629v3#page=3)

## 3. Knowledge-Intensive Reasoning Tasks

이 절은 질문이나 주장만 받은 모델이 내부 지식과 검색을 어떻게 조합하는지 평가합니다. 처음부터 정답 근거 문단을 제공하는 설정과 구분합니다.

### 3.1. Setup

<strong>HotpotQA</strong>는 여러 문서의 정보를 연결하는 질의응답입니다. <strong>FEVER</strong>는 주장을 SUPPORTS(지지), REFUTES(반박), NOT ENOUGH INFO(정보 부족)로 분류합니다. 검색 인터페이스는 다음 세 가지입니다.

| 행동 | 반환하거나 수행하는 것 | 역할 |
|---|---|---|
| `search[entity]` | 해당 Wikipedia 문서의 처음 다섯 문장, 없으면 유사한 문서명 후보 | 대상을 찾는다 |
| `lookup[string]` | 현재 문서에서 문자열을 포함하는 다음 문장 | 필요한 근거를 좁힌다 |
| `finish[answer]` | 답을 제출하고 종료 | 얻은 정보를 종합한다 |

위 표는 원문 §3.1의 인터페이스를 한국어로 정리한 것입니다. 강력한 검색기를 별도로 최적화한 연구가 아니라, 제한된 인터페이스에서 검색 대상을 추론하게 하는 설계입니다. [§3.1](https://arxiv.org/pdf/2210.03629v3#page=4)

### 3.2. Methods

HotpotQA는 학습 사례 6개, FEVER는 3개를 골라 사람이 추론·행동·관찰의 시범을 작성합니다. 동일한 시범에서 구성 요소를 빼 비교군을 만듭니다. Standard(직접 응답)는 답만, CoT(사고 사슬)는 추론과 답만, Act-only(행동만 생성)는 추론을 제외한 행동·관찰을 사용합니다.

<strong>CoT-SC(Chain-of-Thought with Self-Consistency, 다중 추론의 답 일치도 활용)</strong>는 temperature 0.7에서 21개 추론 경로를 생성하고 다수 답을 선택합니다. ReAct와 CoT-SC의 결합은 다음과 같은 휴리스틱 전환입니다.

- <strong>ReAct → CoT-SC:</strong> HotpotQA 7단계, FEVER 5단계 안에 답을 내지 못하면 CoT-SC로 넘어갑니다.
- <strong>CoT-SC → ReAct:</strong> $n$개 답 중 가장 많은 답도 $n/2$회 미만이면 ReAct로 넘어갑니다.

이 기준은 학습된 최적 정책이나 확률 보정된 신뢰도 점수가 아닙니다. 저자들이 실험에 사용한 전환 규칙입니다.

Fine-tuning(미세조정)에는 정답을 낸 생성 경로 3,000개를 사용해 PaLM-8B·62B를 학습합니다. 원문은 질문·주장을 조건으로 Thought·Action·Observation 전체를 생성하도록 학습했다고 기술합니다. 정답이 맞는 경로를 골랐다고 해서 중간 근거까지 모두 올바른 것은 아니라는 점은 다음 오류 분석에서 중요해집니다. [§3.2](https://arxiv.org/pdf/2210.03629v3#page=5)

### 3.3. Results and Observations

<figure>
  <a href="/images/papers/yao-2022/table-1.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-1.png" width="519" height="459" alt="Table 1. PaLM-540B의 질의응답·사실 검증 결과" loading="lazy" /></a>
  <figcaption>Table 1. PaLM-540B의 질의응답·사실 검증 결과 — Yao et al., arXiv v3, p. 5. <a href="https://arxiv.org/pdf/2210.03629v3#page=5">원문</a> · <a href="/images/papers/yao-2022/table-1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

HotpotQA 열은 EM(Exact Match, 정답 문자열 일치), FEVER 열은 Accuracy(정확도)입니다. ReAct는 Act보다 두 과제 모두 높지만, CoT와 비교하면 HotpotQA에서는 <strong>27.4 대 29.4</strong>로 낮고 FEVER에서는 <strong>60.9 대 56.3</strong>으로 높습니다. 따라서 “도구 사용을 추가하면 항상 좋아진다”는 결론은 맞지 않습니다.

HotpotQA의 최고 프롬프팅 값은 ReAct → CoT-SC의 <strong>35.1</strong>, FEVER는 CoT-SC → ReAct의 <strong>64.6</strong>입니다. 표 마지막의 Supervised SoTA(지도학습 최고 수준 비교)는 전용 지도학습 방법이며 같은 프롬프팅 예산으로 통제한 비교군이 아닙니다. 원문 각주 a는 다른 보고서의 Standard·CoT·CoT-SC HotpotQA 값이 27.1·28.9·33.8이라고 밝힙니다. 각주 b의 전용 지도학습 값은 Zhu et al.·Lewis et al.에서 가져왔습니다.

<figure>
  <a href="/images/papers/yao-2022/table-2.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-2.png" width="1215" height="342" alt="Table 2. 수작업으로 구분한 성공·실패 원인" loading="lazy" /></a>
  <figcaption>Table 2. 수작업으로 구분한 성공·실패 원인 — Yao et al., arXiv v3, p. 6. <a href="https://arxiv.org/pdf/2210.03629v3#page=6">원문</a> · <a href="/images/papers/yao-2022/table-2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

각 방법에서 정답 사례 50개와 오답 사례 50개를 골라 총 200개를 분석했습니다. <strong>표의 비율은 정답군 또는 오답군 내부의 구성비</strong>입니다. 예를 들어 CoT 실패의 56%가 Hallucination(환각)으로 분류되었다는 뜻이지, 전체 질문의 56%가 그 이유로 실패했다는 뜻이 아닙니다.

정답군에서도 근거나 추론이 잘못된 False positive(겉보기 정답)가 ReAct 6%, CoT 14%입니다. ReAct 오답군은 추론 오류 47%, 검색 결과 오류 23%, 라벨 모호성 29%로 보고됩니다. 반올림으로 합이 100%와 다를 수 있습니다. 이 표본에서 ReAct 환각 오류가 0%였다고 해서 모든 실행에서 환각이 사라졌다고 일반화하지 않습니다.

외부 근거에 의존하면 사실성을 높일 수 있지만, 검색이 비어 있거나 무관하면 추론이 막힙니다. 같은 행동을 반복하는 루프도 추론 오류에 포함됩니다. 이 관찰이 내부 지식을 쓰는 CoT-SC와의 결합 동기입니다.

<figure>
  <a href="/images/papers/yao-2022/figure-2.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/figure-2.png" width="693" height="504" alt="Figure 2. CoT-SC 생성 경로 수와 성능" loading="lazy" /></a>
  <figcaption>Figure 2. CoT-SC 생성 경로 수와 성능 — Yao et al., arXiv v3, p. 5. <a href="https://arxiv.org/pdf/2210.03629v3#page=5">원문</a> · <a href="/images/papers/yao-2022/figure-2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축은 CoT-SC의 샘플 수, 세로축은 왼쪽 HotpotQA EM과 오른쪽 FEVER Accuracy입니다. 실선은 결합 방식과 CoT-SC, 점선은 단일 방식의 기준입니다. 결합 방식은 이 실험에서 더 적은 CoT 샘플로 높은 성능에 도달하지만, 가로축에 도구 호출·지연·전체 토큰 비용이 모두 포함된 것은 아닙니다. 같은 샘플 수가 같은 총 실행 비용을 뜻하지 않습니다.

<figure>
  <a href="/images/papers/yao-2022/figure-3.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/figure-3.png" width="1203" height="471" alt="Figure 3. 모델 크기와 프롬프팅·미세조정의 관계" loading="lazy" /></a>
  <figcaption>Figure 3. 모델 크기와 프롬프팅·미세조정의 관계 — Yao et al., arXiv v3, p. 7. <a href="https://arxiv.org/pdf/2210.03629v3#page=7">원문</a> · <a href="/images/papers/yao-2022/figure-3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 Prompting(프롬프팅), 오른쪽은 Fine-tuning(미세조정)이고 가로축은 모델 크기, 세로축은 HotpotQA EM입니다. 작은 PaLM에서 ReAct 프롬프팅은 어려웠지만 3,000개 경로로 미세조정한 ReAct는 비교군 중 가장 좋았습니다. 그림 오른쪽의 540B 미세조정 결과는 없으므로 빈 영역을 측정값으로 읽지 않습니다.

저자들은 사실 자체를 암기시키는 학습보다 검색해 정보를 얻는 행동을 학습하는 것이 일반화에 도움이 된다고 해석합니다. 모델 크기만 바꾼 비교가 아니라 학습 방식과 조건도 바뀌므로, 작은 모델이 모든 큰 모델보다 낫다는 일반 법칙은 아닙니다. [§3.3](https://arxiv.org/pdf/2210.03629v3#page=6)

## 4. Decision Making Tasks

### ALFWorld

ALFWorld는 가정 환경을 텍스트 명령으로 탐색하고 물건을 옮기거나 씻는 과제입니다. 6개 유형과 보지 않은 134개 평가 게임을 사용합니다. 유형별 시범 3개에서 두 개를 순서 있게 선택해 6개 프롬프트 구성을 만듭니다. ReAct와 Act는 같은 시범을 공유하되 추론 유무를 다르게 합니다.

<figure>
  <a href="/images/papers/yao-2022/table-3.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-3.png" width="840" height="465" alt="Table 3. ALFWorld 유형별 성공률과 전체 결과" loading="lazy" /></a>
  <figcaption>Table 3. ALFWorld 유형별 성공률과 전체 결과 — Yao et al., arXiv v3, p. 8. <a href="https://arxiv.org/pdf/2210.03629v3#page=8">원문</a> · <a href="/images/papers/yao-2022/table-3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

Pick·Clean·Heat·Cool·Look·Pick 2는 서로 다른 과제 유형이고 All은 전체 성공률입니다. ReAct의 6개 구성 평균은 <strong>57%</strong>, best of 6는 <strong>71%</strong>입니다. Act best of 6는 45%, BUTLER best of 8는 37%입니다. 초록의 34%p는 <strong>71−37</strong>이며 ReAct 평균의 개선량이 아닙니다.

BUTLER는 전문가 경로로 학습한 비교군입니다. BUTLER는 beam search, 다른 방법은 greedy decoding이라는 차이도 원문 표의 주석에 남아 있습니다. 또한 ReAct가 모든 과제 열에서 최고는 아닙니다. Cool의 BUTLER 100% 같은 예외를 표에서 함께 확인할 수 있습니다. [§4](https://arxiv.org/pdf/2210.03629v3#page=7)

### WebShop

WebShop은 실제 상품 정보를 바탕으로 만든 웹 쇼핑 평가 환경입니다. 사용자가 원하는 속성·가격·옵션에 맞는 상품을 찾고 선택합니다. 500개 테스트 지시문에서 Score(평균 속성 충족 점수)와 SR(Success Rate, 모든 조건을 충족한 성공률)을 구분해 평가합니다. 논문 속 구매 동작은 벤치마크 환경의 행동입니다.

<figure>
  <a href="/images/papers/yao-2022/table-4.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-4.png" width="369" height="465" alt="Table 4. WebShop 점수와 성공률" loading="lazy" /></a>
  <figcaption>Table 4. WebShop 점수와 성공률 — Yao et al., arXiv v3, p. 8. <a href="https://arxiv.org/pdf/2210.03629v3#page=8">원문</a> · <a href="/images/papers/yao-2022/table-4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

ReAct는 Score <strong>66.6</strong>, SR <strong>40.0%</strong>이며 Act의 SR은 30.1%, IL은 29.1%, IL+RL은 28.7%입니다. IL(Imitation Learning, 모방 학습)은 1,012개 인간 시범, IL+RL(Reinforcement Learning, 강화학습 추가)은 추가 10,587개 학습 지시문을 사용한 기존 비교군입니다. ReAct는 한 개 프롬프트 시범을 사용하지만 사전학습 비용까지 없는 것은 아닙니다.

ReAct와 Act의 차이는 <strong>9.9%p</strong>, IL과의 차이는 <strong>10.9%p</strong>입니다. 전문가의 SR은 <strong>59.6%</strong>로 여전히 높습니다. 평균 점수와 완전 성공률을 같은 지표처럼 비교하지 않습니다.

### Results

저자들은 추론이 현재 조건과 상품 옵션을 연결하고 하위 목표를 추적하는 데 도움이 되었다고 설명합니다. 그러나 긴 탐색과 검색어 재작성은 여전히 어렵습니다. ALFWorld의 시범 선택 실험과 WebShop의 한 개 시범 실험은 조건이 다르므로, 하나의 범용 성공률로 묶지 않습니다.

### On the value of internal reasoning vs. external feedback

ReAct-IM은 Inner Monologue(내적 독백)와 비슷한 외부 피드백 중심의 추론 형식으로 제한한 비교입니다. Table 3에서 best of 6의 전체 성공률은 ReAct 71%, ReAct-IM 53%입니다. 목표를 되풀이하는 것 외에 <strong>무엇이 끝났고 다음에는 무엇을 해야 하는지</strong>, 물건이 어디 있을 가능성이 높은지 추론하는 역할이 중요하다는 것이 저자의 해석입니다.

이 비교는 원래 로봇 시스템 전체를 동일 환경에 재현한 실험이 아니라, 해당 논문에서 만든 IM-style 프롬프팅 제거 실험입니다. [§4](https://arxiv.org/pdf/2210.03629v3#page=8)

## 5. Related Work

<strong>Language model for reasoning(추론용 언어 모델)</strong> 계열에는 CoT, Self-Consistency(자기 일관성), 문제 분해, 중간 계산 기록, 정답 경로를 이용한 학습이 있습니다. ReAct가 강조하는 차이는 추론 중간에 외부 행동과 관찰을 연결한다는 점입니다.

<strong>Language model for decision making(의사결정용 언어 모델)</strong> 계열에는 WebGPT, 대화 중 API를 호출하는 시스템, SayCan, Inner Monologue가 있습니다. 논문도 이전 연구의 도구 사용과 폐루프 상호작용을 인정합니다. 따라서 ReAct를 모든 에이전트·도구 사용의 최초 발명이라고 소개하지 않습니다. 이 연구의 초점은 자유로운 언어 추론과 행동·관찰을 하나의 실행 경로에 결합하는 설계입니다. [§5](https://arxiv.org/pdf/2210.03629v3#page=9)

## 6. Conclusion

ReAct는 추론과 행동을 연결해 외부 정보를 활용하고 실행 기록을 검사할 수 있게 합니다. 논문이 확인한 개선은 해당 모델·프롬프트·환경의 비교 결과입니다. 더 큰 행동 공간은 더 많은 시범을 필요로 하며, 그 시범이 Context length(문맥 길이) 제한을 넘을 수 있다는 한계가 남습니다.

저자들은 더 많은 고품질 인간 시범, 여러 과제의 학습, 강화학습과의 결합을 후속 방향으로 제시합니다. 이는 이 논문에서 모두 완료한 결과가 아닙니다. 사람이 중간 추론을 수정하는 가능성도 제시하지만, 지속적인 Alignment(정렬)이나 일반적인 작업 신뢰성을 해결했다는 결론은 아닙니다. [§6](https://arxiv.org/pdf/2210.03629v3#page=9)

## A. Additional Results

### A.1. GPT-3 Experiments

<figure>
  <a href="/images/papers/yao-2022/table-5.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-5.png" width="1212" height="291" alt="Table 5. PaLM-540B와 GPT-3의 추가 비교" loading="lazy" /></a>
  <figcaption>Table 5. PaLM-540B와 GPT-3의 추가 비교 — Yao et al., arXiv v3, p. 14. <a href="https://arxiv.org/pdf/2210.03629v3#page=14">원문</a> · <a href="/images/papers/yao-2022/table-5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

GPT-3는 당시의 <strong>text-davinci-002</strong>이며 greedy decoding을 사용합니다. HotpotQA는 검증 질문 중 500개 부분집합, ALFWorld는 134개 게임과 PaLM에서 고른 최선 프롬프트 구성을 사용합니다. HotpotQA는 PaLM 29.4, GPT-3 30.8이며, ALFWorld는 70.9%, 78.4%입니다. <strong>여기서 PaLM의 29.4는 Table 1의 CoT 29.4와 다른 조건의 ReAct 결과</strong>입니다.

저자들은 지시 따르기 학습이 차이를 설명할 수 있다고 추측하지만, 그 요인을 단독으로 분리한 실험은 아닙니다. [§A.1](https://arxiv.org/pdf/2210.03629v3#page=14)

### A.2. ReAct obtains up-to-date knowledge on HotpotQA

<figure>
  <a href="/images/papers/yao-2022/figure-4.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/figure-4.png" width="1212" height="924" alt="Figure 4. 오래된 정답 라벨과 검색 시점의 정보" loading="lazy" /></a>
  <figcaption>Figure 4. 오래된 정답 라벨과 검색 시점의 정보 — Yao et al., arXiv v3, p. 14. <a href="https://arxiv.org/pdf/2210.03629v3#page=14">원문</a> · <a href="/images/papers/yao-2022/figure-4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

네 패널은 직접 응답·CoT·Act·ReAct를 비교합니다. 특정 질문의 정답 라벨이 오래된 상태에서 ReAct는 검색으로 당시의 정보를 얻습니다. 초록색은 검색에서 찾은 근거, 빨간색은 잘못된 결과나 전제입니다. 이 그림은 데이터셋 라벨과 검색 시점의 정보가 달라질 수 있음을 보여주는 사례입니다. 모든 최신 정보를 안정적으로 찾는다는 실험은 아니며, 그림의 인물·직책 정보를 현재 사실로 재사용해서도 안 됩니다. [§A.2](https://arxiv.org/pdf/2210.03629v3#page=14)

### A.3. Human-in-the-loop behavior correction on ALFWorld

<figure>
  <a href="/images/papers/yao-2022/figure-5.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/figure-5.png" width="1212" height="651" alt="Figure 5. 사람이 중간 추론 두 곳을 수정한 사례" loading="lazy" /></a>
  <figcaption>Figure 5. 사람이 중간 추론 두 곳을 수정한 사례 — Yao et al., arXiv v3, p. 15. <a href="https://arxiv.org/pdf/2210.03629v3#page=15">원문</a> · <a href="/images/papers/yao-2022/figure-5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽 (a)은 잘못된 추론 이후 실패한 경로, 오른쪽 (b)은 사람이 Act 17과 Act 23의 추론을 수정한 뒤 성공한 경로입니다. 수정한 상태 판단이 이후 행동에 영향을 줍니다. 파란 부분은 추론, 빨간 부분은 오류, 초록 부분은 수정 후 유효한 결과를 짚어 줍니다.

이 사례의 <strong>Human-in-the-loop(사람이 개입하는 실행)</strong>는 모델 파라미터를 바꾸는 학습과 다릅니다. 현재 기록을 편집해 이후 생성을 유도합니다. 원문도 더 체계적인 Alignment(정렬) 연구를 후속 과제로 남깁니다. 두 번의 편집이 모든 작업에서 충분하다는 뜻은 아닙니다. [§A.3](https://arxiv.org/pdf/2210.03629v3#page=15)

## B. Experiment Details

### B.1. HotpotQA Finetuning Details

모든 미세조정은 batch size 64입니다. PaLM-8B에서는 ReAct·Act가 4,000단계, Standard·CoT가 2,000단계입니다. PaLM-62B에서는 ReAct·Act가 4,000단계, Standard·CoT가 1,000단계입니다. 따라서 Figure 3을 <strong>같은 학습 단계 수로 통제한 순수 형식 비교</strong>로 읽지 않습니다. 저자들은 행동을 포함한 방법은 더 긴 학습에서 이득을 얻지만 다른 방법은 일찍 성능이 떨어졌다고 보고합니다.

### B.2. ALFWorld IM-style Details

같은 전문가 경로를 외부 피드백 중심으로 다시 주석 처리합니다. 현재 목표·현재 하위 목표를 반복하는 쪽으로 제한하고, 완료 시점 판단·다음 목표 선택·물건 위치에 관한 사전지식 활용을 제한합니다. 추론이 있다는 사실만으로 충분한지, <strong>어떤 내용의 추론인가</strong>를 구별하는 비교입니다. [§B](https://arxiv.org/pdf/2210.03629v3#page=15)

## C. Prompts

이 절은 모델에 준 시범이고, 다음 부록 D는 평가 때 생성된 실행입니다. 시범을 실제 평가 성공 사례로 오인하지 않도록 구분합니다.

### C.1. HotpotQA

원문 pp.16–19는 여섯 질문에 대한 Standard·Act·CoT·ReAct 형식을 나란히 제공합니다. 같은 질문을 사용하며 정보의 연결 방식이 달라집니다. 예를 들어 지리 질문에서는 지역을 검색하고, 관련 문구를 조회한 뒤, 동명의 지역 중 올바른 대상을 골라 고도 범위를 찾습니다. ReAct의 추론은 <strong>다음 검색이 왜 필요한지</strong>와 <strong>현재 결과가 왜 부족한지</strong>를 연결합니다. 모든 시범을 번역해 재수록하는 대신 원문 전체를 연결합니다. [§C.1 전체 시범](https://arxiv.org/pdf/2210.03629v3#page=16)

### C.2. FEVER

세 시범은 지지·반박·정보 부족을 각각 보여줍니다. 배우의 방송사 활동, 드라마의 배경 도시, 노래의 차트 순위·연도처럼 주장의 일부 조건을 실제 근거와 비교합니다. 순위가 확인되어도 연도가 확인되지 않으면 전체 주장을 지지할 근거가 부족할 수 있습니다. 이는 검색 결과의 일부가 일치한다는 이유로 주장을 통째로 승인하지 않도록 하는 시범입니다. [§C.2](https://arxiv.org/pdf/2210.03629v3#page=20)

### C.3. WebShop

<figure>
  <a href="/images/papers/yao-2022/table-6.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-6.png" width="1215" height="1611" alt="Table 6. WebShop의 Act와 ReAct 시범 프롬프트" loading="lazy" /></a>
  <figcaption>Table 6. WebShop의 Act와 ReAct 시범 프롬프트 — Yao et al., arXiv v3, p. 22. <a href="https://arxiv.org/pdf/2210.03629v3#page=22">원문</a> · <a href="/images/papers/yao-2022/table-6.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽 Act와 오른쪽 ReAct는 같은 상품 탐색을 보여줍니다. ReAct에는 요구 조건과 상품 옵션을 대조하는 추론이 추가됩니다. 검색 결과에서 상품을 클릭한 뒤 향·용량 같은 옵션을 선택하고 구매하는 흐름을 읽습니다. 색은 Action·Observation·추론 등 기록의 역할을 구분합니다. <strong>상품 제목만 보고 끝내지 않고 상세 옵션을 확인한다</strong>는 것이 이 시범의 핵심입니다. [§C.3](https://arxiv.org/pdf/2210.03629v3#page=22)

### C.4. ALFWorld

<figure>
  <a href="/images/papers/yao-2022/table-7.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-7.png" width="1215" height="837" alt="Table 7. ALFWorld Act 시범의 원문" loading="lazy" /></a>
  <figcaption>Table 7. ALFWorld Act 시범의 원문 — Yao et al., arXiv v3, p. 23. <a href="https://arxiv.org/pdf/2210.03629v3#page=23">원문</a> · <a href="/images/papers/yao-2022/table-7.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

원문 캡션은 추론을 제공하지 않는 Act 시범이라고 설명합니다. 다만 표 본문에는 세척 이후 `think:` 문장이 한 줄 남아 있습니다. <strong>캡션과 실제 표 내용의 불일치를 그대로 보존</strong>합니다. 이를 근거로 전체 Act 실험에 추론이 들어갔다고 단정할 수도 없고, 표를 임의로 고쳐 완전히 추론이 없는 시범이라고 보여줄 수도 없습니다.

<figure>
  <a href="/images/papers/yao-2022/table-8.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-8.png" width="1215" height="1128" alt="Table 8. ALFWorld ReAct 시범" loading="lazy" /></a>
  <figcaption>Table 8. ALFWorld ReAct 시범 — Yao et al., arXiv v3, p. 24. <a href="https://arxiv.org/pdf/2210.03629v3#page=24">원문</a> · <a href="/images/papers/yao-2022/table-8.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

물건을 찾고, 집고, 세척하고, 옮기는 하위 목표의 전환을 추론이 설명합니다. 이동할 장소의 후보를 정하는 상식과, 작업을 끝낸 뒤 다음 단계로 넘어가는 상태 판단을 함께 보여줍니다.

<figure>
  <a href="/images/papers/yao-2022/table-9.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-9.png" width="1215" height="1248" alt="Table 9. ALFWorld ReAct-IM 시범" loading="lazy" /></a>
  <figcaption>Table 9. ALFWorld ReAct-IM 시범 — Yao et al., arXiv v3, p. 25. <a href="https://arxiv.org/pdf/2210.03629v3#page=25">원문</a> · <a href="/images/papers/yao-2022/table-9.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

현재 수행할 목표를 반복하는 형태와 Table 8의 계획·완료 판단을 비교합니다. 문장 수가 많다는 사실보다 그 문장이 무엇을 갱신하는지가 중요합니다. 세 표는 학습 시범이며, 성공률 비교는 Table 3에서 확인합니다. [§C.4](https://arxiv.org/pdf/2210.03629v3#page=23)

## D. Trajectories

### D.1. FEVER Trajectories

원문 pp.26–27은 무작위로 선택한 주장에 대한 세 방법의 실행을 보여줍니다. 영화의 제작 연도가 틀린 주장에서는 검색한 연도와 주장의 연도를 비교하는 것이 중요합니다. 우주 프로그램 사례에서는 ReAct도 유용한 근거를 찾지 못해 정답과 다른 정보 부족 판정을 냅니다. 도구를 호출했다는 사실과 올바른 근거를 얻었다는 사실은 다릅니다.

원문도 공간을 줄이려고 검색 내용을 생략한 부분이 있으므로, 표시된 짧은 Observation만으로 전체 검색 내용을 복원하지 않습니다. [§D.1](https://arxiv.org/pdf/2210.03629v3#page=26)

### D.2. ALFWorld Trajectories

같은 “칼을 씻어 조리대에 놓기” 게임을 세 방법으로 비교합니다.

#### D.2.1. ReAct trajectory

칼을 찾고 집은 뒤 싱크대로 이동하고, 세척한 후 조리대로 돌아갑니다. 각 추론이 완료한 일과 다음 하위 목표를 구분합니다. 원문의 이 실행에서는 전체 과제를 성공합니다. [실행 기록](https://arxiv.org/pdf/2210.03629v3#page=28)

#### D.2.2. Act trajectory

칼은 찾지만 싱크대로 이동하기 전에 세척 명령을 실행합니다. 환경이 아무 변화가 없다고 응답해도 행동을 고치지 못하고 같은 명령을 반복합니다. 이 사례는 도구 호출 능력만으로 오류 복구가 보장되지 않음을 보여줍니다. [실행 기록](https://arxiv.org/pdf/2210.03629v3#page=29)

#### D.2.3. ReAct-IM trajectory

칼을 찾았지만 세척하지 않고 조리대에 놓습니다. 원문은 “깨끗한 칼을 찾아야 한다”는 목표 문장이 이미 칼이 깨끗하다는 판단으로 이어졌을 가능성을 지적합니다. 이는 저자의 오류 해석이며 모델 내부 상태를 직접 측정한 결과는 아닙니다. [실행 기록](https://arxiv.org/pdf/2210.03629v3#page=30)

### D.3. WebShop Trajectories

<figure>
  <a href="/images/papers/yao-2022/table-10-a.png" target="_blank" rel="noopener"><img src="/images/papers/yao-2022/table-10-a.png" width="1275" height="1698" alt="Table 10. 상품 요구 조건과 옵션을 비교하는 실행" loading="lazy" /></a>
  <figcaption>Table 10. 상품 요구 조건과 옵션을 비교하는 실행 — Yao et al., arXiv v3, p. 31. <a href="https://arxiv.org/pdf/2210.03629v3#page=31">원문</a> · <a href="/images/papers/yao-2022/table-10-a.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽 Act는 요구 조건과 맞지 않는 상품을 구매하고, 오른쪽 ReAct는 맛·포장 수 옵션을 확인한 뒤 선택합니다. 원문 사례의 점수는 <strong>0.125 대 1.0</strong>입니다. 이는 단일 실행의 보상이며, Table 4의 평균 점수 66.6이나 전체 성공률 40%와 다른 값입니다. <strong>조건을 하나씩 대조하는 추론이 행동 선택에 어떻게 연결되는지</strong>를 읽기 위한 사례입니다. [§D.3](https://arxiv.org/pdf/2210.03629v3#page=31)

## E. More Analysis

### E.1. Success and Failure Modes Analysis

부록은 Table 2의 여섯 유형을 구체적인 사례로 설명합니다. True positive(근거까지 올바른 정답), False positive(잘못된 추론을 거친 정답), Reasoning error(추론 오류), Search error(검색 오류), Hallucination(환각), Label ambiguity(정답 라벨 모호성)입니다.

보드게임 출시 순서를 묻는데 동명의 장소와 영화에 관한 정보를 사용해 우연히 정답을 내는 사례는 <strong>최종 정답과 근거 정확성이 별개</strong>임을 보여줍니다. 다른 사례는 출생연도의 대소 비교를 반대로 해석하거나, 필요한 문서를 찾지 못하거나, 짧은 답과 긴 정답 라벨이 달라 EM에서 실패합니다.

일부 검색 결과와 중간 단계는 원문에서도 생략했습니다. 따라서 이 예시는 오류의 종류를 이해하는 자료이며, 모든 실행을 완전히 재현할 수 있는 로그나 실패 유형의 추가 통계는 아닙니다. Table 2의 수작업 표본과 함께 읽어야 합니다. [§E.1](https://arxiv.org/pdf/2210.03629v3#page=32)
