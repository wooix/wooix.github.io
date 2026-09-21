---
title: 'Generative Adversarial Nets — 절별 해설'
description: '생성과 판별의 경쟁으로 데이터 분포를 학습하는 원리와 이론의 가정을 읽는다.'
publishedAt: 2026-09-14
topic: synthetic-data-study
category: generative-models
tags: ['합성데이터스터디', '1강', '논문 해설']
kind: research-review
readingTime: 12
featured: false
draft: false
parentPost: synthetic-data-study/01-foundations
navLabel: 'Goodfellow et al. (2014)'
sourceLinks:
  - title: 'arXiv v1, 2014-06-10'
    url: 'https://arxiv.org/pdf/1406.2661v1'
    kind: 원문
takeaway: '판별기의 피드백은 생성기의 학습 신호가 된다. 분포 일치에 관한 이론은 충분한 용량과 이상적인 최적화 조건을 전제로 한다.'
---

[1강으로 돌아가기](/notes/synthetic-data-study/01-foundations/)

검토 원문: [arXiv v1, 2014-06-10](https://arxiv.org/pdf/1406.2661v1). 초록과 아래 본문 전체를 확인했으며 참고문헌 목록은 요약에서 제외했다.

## 초록

Generative Adversarial Nets(생성적 적대 신경망)는 데이터처럼 보이는 표본을 만드는 Generator(생성기)와 실제·생성 표본을 구분하는 Discriminator(판별기)를 함께 학습한다. 저자는 두 모델의 경쟁으로 데이터 분포를 복원할 수 있음을 이론적으로 보이고 이미지 실험으로 가능성을 확인한다. 이 논문은 생성 데이터로 다른 모델을 학습했을 때의 성능을 평가하는 연구가 아니라, 생성 모델 자체를 학습하는 방법을 제안한다.

## 1 서론

기존 생성 모델은 계산하기 어려운 확률 추정과 추론 때문에 학습이 복잡했다. 저자는 위조범과 경찰의 경쟁에 비유해, 별도의 판별 문제를 풀게 함으로써 생성에 필요한 피드백을 얻는 접근을 제안한다. 본 논문의 구현은 두 모델을 Multilayer Perceptron(다층 퍼셉트론)으로 두며, 생성 시에는 무작위 입력을 순방향 계산에 통과시킨다.

## 2 관련 연구

저자는 확률 정규화에 어려움이 있는 Boltzmann 계열, 고정된 잡음과 데이터를 구별하는 Noise-Contrastive Estimation(잡음 대조 추정), Markov Chain(마르코프 연쇄)을 통해 표본을 만드는 방법을 비교한다. 이 비교의 목적은 판별을 이용한다는 공통점만으로 방법들을 동일시하지 않는 것이다. 제안 방법에서는 학습 가능한 별도 Discriminator가 존재하고 Generator도 변하며, 생성 과정에 Markov Chain이 필요하지 않다.

## 3 적대 신경망

무작위 변수 z를 Generator G에 넣어 G(z)를 얻는다. Discriminator D(x)는 x가 실제 데이터에서 왔을 확률을 출력한다. 식 1은 다음 목적을 정의한다.

$$
\min_G\max_D V(D,G)
=\mathbb{E}_{x\sim p_{\mathrm{data}}}[\log D(x)]
+\mathbb{E}_{z\sim p_z}[\log(1-D(G(z)))]
$$

첫 항은 실제 표본의 로그 판정 확률을, 둘째 항은 생성 표본을 가짜로 판정하는 로그 확률을 평균한다. D는 이를 최대화해 양쪽을 올바르게 구별하고 G는 최소화해 생성 표본이 실제처럼 판정되도록 한다. 두 모델의 목표가 반대이므로 이를 Minimax Game(최소최대 게임)으로 표현한다.

실제로는 D를 완전히 학습한 뒤 G를 바꾸는 대신 두 모델을 번갈아 조금씩 갱신한다. 초기 G가 너무 약하면 원래 목적에서 유용한 Gradient(기울기)가 작아질 수 있어, G가 $\log D(G(z))$를 최대화하는 대안을 사용한다. 저자는 이것이 같은 고정점을 가지면서 초기 학습 신호를 강화한다고 설명한다. [원문 §3](https://arxiv.org/pdf/1406.2661v1)

<figure class="paper-figure" id="figure-1"><a href="/images/papers/goodfellow-2014/figure-1.png" target="_blank" rel="noopener"><img width="872" height="286" src="/images/papers/goodfellow-2014/figure-1.png" alt="Generator와 Discriminator를 번갈아 갱신하는 네 단계" loading="lazy" /></a><figcaption>Figure 1. Generator와 Discriminator를 번갈아 갱신하는 네 단계. <a href="https://arxiv.org/pdf/1406.2661v1">원문</a></figcaption></figure>

검은 점선은 실제 분포, 초록 실선은 생성 분포, 파란 점선은 판별 확률이다. 아래 z의 균일한 입력이 위 x의 분포로 변환되는 모습을 화살표가 연결한다. (a)에서 (b)는 D를 개선하고, (c)는 G를 갱신하며, (d)는 충분한 표현 능력 아래 분포가 일치한 이상적인 상태다. 실제 신경망의 수렴을 보장하는 실험 그림은 아니다.


## 4 이론적 결과

이 절은 알고리즘의 목표가 왜 데이터 분포 일치와 연결되는지 설명한다. 분석 대상은 무한한 표현 능력을 허용하는 분포의 공간이며, 유한 신경망을 실제로 최적화하는 상황과 구분해야 한다.

### 4.1 생성 분포와 데이터 분포가 같을 때의 전역 최적성

G를 고정하면 최적 D는 $\frac{p_{\mathrm{data}}(x)}{p_{\mathrm{data}}(x)+p_g(x)}$이다. 어떤 위치에 실제 데이터가 생성 데이터보다 많이 나타나는지에 따라 판별 확률이 달라진다는 뜻이다. 이를 원래 목적에 넣으면 $-\log 4 + 2\,\mathrm{JSD}(p_{\mathrm{data}}\Vert p_g)$이다. 여기서 JSD는 Jensen–Shannon Divergence(젠슨–섀넌 발산)를 뜻한다. 이 Divergence는 두 분포가 같을 때만 0이므로, 이상적인 목적의 최솟값은 분포 일치에서 얻어진다. 이때 D는 두 출처를 구별하지 못해 확률 1/2을 출력한다.

### 4.2 알고리즘 1의 수렴

수렴 명제는 G와 D의 충분한 용량, 각 단계에서 최적인 D, 생성 분포에 대한 충분히 작은 갱신을 가정한다. 분포 공간에서는 목적의 성질을 이용해 데이터 분포로 수렴함을 설명할 수 있다. 그러나 신경망에서는 분포를 직접 바꾸지 않고 매개변수를 바꾸며 여러 임계점이 생긴다. 저자도 실제 Multilayer Perceptron 학습에 동일한 보장이 없다고 명시한다. [원문 §4.2](https://arxiv.org/pdf/1406.2661v1)

## 5 실험

MNIST, Toronto Face Database, CIFAR-10에서 이미지 생성 결과를 제시한다. 정량 평가는 생성 표본에 Gaussian Parzen Window(가우시안 파르젠 윈도)를 맞추고 시험 데이터의 Log-Likelihood(로그 가능도)를 추정한다. 이는 G의 정확한 확률값을 직접 계산한 결과가 아니며, 저자는 높은 분산과 고차원에서의 약점을 인정한다.

시각화에는 무작위 생성 표본, 가까운 학습 이미지, z 사이를 보간한 결과를 제시한다. 저자의 결론은 기존 방법보다 표본 품질이 우월하다는 확정적 주장이 아니라, 경쟁력 있는 표본을 만드는 새로운 학습 방식의 가능성이다. [원문 §5](https://arxiv.org/pdf/1406.2661v1)

<figure class="paper-figure" id="figure-2"><a href="/images/papers/goodfellow-2014/figure-2.png" target="_blank" rel="noopener"><img width="872" height="637" src="/images/papers/goodfellow-2014/figure-2.png" alt="MNIST·얼굴·CIFAR-10의 실제 생성 표본" loading="lazy" /></a><figcaption>Figure 2. MNIST·얼굴·CIFAR-10의 실제 생성 표본. <a href="https://arxiv.org/pdf/1406.2661v1">원문</a></figcaption></figure>

(a)는 숫자, (b)는 얼굴, (c)는 완전연결 모델의 CIFAR-10, (d)는 합성곱 기반 모델의 CIFAR-10이다. 각 패널 오른쪽 열은 인접 생성 표본에 가장 가까운 학습 예제다. 저자는 무작위로 뽑은 표본을 보여주며 단순 복제 여부를 살펴보지만, 그림 몇 장만으로 전체 학습 자료의 암기 가능성을 완전히 배제하지는 않는다.

<figure class="paper-figure" id="figure-3"><a href="/images/papers/goodfellow-2014/figure-3.png" target="_blank" rel="noopener"><img width="781" height="66" src="/images/papers/goodfellow-2014/figure-3.png" alt="z 공간에서 선형 보간한 숫자 생성" loading="lazy" /></a><figcaption>Figure 3. z 공간에서 선형 보간한 숫자 생성. <a href="https://arxiv.org/pdf/1406.2661v1">원문</a></figcaption></figure>

왼쪽에서 오른쪽으로 z 좌표를 보간할 때 생성 숫자의 형태가 변한다. 이미지 픽셀 두 장을 직접 섞은 것이 아니라 입력 공간의 변화가 생성물에 어떻게 반영되는지를 보여준다. 이 한 경로가 모든 z 방향의 의미적 연속성을 보장하는 것은 아니다.

**Table 1. Parzen 기반 시험 Log-Likelihood 추정** ([원문](https://arxiv.org/pdf/1406.2661v1))

| 모델 | MNIST | TFD |
| --- | --- | --- |
| DBN | 138 ± 2 | 1909 ± 66 |
| Stacked CAE | 121 ± 1.6 | 2110 ± 50 |
| Deep GSN | 214 ± 1.1 | 1890 ± 29 |
| Adversarial nets | 225 ± 2 | 2057 ± 26 |

각 열은 서로 다른 데이터셋의 추정값이며 열끼리 크기를 비교하지 않는다. MNIST 오차는 예제별 평균의 표준오차, TFD는 분할 간 표준오차다. 정확한 생성 확률이 아니라 생성 표본에 맞춘 밀도 추정이라는 한계가 있고, TFD에서는 다른 방법이 더 높은 값을 보인다.


## 6 장점과 단점

장점은 Markov Chain이나 학습 중 별도 추론 없이 역전파로 학습하고 순방향 계산으로 표본을 생성한다는 점이다. 단점은 명시적인 생성 확률을 얻기 어렵고 G와 D의 갱신 균형을 맞춰야 한다는 점이다. 저자는 G가 너무 많은 z를 같은 x에 대응시키면 다양성이 부족해지는 현상을 이미 지적한다. 따라서 D를 속이는 학습 목표만 적었다고 다양한 데이터가 자동으로 보장되는 것은 아니다.

## 7 결론과 향후 연구

조건을 G와 D에 함께 입력하는 생성, 관측값에서 z를 추정하는 보조 네트워크, 부분 관측의 조건부 생성, 적은 라벨로 하는 분류, 학습 효율 개선을 후속 방향으로 제안한다. 이 항목들은 본 논문에서 모두 검증한 결과가 아니라 제안한 확장이다. 논문의 실제 성과는 적대적 학습 방식의 이론적 목표와 초기 실험 가능성을 제시한 데 있다.
