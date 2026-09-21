---
title: 'CAA (2023): 모델 안의 방향을 더해 응답을 조절하기'
description: 'Contrastive Activation Addition(대조 활성값 덧셈)을 통해 Steering(행동 조절)의 원리와 한계, 재현 실험에서 확인할 조건을 살펴봅니다.'
publishedAt: 2026-09-13
topic: steering
category: steering
tags: ['CAA', 'Activation Steering', 'Representation Engineering', 'Llama 2']
kind: milestone
readingTime: 6
featured: true
sourceLinks:
  - title: 'Panickssery et al. — Steering Llama 2 via Contrastive Activation Addition'
    url: 'https://arxiv.org/abs/2312.06681'
    kind: '논문'
  - title: 'CAA 원문 v4 — 방법과 한계'
    url: 'https://arxiv.org/html/2312.06681v4'
    kind: '원문'
takeaway: 'CAA는 대조 예시에서 얻은 활성값 차이의 평균을 추론 중에 더해 응답 행동을 바꿉니다. 바뀐 응답은 관찰 가능한 효과이며, 모델의 의지나 신념을 직접 측정한 것은 아닙니다.'
---

음악을 들으며 Equalizer(이퀄라이저)를 조금 조절하면 같은 곡의 저음이나 고음이 두드러집니다. 녹음 파일을 다시 만들지 않아도 듣는 동안 변화를 줄 수 있습니다. 언어 모델의 <strong>Steering(행동 조절)</strong>을 이해할 때도 이런 조절 손잡이를 떠올려 볼 수 있습니다.

