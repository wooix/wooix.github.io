---
title: 'FInject 관련 읽기: 답을 계산하기 전에 확인할 것'
description: 'FInject의 공개 문제의식을 출발점으로 Faithful CoT(충실한 사고 연쇄)와 GSM-Symbolic을 읽으며, 근거·답변 가능성·견고성을 구분합니다.'
publishedAt: 2026-09-13
topic: finject
category: reliability
tags: ['FInject', 'Financial Reasoning', 'Unanswerability', 'Faithfulness', 'Robustness']
kind: research-note
readingTime: 5
featured: false
sourceLinks:
  - title: 'FInject — 공개 논문·데이터 저장소'
    url: 'https://github.com/pnu-clink/finject'
    kind: '연구 저장소'
  - title: 'FInject — 공개 데이터셋'
    url: 'https://huggingface.co/datasets/pnu-clink/finject'
    kind: '데이터'
  - title: 'Lyu et al. — Faithful Chain-of-Thought Reasoning (2023)'
    url: 'https://arxiv.org/abs/2301.13379'
    kind: '논문'
  - title: 'Mirzadeh et al. — GSM-Symbolic (2024)'
    url: 'https://arxiv.org/abs/2410.05229'
    kind: '논문'
takeaway: '계산이 맞는지, 그 계산이 근거에 맞는지, 주어진 정보로 답을 하나로 정할 수 있는지는 서로 다른 질문입니다. FInject와 관련 문헌을 이 세 관점으로 읽습니다.'
---

영수증 몇 장으로 한 달 지출을 계산한다고 생각해 봅시다. 덧셈이 정확해도 영수증이 빠졌거나 같은 결제의 금액이 서로 다르면, 합계를 하나로 정해도 되는지 먼저 확인해야 합니다. <strong>Numerical Reasoning(수치 추론)</strong>에서도 계산에 앞서 주어진 정보가 답을 뒷받침하는지 묻는 과정이 필요합니다.

이 읽기 가이드는 FInject의 공개 문제의식을 출발점으로 삼아, <strong>Faithfulness(충실성)</strong>와 <strong>Robustness(견고성)</strong>를 다루는 두 관련 논문을 비교합니다.

## FInject: 주어진 정보로 답을 정할 수 있는가

공개 저장소의 연구명은 <strong>FInject: Expanding Finance Reasoning Problems through Injection of Unanswerability</strong>입니다. 금융 추론 문맥에서 정보가 답을 하나로 뒷받침하지 못하는 경우를 다룹니다. 공개 설명에는 정보의 부재와 충돌에 해당하는 변형이 포함됩니다. [FInject 공개 저장소](https://github.com/pnu-clink/finject)

> <strong>자료 상태</strong> · 2026년 9월 13일에 확인한 공개 Manuscript(논문 원고)와 Dataset(데이터셋)을 기준으로 정리했습니다. [FInject 공개 자료](https://github.com/pnu-clink/finject)

여기서 <strong>Unanswerability(답변 불가능성)</strong>는 어려워서 아직 계산하지 못한 상태와 구별해서 읽어야 합니다. 이 글에서는 제공된 문맥만으로 답을 유일하게 정할 수 있는지를 먼저 보는 관점으로 사용합니다.

관련 문헌을 찾아갈 때도 세 질문을 분리해 보겠습니다. 계산 과정이 유효한가, 계산에 넣은 정보가 문서의 근거와 맞는가, 그 근거가 하나의 답을 결정하기에 충분한가. 하나의 정답률만으로는 어느 지점에서 문제가 생겼는지 설명하기 어렵습니다.

## Faithful CoT (2023): 풀이와 답은 실제로 연결되는가

<strong>Faithful Chain-of-Thought Reasoning</strong>은 2023년 1월 31일 처음 공개되었습니다. 이 글은 2023년 9월 20일의 v3를 읽기 기준으로 사용합니다. 언어 모델이 자연어 문제를 기호적 추론 과정으로 옮기고, <strong>Deterministic Solver(결정적 풀이기)</strong>가 그 과정을 실행해 답을 얻는 두 단계를 제안합니다. [Faithful CoT 원문, §3](https://arxiv.org/html/2301.13379v3#S3)

이 구조에서는 최종 답이 실행한 추론 과정에서 나오도록 연결됩니다. 하지만 <strong>Faithfulness(충실성)</strong>가 곧 <strong>Correctness(정확성)</strong>는 아닙니다. 처음 만든 기호 표현이 질문을 잘못 해석했다면 실행 결과도 잘못될 수 있습니다. 논문 역시 추론 과정을 만들어 내는 번역 단계 자체의 해석 가능성까지 보장하지는 않는다고 구분합니다. [Faithful CoT 원문, §1](https://arxiv.org/html/2301.13379v3#S1)

FInject의 문제의식과 나란히 읽으며 떠올릴 질문은 “실행 가능한 계산식을 만들었다는 사실만으로, 계산에 필요한 근거가 충분하다고 볼 수 있는가”입니다. 영수증의 수치를 정확히 더한 일과 영수증이 모두 모였는지 확인한 일은 별개입니다.

## GSM-Symbolic (2024): 조건이 바뀌어도 견고한가

<strong>GSM-Symbolic</strong>은 2024년 10월 7일 처음 공개되었으며, 이 글은 2025년 8월 27일의 v2를 확인했습니다. 연구팀은 기호 템플릿으로 수학 문제의 변형을 만들고, 숫자 변경이나 추가 조건 등에 대한 성능 변화를 분석합니다. 특히 답에 필요하지 않은 정보가 더해졌을 때의 취약성을 검토합니다. [GSM-Symbolic 원문](https://arxiv.org/html/2410.05229v2)

이 결과를 읽을 때는 <strong>Robustness(견고성)</strong>에 관한 관찰과 “언어 모델은 추론을 하지 못한다”는 넓은 해석을 구분할 필요가 있습니다. 특정 모델과 문제 변형에서 관찰된 성능 변화는 연구의 근거이지만, 모든 모델의 내부 계산 방식을 하나로 판정하는 증거로 확대하지 않습니다.

또한 무관한 정보가 더해져도 답은 여전히 정해져 있는 경우와, 필요한 정보가 없어 답을 정할 수 없는 경우는 다릅니다. 두 경우를 같은 실패로 묶지 않는 것이 FInject와 함께 읽으며 얻을 수 있는 비교 관점입니다.

## Reading Map: 세 질문을 한 표에 남기기

아래 비교 메모로 세 자료의 중심 질문을 함께 읽어 봅시다.

| 읽을 자료 | 중심에 둘 질문 | 함께 구분할 항목 |
| --- | --- | --- |
| FInject | 근거가 답을 하나로 결정하는가? | Unanswerability(답변 불가능성)와 계산 실패 |
| Faithful CoT | 최종 답이 실행한 풀이에서 나오는가? | Faithfulness(충실성)와 Correctness(정확성) |
| GSM-Symbolic | 문제의 변형에도 결과가 유지되는가? | 무관한 정보와 부족한 정보 |

세 자료를 읽고 난 뒤에는 같은 예시를 각각의 질문으로 다시 살펴볼 수 있습니다. 한 번의 오답이 계산 오류인지, 근거 선택 오류인지, 답변 가능성 판단의 오류인지 설명해 보는 연습입니다.

## Vocabulary: 후속 문헌 검색을 위한 단어

| 영어 용어 | 한글 보조 설명 |
| --- | --- |
| Financial Numerical Reasoning | 금융 수치 추론 |
| Unanswerability | 답변 불가능성 |
| Evidence Grounding | 근거 연결·검증 |
| Faithfulness | 충실성, 설명과 실제 답 생성 과정의 연결 |
| Robustness | 견고성, 입력 조건이 바뀔 때의 일관성 |
| Deterministic Solver | 결정적 풀이기, 정해진 규칙으로 추론 표현을 실행하는 도구 |

다음 관련 문헌에서는 <strong>답변 가능성</strong>, <strong>근거의 적합성</strong>, <strong>계산의 유효성</strong>을 각각 무엇으로 평가하는지 먼저 찾아보겠습니다. 이 구분이 새로운 논문을 FInject의 공개 문제의식과 비교할 때 사용할 출발점입니다.