<strong>CAA(Contrastive Activation Addition, 대조 활성값 덧셈)</strong>는 특정 행동과 관련된 <strong>Activation(활성값)</strong> 차이를 구한 뒤, 추론 중 모델 내부에 더합니다. 모델 가중치를 다시 학습하지 않고 응답 경향을 움직이는 방법입니다. [CAA 원문, §3](https://arxiv.org/html/2312.06681v4#S3)

> <strong>읽기 기준</strong> · 최초 공개는 <strong>2023년 12월 9일</strong>이며, 이 글은 2024년 7월 5일의 v4를 확인했습니다. Steering(행동 조절)의 기초를 다루는 노트입니다. [논문 이력](https://arxiv.org/abs/2312.06681)

## Activation: 조절하는 대상은 무엇인가

음악의 저음을 조절한다고 곡을 만든 사람의 생각을 바꾼 것은 아닙니다. 마찬가지로 이 글에서 “행동을 조절한다”는 표현은 <strong>출력되는 답변의 분포와 경향을 바꾼다</strong>는 뜻입니다. 모델의 의지나 신념을 직접 찾아냈다고 해석하지 않습니다.

<strong>Activation(활성값)</strong>은 입력을 처리하는 동안 모델 내부에서 계산되는 값입니다. CAA(대조 활성값 덧셈)는 그중 <strong>Residual Stream(잔차 스트림)</strong>에 개입합니다. 직관적으로는 층을 지나며 정보가 합쳐지고 전달되는 통로를 떠올리면 됩니다. 이는 이해를 돕는 비유이고, 특정 행동만 완전히 분리된 전용 통로가 있다는 뜻은 아닙니다. [CAA 원문, §3](https://arxiv.org/html/2312.06681v4#S3)

## Contrastive Pair: 행동의 차이로 방향 만들기

원 논문은 같은 객관식 질문 뒤에 서로 다른 답변 문자를 붙인 <strong>Contrastive Pair(대조 쌍)</strong>를 만듭니다. 한쪽은 목표 행동을, 다른 쪽은 그 반대 행동을 나타냅니다. 선택한 층의 답변 문자 위치에서 활성값 차이를 구하고, 여러 쌍의 차이를 평균 내 <strong>Steering Vector(조절 벡터)</strong>를 얻습니다. [CAA 원문, §3](https://arxiv.org/html/2312.06681v4#S3)

이 절차를 다음 네 단계로 읽을 수 있습니다.

1. 같은 질문에 목표 행동과 반대 행동을 나타내는 답을 각각 붙입니다.
2. 동일한 층과 위치에서 <strong>Activation(활성값)</strong>을 꺼냅니다.
3. 각 쌍의 활성값 차이를 계산합니다.
4. 차이들을 평균 내 하나의 <strong>Steering Vector(조절 벡터)</strong>로 보관합니다.

한 곡의 특정 순간만 듣고 저음을 정하기보다 여러 구간을 함께 듣는 비유를 떠올려 봅시다. 다만 평균을 냈다는 이유만으로 모든 잡음이 사라졌다고 가정할 수는 없습니다. 대조 쌍이 어떤 표현과 질문을 포함하는지 직접 읽어 볼 필요가 있습니다.

## Intervention: 방향과 세기를 나누어 생각하기

추론할 때는 사용자 지시문 이후의 토큰 위치들에서 선택한 층의 잔차 스트림에 조절 벡터를 계수와 곱해 더합니다. 계수의 부호는 방향을, 크기는 개입의 세기를 정합니다. 원 논문의 주된 평가는 Llama 2 7B Chat과 13B Chat에서 이루어졌습니다. [CAA 원문, §3](https://arxiv.org/html/2312.06681v4#S3)

이때 실험 노트에 세 가지를 따로 적어 보면 좋습니다.

| 기록할 조건 | 확인하려는 질문 |
| --- | --- |
| Layer(층)와 Token Position(토큰 위치) | 모델 내부의 어디에 개입했는가? |
| Vector(벡터)의 생성 자료와 정규화 방식 | 어떤 차이를 방향으로 정의했는가? |
| Coefficient(계수)의 부호와 크기 | 얼마나 강하게 조절했는가? |

“계수 1을 썼다”는 정보만으로는 다른 실험과 같은 강도인지 알기 어렵습니다. 자가 실험에서는 같은 입력에 개입을 끈 조건, 양의 계수, 음의 계수를 나란히 두는 비교부터 시작할 수 있습니다. 이 표와 비교 방식은 이 글의 재현 제안입니다.

## Evidence: 답변이 달라졌다는 결과를 읽는 법

논문은 Sycophancy(사용자에게 맞장구치는 성향), Refusal(응답 거절) 등을 포함한 일곱 행동을 평가했습니다. 자유 생성 답변 평가에는 GPT-4를 사용했으며, 논문은 평가 프롬프트 민감도와 모델 평가자의 편향을 한계로 밝힙니다. 또한 층과 계수의 선택 및 비교 기법의 설정에도 결과가 영향을 받을 수 있습니다. [CAA 원문, §4·§10](https://arxiv.org/html/2312.06681v4#S10)

여기서 후속 연구를 위해 던질 질문은 “변화가 보였는가” 다음에 있습니다. 예를 들어 반대 의견을 더 자주 말하도록 조절했을 때, 틀린 주장에만 반대하는지 아니면 맞는 말에도 무조건 반대하는지 살펴봐야 합니다. 이 두 응답 경향은 겉보기에는 모두 맞장구가 줄어든 것처럼 보일 수 있습니다.

이 구분은 연구 보조 도구에서도 유용합니다. 논문을 비판적으로 검토하는 모델을 원한다면, 비판하는 문장 수보다 실제 근거를 찾아 지적했는지를 보고 싶습니다.

## Research Questions: 무엇을 함께 측정할까

아래 항목은 새 실험을 위한 제안이며, 이 글에서 검증한 결과는 아닙니다.

- <strong>Generalization(일반화)</strong>: 벡터를 만들지 않은 주제와 한국어 질문에서도 같은 방향의 변화가 나타나는가?
- <strong>Specificity(특이성)</strong>: 원하는 행동만 바뀌는가, 말투·답변 길이·정확도도 함께 달라지는가?
- <strong>Robustness(견고성)</strong>: 질문 표현과 보기 순서를 바꿔도 효과가 남는가?
- <strong>Compatibility(호환성)</strong>: 모델 버전이나 Quantization(양자화) 설정을 바꾼 뒤에도 벡터를 그대로 써도 되는가?

하나의 평균 점수와 함께 실제 출력 쌍을 남겨 두면, 조절한 행동이 무엇인지 다시 확인하기 쉽습니다. 음악의 손잡이를 끝까지 돌리기보다, 원하는 소리가 살아나면서 다른 소리가 무너지지 않는 구간을 찾는 접근입니다.

## Vocabulary: 방향을 설명하는 단어

| 영어 용어 | 한글 보조 설명 |
| --- | --- |
| Steering | 행동 조절 |
| Activation | 활성값, 입력을 처리하며 계산되는 내부 값 |
| Residual Stream | 잔차 스트림, 층 사이에서 정보가 합쳐져 전달되는 통로 |
| Contrastive Pair | 대조 쌍, 목표 행동과 반대 행동을 비교하는 예시 쌍 |
| Intervention | 개입, 계산 과정에 직접 변화를 주는 조작 |
| Sycophancy | 사용자에게 과도하게 동조하거나 맞장구치는 성향 |

Steering(행동 조절) 논문을 읽을 때는 <strong>어떤 벡터를, 어디에, 얼마나 더했고, 무엇이 달라졌는가</strong>를 한 줄씩 적어 봅시다. 이 네 가지가 기법의 이름보다 더 구체적인 비교 기준이 됩니다.
