---
title: 'Training Compute-Optimal Large Language Models — Chinchilla'
description: 'Chinchilla가 모델 크기와 학습 토큰의 균형을 다시 추정한 세 방법, Kaplan과의 차이, 평가 결과와 한계를 원문 Figure·Table·수식으로 읽습니다.'
publishedAt: '2026-09-21'
topic: llm-tech
category: pretraining
tags: ['Chinchilla', 'Scaling Laws', 'Compute Efficiency', 'Language Models', '논문 해설']
kind: research-review
readingTime: 40
featured: false
draft: false
sourceLinks:
  - title: 'Hoffmann et al. · arXiv v1 · 2022-03-29'
    url: https://arxiv.org/abs/2203.15556v1
    kind: 원문
  - title: '검토 PDF · 본문과 부록 A–J'
    url: https://arxiv.org/pdf/2203.15556v1
    kind: PDF
takeaway: '이 실험에서는 계산량을 늘릴 때 모델 크기와 학습 토큰 수를 비슷한 비율로 늘리는 편이 유리했다. 70B Chinchilla는 1.4T 토큰으로 학습해 같은 계산 예산의 280B Gopher를 대부분의 평가에서 앞섰다.'
---

Jordan Hoffmann, Sebastian Borgeaud, Arthur Mensch 외 DeepMind 저자들의 논문입니다. <strong>최초 공개와 검토 판본은 2022-03-29의 arXiv v1, 이 해설 게시일은 2026-09-21</strong>입니다. 2022년 당시 모델과 평가를 다루며 현재 성능 순위로 소개하지 않습니다. [원문·판본](https://arxiv.org/abs/2203.15556v1)

원문 순서에 따라 본문과 부록 A–J를 설명합니다. <strong>Figure 1–7·A1–A7의 14개 그림, Table 1–10·A1–A9의 19개 표, 식 (1)–(11)</strong>을 유지합니다. Model Card(모델 설명서)는 4쪽에 걸친 연속 표를 모두 포함합니다. 감사의 글과 참고문헌 목록은 재수록하지 않습니다. [전체 PDF](https://arxiv.org/pdf/2203.15556v1)

앞선 [Kaplan 등의 Scaling Laws 해설](/notes/scaling-laws-neural-language-models/)에서 출발하면 두 논문의 질문은 같습니다. <strong>정해진 계산 예산을 모델 크기와 학습량에 어떻게 나눌 것인가?</strong> Chinchilla는 이 배분의 추정 방법과 결과를 다시 검토합니다.

## Abstract

같은 공부 시간을 쓰더라도 더 큰 도구를 마련하는 것과 그 도구로 더 많은 자료를 학습하는 것은 다른 선택입니다. 이 이해용 비유처럼, 논문은 <strong>Parameter Count(파라미터 수)</strong>와 <strong>Training Tokens(학습 토큰 수)</strong>의 배분을 함께 바꿉니다.

400개 이상의 학습 실행을 분석한 결과, 저자들은 계산량이 늘 때 모델 크기와 토큰 수를 대략 같은 비율로 늘리는 편이 효율적이라고 결론 내립니다. 이를 확인하기 위해 70B, 즉 700억 파라미터의 Chinchilla를 1.4T, 즉 1.4조 토큰으로 학습합니다. 더 큰 Gopher보다 대부분의 평가에서 좋았지만 <strong>모든 개별 과제에서 이긴 것은 아닙니다</strong>. 아래의 표에는 예외도 남깁니다. [초록·§4](https://arxiv.org/pdf/2203.15556v1#page=1)

## 1. Introduction

<strong>Compute-optimal(계산 최적)</strong>이라는 말은 정해진 학습 FLOPs에서 사전학습 손실을 가장 낮게 만드는 배분을 뜻합니다. 모델이 작을수록 무조건 좋다는 뜻도, 실제 서비스의 전체 비용까지 최적화했다는 뜻도 아닙니다.

<figure>
  <a href="/images/papers/hoffmann-2022/figure-1.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-1.png" width="1494" height="624" alt="Figure 1. 세 방법과 Kaplan의 최적 크기 예측" loading="lazy" /></a>
  <figcaption>Figure 1. 세 방법과 Kaplan의 최적 크기 예측 — Hoffmann et al. (2022), arXiv v1, p. 2. <a href="https://arxiv.org/pdf/2203.15556v1#page=2">원문</a> · <a href="/images/papers/hoffmann-2022/figure-1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축은 Training FLOPs(학습 연산량), 세로축은 파라미터 수이며 둘 다 로그 축입니다. 세 실선은 이 논문의 접근법, 검은 점선은 Kaplan 등의 예측, 별은 실제 대형 모델입니다. 같은 계산량에서 세 방법은 기존 대형 모델보다 작은 크기를 권합니다. 큰 계산량의 선은 작은 실험에서 외삽한 예측입니다.
$$
N_{\text{opt}}(C), D_{\text{opt}}(C) = \underset{N, D \text{ s.t. } \text{FLOPs}(N, D)=C}{\text{argmin}} L(N, D). \tag{1}
$$

$N$은 모델 파라미터 수, $D$는 학습 중 <strong>처리한 토큰 수</strong>, $C$는 학습 계산량, $L(N,D)$는 학습 완료 후 손실입니다. $D$를 고유한 토큰 종류 수나 문서 수로 읽지 않습니다. 이 논문은 Embedding(임베딩)도 파라미터·연산량에 포함하며, 이를 제외한 Kaplan의 기본 정의와 구분합니다.

원문은 데이터가 충분한 Scaling 분석에서 평활화한 Training Loss(학습 손실)를 Test Loss(평가 손실)의 추정치로 사용합니다. 학습 데이터에 여러 번 과적합한 손실을 그대로 일반화 성능으로 간주하는 방식이 아닙니다. 이 가정과 Chinchilla의 실제 하위 데이터 반복량은 부록 A에서 구분합니다.

<figure>
  <a href="/images/papers/hoffmann-2022/table-1.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-1.png" width="1494" height="357" alt="Table 1. 2022년 대형 모델의 크기와 토큰 수" loading="lazy" /></a>
  <figcaption>Table 1. 2022년 대형 모델의 크기와 토큰 수 — Hoffmann et al. (2022), arXiv v1, p. 3. <a href="https://arxiv.org/pdf/2203.15556v1#page=3">원문</a> · <a href="/images/papers/hoffmann-2022/table-1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

당시 다섯 대형 모델과 Chinchilla를 비교합니다. Billion은 10억, Trillion은 1조입니다. Gopher는 280B·300B 토큰, Chinchilla는 70B·1.4T 토큰입니다. 논문의 “4배 데이터”는 근사 표현이며 표의 숫자 비율은 약 4.67배입니다. 이 표는 2022년 당시 목록입니다.

Kaplan의 추정은 계산 예산 10배에 모델 약 5.5배·토큰 약 1.8배를 제안했습니다. 여기서는 모델·토큰 각각 약 $\sqrt{10}\approx3.16$배에 가깝습니다. $C\approx6ND$이므로 <strong>모델과 토큰을 각각 두 배로 하면 계산량은 약 네 배</strong>입니다. “같은 비율로 늘린다”는 말을 계산량과도 같은 비율로 늘린다는 뜻으로 읽지 않습니다. [원문 §1](https://arxiv.org/pdf/2203.15556v1#page=2)

## 2. Related Work

<strong>Large Language Model(대규모 언어 모델)</strong>의 크기 경쟁과 함께 Dense Transformer(밀집 트랜스포머), MoE(Mixture of Experts, 전문가 혼합), Retrieval(검색)을 활용한 모델이 등장했습니다. 이 논문의 주된 분석 대상은 Dense Transformer(밀집 트랜스포머)입니다. 그 계수를 MoE의 전체 파라미터 수에 바로 대입하지 않습니다.

Kaplan과의 중요한 차이는 <strong>Learning Rate Schedule(학습률 스케줄)</strong>입니다. 오래 학습하도록 설계한 스케줄의 중간 손실은, 그 시점에 맞춰 학습률을 낮추고 끝낸 모델의 손실보다 높을 수 있습니다. 저자들은 학습 길이마다 스케줄을 맞추고 모델별로 여러 종료 길이를 실험합니다. 단지 같은 실행의 중간 지점을 더 많이 읽는 것으로 대체하지 않습니다.

또한 최대 약 16B까지 실험해 더 큰 모델의 추세를 포함합니다. 배치 크기·너비와 깊이·Optimizer(최적화 알고리즘)는 기존 연구의 경험칙을 사용합니다. 모든 하이퍼파라미터를 동시에 전역 최적화한 연구는 아닙니다. [원문 §2](https://arxiv.org/pdf/2203.15556v1#page=3)

## 3. Estimating the optimal parameter/training tokens allocation

세 접근 모두 모델 크기와 학습 토큰 수를 바꾸어 손실을 측정하지만 최적점을 추정하는 방법이 다릅니다. 하나는 학습 곡선들의 최저 경계, 하나는 같은 계산 예산의 최종 손실, 하나는 두 변수의 손실 함수를 사용합니다. Power Law(거듭제곱 법칙)는 경험적 적합 가정이며 §E의 곡률을 완전히 설명하지 못합니다.

### 3.1. Approach 1: Fix model sizes and vary number of training tokens

약 70M–10B 이상의 모델군에서 각 크기에 네 가지 학습 길이를 적용합니다. 최장·최단 길이는 16배 범위를 이루며 각 스케줄은 학습률을 10분의 1로 낮춥니다. 학습 곡선을 평활화·보간한 뒤 1,500개의 로그 간격 계산량에서 가장 낮은 손실을 주는 모델과 토큰 수를 찾습니다.

<figure>
  <a href="/images/papers/hoffmann-2022/figure-2.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-2.png" width="1494" height="381" alt="Figure 2. 학습 곡선의 최솟값을 연결하는 방법" loading="lazy" /></a>
  <figcaption>Figure 2. 학습 곡선의 최솟값을 연결하는 방법 — Hoffmann et al. (2022), arXiv v1, p. 5. <a href="https://arxiv.org/pdf/2203.15556v1#page=5">원문</a> · <a href="/images/papers/hoffmann-2022/figure-2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 모델 크기별 학습 손실 곡선으로 색이 크기를 구분합니다. 각 계산량에서 가장 낮은 곡선을 선택한 뒤, 가운데는 최적 파라미터 수, 오른쪽은 토큰 수를 적합합니다. 초록색 가이드는 Gopher의 계산 예산에 대한 예측입니다. 관측점이 없는 큰 규모까지 실험한 그래프는 아닙니다.

선택된 점은 각 실행의 마지막 15% 안에 있었습니다. 학습 길이에 맞춰 스케줄을 마무리하는 중요성을 뒷받침합니다. 이 결과의 배분 지수는 $N_{\mathrm{opt}}\propto C^{0.50}$, $D_{\mathrm{opt}}\propto C^{0.50}$입니다. [원문 §3.1](https://arxiv.org/pdf/2203.15556v1#page=5)

### 3.2. Approach 2: IsoFLOP profiles

<strong>IsoFLOP(동일 연산량)</strong> 비교는 먼저 계산 예산을 고정합니다. 모델이 커지면 그 예산 안에서 학습할 토큰은 줄어듭니다. $6\times10^{18}$부터 $3\times10^{21}$ FLOPs까지 아홉 예산에서 모델 크기를 바꾸고, 스케줄을 각 종료 시점에 맞춘 <strong>최종 손실</strong>을 비교합니다.

<figure>
  <a href="/images/papers/hoffmann-2022/figure-3.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-3.png" width="1494" height="420" alt="Figure 3. IsoFLOP 곡선의 골짜기" loading="lazy" /></a>
  <figcaption>Figure 3. IsoFLOP 곡선의 골짜기 — Hoffmann et al. (2022), arXiv v1, p. 6. <a href="https://arxiv.org/pdf/2203.15556v1#page=6">원문</a> · <a href="/images/papers/hoffmann-2022/figure-3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽에서 같은 색은 동일한 계산 예산입니다. 모델을 너무 작게 또는 크게 잡으면 손실이 올라가는 U자형 곡선이 나타납니다. 각 골짜기의 위치로 가운데 모델 크기, 오른쪽 토큰 수를 추정합니다. 가로축·색상별 FLOPs와 초록색 Gopher 예산 가이드를 함께 읽습니다.

각 곡선의 최저점을 포물선으로 추정하고 예산에 따른 이동을 적합하면 $(a,b)=(0.49,0.51)$이 나옵니다. 손실이 가장 낮은 골짜기를 포착하도록 그 양쪽의 크기를 모두 실험해야 한다는 점이 중요합니다. [원문 §3.2](https://arxiv.org/pdf/2203.15556v1#page=6)

### 3.3. Approach 3: Fitting a parametric loss function

$$
\hat{L}(N, D) \triangleq E + \frac{A}{N^\alpha} + \frac{B}{D^\beta}. \tag{2}
$$

$E$는 이상적인 예측기의 손실에 대응하는 상수, $A/N^\alpha$는 제한된 모델 용량의 비용, $B/D^\beta$는 유한한 학습 토큰·최적화의 비용입니다. $N,D$가 커지면 두 비용은 줄지만 $E$는 남습니다. $B$는 이 식의 <strong>적합 상수</strong>이며 배치 크기 기호가 아닙니다.

$$
\min_{A, B, E, \alpha, \beta} \sum_{\text{Runs } i} \text{Huber}_\delta(\log \hat{L}(N_i, D_i) - \log L_i) \tag{3}
$$

예측 손실과 관측 손실의 <strong>로그 차이</strong>에 Huber Loss(후버 손실)를 적용하고 L-BFGS 알고리즘으로 맞춥니다. $\delta=10^{-3}$을 사용해 큰 잔차의 영향력을 낮추고 여러 초기화에서 적합합니다. $E,A,B,\alpha,\beta$가 자연의 보편 상수라는 주장은 아닙니다.

<figure>
  <a href="/images/papers/hoffmann-2022/figure-4.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-4.png" width="1494" height="642" alt="Figure 4. 손실 함수 적합과 효율 경계" loading="lazy" /></a>
  <figcaption>Figure 4. 손실 함수 적합과 효율 경계 — Hoffmann et al. (2022), arXiv v1, p. 7. <a href="https://arxiv.org/pdf/2203.15556v1#page=7">원문</a> · <a href="/images/papers/hoffmann-2022/figure-4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽의 등고선은 같은 예측 손실, 점은 실험, 파란 선은 계산 효율이 최적인 배분입니다. 오른쪽은 고정 FLOPs로 자른 손실 곡선이며 왼쪽 점선과 대응합니다. 이 방법은 Gopher 계산 예산에서 약 40B를 권해 다른 두 방법보다 작은 크기를 예측합니다.
$$
N_{opt}(C) = G \left( \frac{C}{6} \right)^a, \quad D_{opt}(C) = G^{-1} \left( \frac{C}{6} \right)^b, \quad \text{where} \quad G = \left( \frac{\alpha A}{\beta B} \right)^{\frac{1}{\alpha+\beta}}, \quad a = \frac{\beta}{\alpha + \beta}, \quad \text{and} \quad b = \frac{\alpha}{\alpha + \beta}. \tag{4}
$$

$D=C/(6N)$을 식 (2)에 대입하고 $N$에 대해 최소화하면 식 (4)가 나옵니다. 이때 균형 조건은 $\alpha A/N^\alpha=\beta B/D^\beta$입니다. 두 손실 항 자체가 언제나 정확히 같아야 하는 것은 아닙니다. $a+b=1$이므로 $N_{\mathrm{opt}}D_{\mathrm{opt}}=C/6$도 유지됩니다.

이 방법은 $(a,b)\approx(0.46,0.54)$를 예측하며 큰 예산에서 다른 방법보다 작은 모델을 권합니다. 낮은 계산량 실행의 잔차와 경계 곡률 때문에 세 접근의 결과가 완전히 같지는 않습니다. [원문 §3.3](https://arxiv.org/pdf/2203.15556v1#page=6)

### 3.4. Optimal model scaling

<figure>
  <a href="/images/papers/hoffmann-2022/table-2.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-2.png" width="1494" height="279" alt="Table 2. 계산량 증가에 따른 배분 지수" loading="lazy" /></a>
  <figcaption>Table 2. 계산량 증가에 따른 배분 지수 — Hoffmann et al. (2022), arXiv v1, p. 8. <a href="https://arxiv.org/pdf/2203.15556v1#page=8">원문</a> · <a href="/images/papers/hoffmann-2022/table-2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

열은 $N_{\mathrm{opt}}\propto C^a$의 $a$와 $D_{\mathrm{opt}}\propto C^b$의 $b$입니다. 괄호는 데이터를 80%씩 100회 재표집해 얻은 10·90 백분위입니다. Approach 3의 0.46과 괄호 (0.454, 0.455)처럼 표시값·범위가 정확히 일치하지 않는 원문 수치를 그대로 보존합니다. 이 좁은 구간을 장기 외삽의 전체 불확실성으로 읽지 않습니다.

|방법|모델 지수 $a$|토큰 지수 $b$|
|---|---|---|
|학습 곡선 경계|0.50|0.50|
|IsoFLOP 최저점|0.49|0.51|
|손실 함수 적합|0.46|0.54|
|Kaplan et al. (2020)|0.73|0.27|

위 읽기용 표는 중심값을 비교한 것이며 원표의 재표집 범위는 바로 위에 모두 유지했습니다. 세 방법이 공통으로 지지하는 것은 모델·토큰의 대략 균형적인 증가이지, 큰 규모의 최적점이 하나로 정밀하게 확정됐다는 결론이 아닙니다.

<figure>
  <a href="/images/papers/hoffmann-2022/table-3.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-3.png" width="1494" height="468" alt="Table 3. Approach 1의 모델 크기별 예산 예측" loading="lazy" /></a>
  <figcaption>Table 3. Approach 1의 모델 크기별 예산 예측 — Hoffmann et al. (2022), arXiv v1, p. 8. <a href="https://arxiv.org/pdf/2203.15556v1#page=8">원문</a> · <a href="/images/papers/hoffmann-2022/table-3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

열은 파라미터 수, FLOPs, Gopher 예산 대비 배수, 학습 토큰입니다. 모든 행은 예측이며 10T 파라미터 모델까지 실제로 학습했다는 뜻이 아닙니다. 원문 표는 175B에 3.85×10²⁴ FLOPs·3.7T 토큰, 280B에 9.90×10²⁴·5.9T를 적지만 이어지는 본문은 각각 4.41×10²⁴·4.2T, 약 10²⁵·6.8T라고 적습니다. 여기서는 표를 기준으로 읽고 이 불일치를 남깁니다.

Approach 1의 1B 모델에는 약 20.2B 토큰, 10B 모델에는 약 205.1B 토큰이라는 예측이 나옵니다. 여기서 널리 요약되는 <strong>“파라미터당 약 20토큰”</strong>의 규모를 읽을 수 있습니다. 그러나 이는 이 적합과 조건의 근사이며, Approach 3·다른 데이터·반복 학습·추론 비용까지 고려한 보편 규칙으로 바꾸지 않습니다. [원문 §3.4](https://arxiv.org/pdf/2203.15556v1#page=8)

## 4. Chinchilla

Gopher 예산에서 세 방법이 예측한 범위는 대략 40B–70B입니다. 저자들은 데이터와 하드웨어 효율을 고려해 큰 쪽인 70B를 선택하고 1.4T 토큰으로 학습했습니다. “40B–70B 전체를 대규모 학습해 가장 좋은 점을 골랐다”는 실험은 아닙니다.

작은 모델은 Fine-tuning(미세 조정)과 Inference(추론)의 메모리·연산 비용도 줄일 수 있습니다. 다만 본 논문의 최적화 목적은 학습 예산 아래의 손실이며, 전체 서비스 수명 동안의 요청량까지 포함한 비용 최소화는 별도 문제입니다.

### 4.1. Model and training details

<figure>
  <a href="/images/papers/hoffmann-2022/table-4.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-4.png" width="1494" height="183" alt="Table 4. Gopher와 Chinchilla의 구조·학습 설정" loading="lazy" /></a>
  <figcaption>Table 4. Gopher와 Chinchilla의 구조·학습 설정 — Hoffmann et al. (2022), arXiv v1, p. 9. <a href="https://arxiv.org/pdf/2203.15556v1#page=9">원문</a> · <a href="/images/papers/hoffmann-2022/table-4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

두 모델은 모두 80층입니다. Chinchilla는 Head 64개, Key/Value 차원 128, 모델 너비 8192이며 Feed-forward 너비는 그 네 배입니다. 배치 단위는 토큰이고 두 모델 모두 학습 중간에 배치를 두 배로 늘립니다. 최대 학습률과 구조가 다른 조건을 보존합니다.

기본 모델 계열은 Gopher와 같지만 다음 차이가 있습니다. MassiveText의 샘플링 비율을 조정하고 Adam 대신 AdamW를 사용합니다. SentencePiece Tokenizer(토크나이저)는 NFKC 정규화를 적용하지 않으며 어휘의 94.15%가 Gopher와 같습니다. 수학·화학 표기에 이점이 있었다고 설명합니다.

순전파·역전파는 `bfloat16`으로 수행하되 분산 Optimizer(최적화 알고리즘) 상태에는 `float32` 가중치 사본을 보존합니다. TPUv3/TPUv4와 JAX·Haiku를 사용합니다. <strong>Gopher와 Chinchilla의 차이를 전부 파라미터·토큰 배분 하나의 효과라고 분리할 수는 없습니다.</strong> 부록 G의 비교가 이 추가 변경을 다룹니다. [원문 §4.1](https://arxiv.org/pdf/2203.15556v1#page=9)

### 4.2. Results

<figure>
  <a href="/images/papers/hoffmann-2022/table-5.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-5.png" width="1494" height="342" alt="Table 5. 평가 범위" loading="lazy" /></a>
  <figcaption>Table 5. 평가 범위 — Hoffmann et al. (2022), arXiv v1, p. 10. <a href="https://arxiv.org/pdf/2203.15556v1#page=10">원문</a> · <a href="/images/papers/hoffmann-2022/table-5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

언어 모델링 20개, 독해 3개, 질의응답 3개, 상식 5개, MMLU 57개, BIG-bench 62개 과제를 묶은 표입니다. 범주마다 평가 방식과 지표가 다르므로 이 수치를 하나의 통합 정확도로 합치지 않습니다.

원문은 Gopher 연구와 대체로 같은 평가 설정을 사용합니다. 정확도, Perplexity(퍼플렉서티), Bits per Byte(바이트당 비트 수)는 서로 다른 지표입니다. 표의 Shot(제시 예시 수), 데이터 분할, 프롬프트 조건을 함께 읽습니다.

#### 4.2.1. Language modelling

<figure>
  <a href="/images/papers/hoffmann-2022/figure-5.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-5.png" width="1494" height="618" alt="Figure 5. The Pile의 bpb 개선" loading="lazy" /></a>
  <figcaption>Figure 5. The Pile의 bpb 개선 — Hoffmann et al. (2022), arXiv v1, p. 10. <a href="https://arxiv.org/pdf/2203.15556v1#page=10">원문</a> · <a href="/images/papers/hoffmann-2022/figure-5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축은 The Pile의 평가 하위 집합, 세로축은 Gopher 대비 Bits per Byte(바이트당 비트 수)의 감소입니다. 양의 막대는 Chinchilla의 손실이 더 낮다는 뜻입니다. 모든 표시 집합에서 개선하지만 데이터 중복 가능성은 별도로 확인해야 합니다.

WikiText103의 Perplexity(퍼플렉서티)는 Gopher 7.75에서 Chinchilla 7.16으로 낮아집니다. The Pile의 실제 bpb 수치는 부록 H.1에 모두 보존합니다. 저자들은 더 많은 학습 데이터로 인해 평가 데이터와의 중복이 결과를 좋게 만들 가능성을 지적합니다. 따라서 이 손실 개선만으로 모든 일반화 개선을 설명하지 않습니다.

#### 4.2.2. MMLU

<figure>
  <a href="/images/papers/hoffmann-2022/table-6.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-6.png" width="1494" height="387" alt="Table 6. MMLU 평균 5-shot 정확도" loading="lazy" /></a>
  <figcaption>Table 6. MMLU 평균 5-shot 정확도 — Hoffmann et al. (2022), arXiv v1, p. 11. <a href="https://arxiv.org/pdf/2203.15556v1#page=11">원문</a> · <a href="/images/papers/hoffmann-2022/table-6.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

57개 과제 평균입니다. Chinchilla 67.6%, Gopher 60.0%의 차이는 7.6%p입니다. 초록은 67.5%라고 적어 본문·표와 0.1%p 차이가 있습니다. 인간 평가·전문가 정확도는 인용 연구의 비교값이고, 2022/2023 Forecast는 당시 예측치이므로 실제 후속 연도 측정값과 구분합니다.
<figure>
  <a href="/images/papers/hoffmann-2022/figure-6.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-6.png" width="1494" height="693" alt="Figure 6. MMLU 과제별 Gopher 대비 변화" loading="lazy" /></a>
  <figcaption>Figure 6. MMLU 과제별 Gopher 대비 변화 — Hoffmann et al. (2022), arXiv v1, p. 12. <a href="https://arxiv.org/pdf/2203.15556v1#page=12">원문</a> · <a href="/images/papers/hoffmann-2022/figure-6.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축은 개별 MMLU 과제이고, 세로축은 원문 표기대로 Relative Improvement(상대 개선율)입니다. 파란 막대는 개선, 주황색은 악화입니다. 평균 정확도의 7.6%p 증가와 이 상대 개선율 축은 서로 다른 양입니다. 57개 중 51개 개선, 2개 동일, 4개 악화로 요약됩니다.

<strong>MMLU(Massive Multitask Language Understanding, 다중 과제 언어 이해)</strong>는 57개 시험형 과제로 구성됩니다. 표 기준 5-shot 정확도는 67.6%이며 Gopher 대비 <strong>7.6 percentage points(%p)</strong> 증가입니다. College Mathematics, Econometrics, Moral Scenarios, Formal Logic에서는 오히려 낮습니다. 평균 개선과 개별 과제의 예외를 함께 유지합니다. [원문 §4.2.1–2](https://arxiv.org/pdf/2203.15556v1#page=10)

#### 4.2.3. Reading comprehension

<figure>
  <a href="/images/papers/hoffmann-2022/table-7.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-7.png" width="1494" height="225" alt="Table 7. 독해와 마지막 단어 예측" loading="lazy" /></a>
  <figcaption>Table 7. 독해와 마지막 단어 예측 — Hoffmann et al. (2022), arXiv v1, p. 12. <a href="https://arxiv.org/pdf/2203.15556v1#page=12">원문</a> · <a href="/images/papers/hoffmann-2022/table-7.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

LAMBADA는 Zero-shot(예시 없는 평가), RACE는 Few-shot(소수 예시 평가) 정확도입니다. RACE-m/h에서 Chinchilla와 Gopher 차이는 11.7%p·10.7%p입니다. GPT-3·MT-NLG는 RACE에서 프롬프트 형식이 달라 직접 비교할 수 없다는 원문 주석을 유지합니다. 대시는 미보고 값입니다.

LAMBADA에서는 마지막 단어 예측 정확도가 77.4%이며 Gopher 74.5%, GPT-3 76.2%, MT-NLG 76.6%와 비교합니다. RACE-h/m의 프롬프트 차이를 무시하고 모든 열을 동일 조건의 순위로 읽지 않습니다.

#### 4.2.4. BIG-bench

<figure>
  <a href="/images/papers/hoffmann-2022/figure-7.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-7.png" width="1494" height="708" alt="Figure 7. BIG-bench 과제별 Gopher 대비 변화" loading="lazy" /></a>
  <figcaption>Figure 7. BIG-bench 과제별 Gopher 대비 변화 — Hoffmann et al. (2022), arXiv v1, p. 13. <a href="https://arxiv.org/pdf/2203.15556v1#page=13">원문</a> · <a href="/images/papers/hoffmann-2022/figure-7.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축은 평가한 BIG-bench 과제, 세로축은 Relative Improvement(상대 개선율)입니다. 대다수 막대가 양수지만 네 과제는 음수입니다. 평균 정확도 차이 10.7%p를 각 막대의 수치와 혼동하지 않으며, 모든 BIG-bench 과제를 평가한 결과도 아닙니다.

선택한 62개 과제의 평균 정확도는 Gopher 54.4%에서 Chinchilla 65.1%로 <strong>10.7%p</strong> 높아집니다. Crash Blossom, Dark Humor Detection, Mathematical Induction, Logical Args에서는 낮습니다. 전체 과제별 값은 Table A7에서 확인할 수 있습니다.

#### 4.2.5. Common sense

<figure>
  <a href="/images/papers/hoffmann-2022/table-8.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-8.png" width="1494" height="306" alt="Table 8. Zero-shot 상식 평가" loading="lazy" /></a>
  <figcaption>Table 8. Zero-shot 상식 평가 — Hoffmann et al. (2022), arXiv v1, p. 13. <a href="https://arxiv.org/pdf/2203.15556v1#page=13">원문</a> · <a href="/images/papers/hoffmann-2022/table-8.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

모델별 정확도와 지도학습 SOTA를 병기합니다. Chinchilla는 PIQA에서 Gopher와 81.8%로 같고 MT-NLG의 82.0%보다 낮습니다. 따라서 본문의 “모든 과제에서 능가”보다 표의 “동등하거나 개선”이 정확합니다. 지도학습 열은 학습 조건이 다른 참고 기준입니다.

TruthfulQA에서 Chinchilla의 0·5·10-shot 정확도는 43.6%·58.5%·66.7%입니다. 원문이 비교한 Gopher는 0-shot 29.5%, 10-shot 43.7%입니다. 이는 이 평가에서 개선됐다는 결과이며, 더 나은 사전학습 손실이 모든 상황의 진실성을 보장한다는 결론은 아닙니다. [원문 §4.2.3–5](https://arxiv.org/pdf/2203.15556v1#page=12)

#### 4.2.6. Closed-book question answering

<figure>
  <a href="/images/papers/hoffmann-2022/table-9.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-9.png" width="1494" height="504" alt="Table 9. Closed-book 질의응답" loading="lazy" /></a>
  <figcaption>Table 9. Closed-book 질의응답 — Hoffmann et al. (2022), arXiv v1, p. 14. <a href="https://arxiv.org/pdf/2203.15556v1#page=14">원문</a> · <a href="/images/papers/hoffmann-2022/table-9.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

Natural Questions의 dev, TriviaQA unfiltered test와 filtered dev를 분리하고 0·5·64-shot을 보존합니다. 원문 본문은 Natural Questions의 Gopher 5-shot을 21%라고 적지만 표에는 24.5%입니다. 수치 비교는 표를 따릅니다. Open-book SOTA는 외부 문서를 사용하는 별도 조건으로 같은 방식의 경쟁 모델이 아닙니다.

<strong>Closed-book Question Answering(외부 문서 없는 질의응답)</strong>에서는 추론 시 검색 문서를 주지 않습니다. Natural Questions의 Chinchilla는 5-shot 31.5%, 64-shot 35.5%입니다. TriviaQA는 필터링 여부와 dev/test 분할을 유지해야 합니다. 예시를 더 많이 주었다고 항상 개선하지도 않습니다. Unfiltered TriviaQA는 5-shot 73.2%가 64-shot 72.3%보다 높습니다.

#### 4.2.7. Gender bias and toxicity

<figure>
  <a href="/images/papers/hoffmann-2022/table-10.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-10.png" width="1494" height="267" alt="Table 10. Winogender의 집단별 정확도" loading="lazy" /></a>
  <figcaption>Table 10. Winogender의 집단별 정확도 — Hoffmann et al. (2022), arXiv v1, p. 15. <a href="https://arxiv.org/pdf/2203.15556v1#page=15">원문</a> · <a href="/images/papers/hoffmann-2022/table-10.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 전체·남성·여성·중립 대명사, 오른쪽은 성별 고정관념과 충돌하는 gotcha 및 그렇지 않은 예제입니다. 전체 정확도는 71.4%→78.3%지만 개선 폭은 집단마다 다릅니다. 여성 gotcha에서는 66.7%→76.7%로 10%p 개선됩니다. 전체 점수 상승이 편향 제거를 뜻하지는 않습니다.

Winogender는 대명사가 어떤 직업·등장인물을 가리키는지 평가합니다. 저자들은 집단별 성능이 개선돼도 격차와 편향은 남는다고 설명합니다. 측정한 성별·직업 연결 과제를 넘어 포괄적인 공정성 검증을 했다고 주장하지 않습니다.

Toxicity(유해성)는 무조건 생성한 25,000개 표본을 PerspectiveAPI로 평가합니다. Gopher와 Chinchilla의 평균은 0.081·0.087, 중앙값은 0.064·0.066, 95백분위는 0.230·0.238입니다. 원문은 차이가 작다고 해석합니다. <strong>Chinchilla의 유해성이 이 수치에서 더 낮아졌다고 읽지는 않습니다.</strong> 프롬프트 없는 생성·자동 분류기라는 평가 범위도 남습니다. [원문 §4.2.6–7](https://arxiv.org/pdf/2203.15556v1#page=13)

## 5. Discussion & Conclusion

세 분석 방법과 Chinchilla/Gopher 비교는 같은 학습 예산에서 모델 크기만 키우는 대신 학습 토큰도 늘리는 전략을 지지합니다. 그러나 큰 규모에서 비교 가능한 학습은 두 모델뿐이고, 중간 규모의 추가 검증과 다양한 대형 최적점 탐색은 제한적입니다. 경계에 곡률이 있어 Power Law(거듭제곱 법칙)의 외삽이 최적 모델 크기를 여전히 크게 추정할 수도 있습니다.

데이터의 양뿐 아니라 품질·평가 데이터 중복도 중요하다는 전망은 저자들의 해석입니다. 본문의 Scaling 분석은 단일 순회 범위를 대상으로 하지만 실제 혼합 데이터의 하위 집합 반복은 부록 A처럼 다릅니다. 다중 Epoch(자료 반복 순회)의 일반 법칙을 이 논문이 확정한 것은 아닙니다.

원문 결론에는 Chinchilla가 편향·유해성에 덜 영향받는다는 표현도 있지만, §4.2.7의 측정값은 <strong>일부 편향 과제 개선과 무조건 생성 유해성의 작은 차이</strong>를 보여 줍니다. 이 해설은 구체적 평가 조건과 수치를 우선해 해석합니다. [원문 §5](https://arxiv.org/pdf/2203.15556v1#page=15)

## A. Training dataset

<figure>
  <a href="/images/papers/hoffmann-2022/table-A1.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A1.png" width="1494" height="348" alt="Table A1. MassiveText 구성과 실제 반복량" loading="lazy" /></a>
  <figcaption>Table A1. MassiveText 구성과 실제 반복량 — Hoffmann et al. (2022), arXiv v1, p. 22. <a href="https://arxiv.org/pdf/2203.15556v1#page=22">원문</a> · <a href="/images/papers/hoffmann-2022/table-A1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

괄호 밖은 이 논문의 샘플링 비율, 괄호 안은 Gopher 쪽 비율입니다. 오른쪽은 Chinchilla의 1.4T 토큰 학습에서 하위 집합별 Epoch(전체 자료 순회 횟수)입니다. MassiveWeb 1.24회, Wikipedia 3.40회는 1회를 넘습니다. 따라서 Scaling 분석의 단일 순회 가정을 Chinchilla의 모든 하위 데이터까지 확장하지 않습니다.

|하위 집합|Chinchilla 샘플링|Gopher 샘플링|1.4T 학습의 Epoch|
|---|---|---|---|
|MassiveWeb|45%|48%|1.24|
|Books|30%|27%|0.75|
|C4|10%|10%|0.77|
|News|10%|10%|0.21|
|GitHub|4%|3%|0.13|
|Wikipedia|1%|2%|3.40|

위 읽기용 표는 비율·반복량 열을 재구성한 것입니다. 디스크 용량·문서 수를 포함한 원표 전체는 바로 위에 유지했습니다. 1.4T는 이 비율로 <strong>처리한 토큰 수</strong>이며 모두 서로 다른 데이터라는 뜻이 아닙니다. [원문 부록 A](https://arxiv.org/pdf/2203.15556v1#page=22)

## B. Optimal cosine cycle length

<figure>
  <a href="/images/papers/hoffmann-2022/figure-A1.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-A1.png" width="1494" height="798" alt="Figure A1. 종료 시점과 Cosine Cycle Length" loading="lazy" /></a>
  <figcaption>Figure A1. 종료 시점과 Cosine Cycle Length — Hoffmann et al. (2022), arXiv v1, p. 23. <a href="https://arxiv.org/pdf/2203.15556v1#page=23">원문</a> · <a href="/images/papers/hoffmann-2022/figure-A1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

위·아래는 서로 다른 목표 학습 길이입니다. 각 행의 왼쪽은 학습률, 가운데는 학습 손실, 오른쪽은 C4 평가 손실입니다. 1·1.1·1.25·1.5·2·5배 스케줄을 비교하며, 종료보다 너무 긴 스케줄은 학습률이 충분히 내려가지 않아 최종 손실을 높입니다.

목표 학습 단계보다 Cosine Cycle Length(코사인 주기 길이)를 25% 넘게 길게 잡으면 성능 저하가 뚜렷했다고 보고합니다. 종료 때까지 학습률을 약 10분의 1로 낮추는 설정을 사용하며, 0까지 낮추는 것과의 차이는 작고 5분의 1까지만 낮추는 것은 더 나빴습니다. “학습 토큰을 더 준다”와 함께 “그 길이에 맞게 학습률을 조절한다”는 조건이 붙습니다.

## C. Consistency of scaling results across datasets

<figure>
  <a href="/images/papers/hoffmann-2022/figure-A2.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-A2.png" width="1494" height="705" alt="Figure A2. C4와 GitHub에서의 재확인" loading="lazy" /></a>
  <figcaption>Figure A2. C4와 GitHub에서의 재확인 — Hoffmann et al. (2022), arXiv v1, p. 23. <a href="https://arxiv.org/pdf/2203.15556v1#page=23">원문</a> · <a href="/images/papers/hoffmann-2022/figure-A2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

위는 C4, 아래는 GitHub 데이터입니다. 각 행은 왼쪽 IsoFLOP 곡선, 가운데 모델 크기, 오른쪽 토큰 수 예측으로 구성됩니다. 서로 다른 데이터에서도 비슷한 배분 지수가 나오지만 같은 Tokenizer(토크나이저)와 단일 순회 범위의 실험입니다.
<figure>
  <a href="/images/papers/hoffmann-2022/table-A2.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A2.png" width="1494" height="240" alt="Table A2. 다른 데이터의 배분 지수" loading="lazy" /></a>
  <figcaption>Table A2. 다른 데이터의 배분 지수 — Hoffmann et al. (2022), arXiv v1, p. 24. <a href="https://arxiv.org/pdf/2203.15556v1#page=24">원문</a> · <a href="/images/papers/hoffmann-2022/table-A2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

C4는 $(a,b)=(0.50,0.50)$, GitHub는 $(0.53,0.47)$입니다. 두 데이터에서 대략 균형적인 배분이 재현되지만 모든 데이터 품질·언어·반복 학습 조건에 독립적임을 증명한 것은 아닙니다.

같은 Tokenizer(토크나이저)를 사용한 C4와 GitHub 분석은 결과가 MassiveText 하나의 우연만은 아닐 수 있음을 뒷받침합니다. 데이터 품질을 무시해도 된다는 근거는 아닙니다. [원문 부록 B–C](https://arxiv.org/pdf/2203.15556v1#page=22)

## D. Details on the scaling analyses

### D.1. Approach 1: Fixing model sizes and varying training sequences

작은 모델은 최대 학습률 $2\times10^{-4}$, 큰 모델은 $1.25\times10^{-4}$를 사용합니다. Cosine Schedule(코사인 스케줄)로 10배 감쇠하고, 10단계 창의 Gaussian Smoothing(가우시안 평활화)으로 학습 곡선의 잡음을 줄입니다. 보간한 최저 경계는 이런 처리 과정을 거친 추정치입니다.

### D.2. Approach 3: Parametric fitting of the loss

$$
\hat{L}(N, D) \triangleq E + \frac{A}{N^\alpha} + \frac{B}{D^\beta}, \tag{5}
$$

저자들은 이 함수를 Expected Risk(기대 위험)의 분해로 설명합니다. $f(x)_y$는 앞 문맥 $x$를 보고 다음 토큰 $y$에 부여한 확률입니다. $f^*$는 제한 없는 함수 공간에서의 이상적인 예측기, $f_N$은 크기 $N$의 Transformer 함수군 안에서 가장 좋은 예측기입니다.

$$
L(f) \triangleq \mathbb{E}[\log f(x)_y], \quad \text{and set} \quad f^* \triangleq \underset{f \in \mathcal{F}(\mathcal{X}, \mathcal{D}(\mathcal{Y}))}{\operatorname{argmin}} L(f). \tag{6}
$$
$$
f_N \triangleq \underset{f \in \mathcal{H}_N}{\operatorname{argmin}} L(f). \tag{7}
$$
$$
\hat{L}_D(f) \triangleq \hat{\mathbb{E}}_D[\log f(x)_y], \quad \text{setting} \quad \hat{f}_{N,D} \triangleq \underset{f \in \mathcal{H}_N}{\operatorname{argmin}} \hat{L}_D(f). \tag{8}
$$

<strong>원문 부호 주석:</strong> 식 (6)·(8)은 $\log f(x)_y$ 앞에 음수를 쓰지 않았지만 본문은 Cross-Entropy(교차 엔트로피)를 <strong>최소화</strong>한다고 설명합니다. 확률 예측의 교차 엔트로피로 일관되게 읽으려면 $-\mathbb E[\log f(x)_y]$와 $-\hat{\mathbb E}_D[\log f(x)_y]$입니다. 위에는 원문 번호·표기를 그대로 보존했고, 이어지는 설명은 이 손실 의미를 따릅니다.

$\hat f_{N,D}$는 유한 데이터에서의 경험적 최적점입니다. 실제 단일 순회 학습으로 얻는 $\bar f_{N,D}$는 그 최적점에 완전히 도달하지 않을 수 있습니다.

$$
L(N, D) \triangleq L(\bar{f}_{N,D}) = L(f^*) + (L(f_N) - L(f^*)) + (L(\bar{f}_{N,D}) - L(f_N)). \tag{9}
$$

식 (9)는 이상적인 손실, 모델 함수군의 제한, 유한 데이터·불완전 최적화의 차이를 더한 항등 분해입니다. 이 분해만으로 각 항이 특정 지수의 Power Law(거듭제곱 법칙)라고 증명되지는 않습니다. 원문의 두 층 신경망·확률적 최적화 논의는 함수 형태의 동기이며 Transformer 전체의 엄밀한 지수 유도가 아닙니다.

$$
L(N, D) = E + \frac{A}{N^{0.34}} + \frac{B}{D^{0.28}}, \tag{10}
$$

원문 적합 상수는 $E=1.69$, $A=406.4$, $B=410.7$입니다. $N,D$에는 십억 단위로 축약한 숫자가 아니라 <strong>파라미터·토큰의 실제 개수</strong>를 넣습니다. 표시된 지수 0.34·0.28은 반올림된 값이므로 이것만으로 Table 2의 마지막 소수 자리까지 재현하려 하지 않습니다.

$$
\min_{a,b,e,\alpha,\beta} \sum_{\text{Run } i} \text{Huber}_\delta \left( \text{LSE}(a - \alpha \log N_i, b - \beta \log D_i, e) - \log L_i \right), \tag{11}
$$

LSE(Log-Sum-Exp, 로그 합 지수)는 양의 세 항을 로그 영역에서 안정적으로 합치는 연산입니다. 이 절의 소문자 $a,b,e$는 $A=e^a,B=e^b,E=e^e$의 로그 상수이며, §3의 계산량 배분 지수 $a,b$와 이름만 같습니다. 원문은 여러 초기값에서 L-BFGS를 실행하고 Huber의 $\delta$를 조절합니다. 큰 $\delta$는 작은 계산량 실행에 지나치게 맞춰 큰 실행 예측을 악화시켰다고 보고합니다. [원문 부록 D.1–2](https://arxiv.org/pdf/2203.15556v1#page=24)

### D.3. Predicted compute optimal frontier for all three methods

<figure>
  <a href="/images/papers/hoffmann-2022/table-A3.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A3.png" width="1494" height="528" alt="Table A3. Approach 2·3의 예산 예측" loading="lazy" /></a>
  <figcaption>Table A3. Approach 2·3의 예산 예측 — Hoffmann et al. (2022), arXiv v1, p. 26. <a href="https://arxiv.org/pdf/2203.15556v1#page=26">원문</a> · <a href="/images/papers/hoffmann-2022/table-A3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

동일한 파라미터 수에서 각 방법이 권하는 FLOPs와 토큰을 나란히 표시합니다. 큰 모델에서 Approach 3은 더 많은 토큰을 요구합니다. 원표의 175B·Approach 3은 12.0T 토큰인데 FLOPs를 1.26×10²⁴로 적습니다. $6ND$로 계산하면 1.26×10²⁵이므로 지수 불일치가 있습니다. 원본은 보존하되 해당 FLOPs 셀을 일관된 예산 계산값으로 사용하지 않습니다.
<figure>
  <a href="/images/papers/hoffmann-2022/figure-A3.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-A3.png" width="1494" height="696" alt="Figure A3. 같은 계산 예산의 모델·토큰 배분" loading="lazy" /></a>
  <figcaption>Figure A3. 같은 계산 예산의 모델·토큰 배분 — Hoffmann et al. (2022), arXiv v1, p. 26. <a href="https://arxiv.org/pdf/2203.15556v1#page=26">원문</a> · <a href="/images/papers/hoffmann-2022/figure-A3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축은 토큰 수, 세로축은 파라미터 수입니다. 각 선의 점은 주어진 계산 예산에서 권하는 배분이고 별은 실제 대형 모델입니다. Approach 3은 큰 예산에서 더 작은 모델과 더 많은 토큰 쪽으로 기웁니다. 예측점과 실제 학습 모델을 구분합니다.

세 접근의 <strong>같은 방향성</strong>과 <strong>다른 규모 예측</strong>을 함께 읽습니다. 특히 큰 규모에서 방법별 토큰 요구량이 벌어지므로 “약 20토큰”이라는 한 줄로 이 표 전체를 대체할 수 없습니다.

### D.4. Small-scale comparison to Kaplan et al. (2020)

<figure>
  <a href="/images/papers/hoffmann-2022/figure-A4.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-A4.png" width="1494" height="675" alt="Figure A4. 작은 규모에서 Kaplan 처방과 직접 비교" loading="lazy" /></a>
  <figcaption>Figure A4. 작은 규모에서 Kaplan 처방과 직접 비교 — Hoffmann et al. (2022), arXiv v1, p. 27. <a href="https://arxiv.org/pdf/2203.15556v1#page=27">원문</a> · <a href="/images/papers/hoffmann-2022/figure-A4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 학습 시퀀스 수, 오른쪽은 FLOPs에 따른 손실입니다. 주황색 4.74B 모델과 파란색 2.80B 모델을 같은 최종 계산 예산에서 비교합니다. 큰 모델이 적은 시퀀스로 학습하더라도, 끝점의 손실은 더 작은 모델을 오래 학습한 쪽이 낮습니다.

$10^{21}$ FLOPs에서 Kaplan 기반 예측은 4.68B, Approach 1은 2.86B입니다. 실제 비교 모델은 각각 4.74B·2.80B로 근접하게 구성했습니다. 두 모델에 0.5M 토큰 배치, 최대 학습률 $1.5\times10^{-4}$, 10배 감쇠와 같은 깊이/너비 비율을 사용해 혼동 요인을 줄였습니다. 이 비교는 예측 모델 크기를 단순히 바꿔 적은 표가 아니라 실제 학습 결과입니다. [원문 부록 D.3–4](https://arxiv.org/pdf/2203.15556v1#page=26)

## E. Curvature of the FLOP-loss frontier

<figure>
  <a href="/images/papers/hoffmann-2022/figure-A5.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-A5.png" width="1494" height="675" alt="Figure A5. 효율 경계의 곡률" loading="lazy" /></a>
  <figcaption>Figure A5. 효율 경계의 곡률 — Hoffmann et al. (2022), arXiv v1, p. 28. <a href="https://arxiv.org/pdf/2203.15556v1#page=28">원문</a> · <a href="/images/papers/hoffmann-2022/figure-A5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

학습 곡선의 최저 손실 경계에서 앞·중간·뒤 3분의 1을 각각 주황·초록·파랑 직선으로 적합합니다. 기울기가 달라져 작은 규모의 관계를 끝없이 직선으로 연장하는 가정에 의문을 제기합니다. 곡률을 반영한 새 법칙을 여기서 완성한 것은 아닙니다.

관측 구간에 따라 적합선이 달라지면 작은 모델로 얻은 지수를 매우 큰 모델까지 적용할 때 오차가 생깁니다. 저자들은 이 곡률을 최종 법칙에 반영하지 않고 후속 과제로 남겼습니다. 더 작은 모델이 최적일 수도 있다는 말은 이 관측에서 나온 전망입니다.

## F. FLOPs computation

이 논문은 Embedding(임베딩) 행렬의 파라미터와 계산도 포함합니다. 원문의 항별 계산을 읽기 쉽게 아래에서 $s$=시퀀스 길이, $v$=어휘 수, $d$=모델 너비, $k$=Key 차원, $h$=Head 수, $f$=Feed-forward 너비, $\ell$=층 수로 줄여 적습니다. 아래 식들은 <strong>원문의 번호 없는 연산량 항을 재표기</strong>한 것입니다.

$$
\begin{aligned}
F_{\mathrm{embed}}&=2svd,\\
F_{\mathrm{QKV}}&=2\cdot3sd(kh),\\
F_{\mathrm{scores}}&=2s^2(kh),\\
F_{\mathrm{softmax}}&=3hs^2,\\
F_{\mathrm{weighted\ sum}}&=2s^2(kh),\\
F_{\mathrm{projection}}&=2s(kh)d,\\
F_{\mathrm{FFN}}&=2s(df+df),\\
F_{\mathrm{logits}}&=2sdv.
\end{aligned}
$$

원문의 “Softmax @ query reductions”라는 명칭은 가중합 항으로 설명했습니다. 행렬의 곱셈·덧셈 비용을 2로 세고 층마다 Attention과 Feed-forward 계산을 더합니다.

$$
\begin{aligned}
F_{\mathrm{forward}}&=F_{\mathrm{embed}}+\ell(F_{\mathrm{QKV}}+F_{\mathrm{scores}}+F_{\mathrm{softmax}}+F_{\mathrm{weighted\ sum}}+F_{\mathrm{projection}}+F_{\mathrm{FFN}})+F_{\mathrm{logits}},\\
F_{\mathrm{backward}}&\approx2F_{\mathrm{forward}},\qquad
C\approx\frac{D}{s}\,3F_{\mathrm{forward}}\approx6ND.
\end{aligned}
$$

마지막 $D/s$ 환산은 시퀀스당 비용을 전체 학습 토큰의 비용으로 연결한 설명입니다. FLOPs는 실제 장치 이용률과 통신 시간을 포함하는 벽시계 시간이 아닙니다.

<figure>
  <a href="/images/papers/hoffmann-2022/table-A4.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A4.png" width="1494" height="345" alt="Table A4. 상세 연산량과 6ND 근사의 비교" loading="lazy" /></a>
  <figcaption>Table A4. 상세 연산량과 6ND 근사의 비교 — Hoffmann et al. (2022), arXiv v1, p. 28. <a href="https://arxiv.org/pdf/2203.15556v1#page=28">원문</a> · <a href="/images/papers/hoffmann-2022/table-A4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

각 행은 모델 크기·층 수·너비·Feed-forward·Head·Key/Query 차원이며 마지막 열은 상세 FLOPs를 $6ND$로 나눈 값입니다. 범위는 0.99–1.10입니다. 이 실험 구조에서 근사가 가깝다는 결과이지, 임의의 문맥 길이나 구조에서도 항상 같은 오차라는 뜻은 아닙니다.

원문 부록은 더 상세한 계산이 $6.3\times10^{23}$ FLOPs를 주며 기존 $5.76\times10^{23}$와 다르다고 명시합니다. 반면 본문 그림은 Gopher 기준으로 $5.76\times10^{23}$을 사용합니다. <strong>본문 그림의 예산과 부록의 상세 집계값을 구분</strong>하며 임의로 하나의 숫자로 통일하지 않습니다. [원문 부록 E–F](https://arxiv.org/pdf/2203.15556v1#page=27)

## G. Other differences between Chinchilla and Gopher

<figure>
  <a href="/images/papers/hoffmann-2022/figure-A6.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-A6.png" width="1494" height="399" alt="Figure A6. Optimizer와 가중치 정밀도 비교" loading="lazy" /></a>
  <figcaption>Figure A6. Optimizer와 가중치 정밀도 비교 — Hoffmann et al. (2022), arXiv v1, p. 29. <a href="https://arxiv.org/pdf/2203.15556v1#page=29">원문</a> · <a href="/images/papers/hoffmann-2022/figure-A6.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

680M 모델에서 Adam/AdamW와 고정밀 가중치 사본 유무를 조합합니다. 왼쪽은 학습 손실, 가운데는 WikiText103 Perplexity, 오른쪽은 C4 손실입니다. Chinchilla 설정의 주황색이 Gopher 설정의 초록색보다 좋으므로 대형 모델 비교가 크기·토큰만 바꾼 실험은 아님을 보여 줍니다.
<figure>
  <a href="/images/papers/hoffmann-2022/figure-A7.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/figure-A7.png" width="1494" height="402" alt="Figure A7. Adam과 AdamW의 학습 곡선" loading="lazy" /></a>
  <figcaption>Figure A7. Adam과 AdamW의 학습 곡선 — Hoffmann et al. (2022), arXiv v1, p. 29. <a href="https://arxiv.org/pdf/2203.15556v1#page=29">원문</a> · <a href="/images/papers/hoffmann-2022/figure-A7.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

파란색은 417M, 초록색은 1.4B 모델이며 실선·점선이 Optimizer를 구분합니다. C4 손실, WikiText103 Perplexity, LAMBADA 정확도를 함께 비교합니다. 학습 후반에 AdamW의 이점이 나타나므로 중간 지점만으로 Optimizer를 평가하면 놓칠 수 있습니다.

Optimizer(최적화 알고리즘)와 가중치 사본 정밀도를 바꾼 소규모 비교는 추가 설정 변경도 성능에 기여할 수 있음을 보여 줍니다. 따라서 대형 Chinchilla의 개선을 “모델을 정확히 네 배 줄인 효과” 하나로 정량 분해하지 않습니다. 원문은 AdamW가 Cosine 주기의 약 80%를 지나서야 Adam보다 좋은 학습 성능을 보일 수 있다고 설명합니다. [원문 부록 G](https://arxiv.org/pdf/2203.15556v1#page=29)

## H. Results

### H.1. The Pile

<figure>
  <a href="/images/papers/hoffmann-2022/table-A5.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A5.png" width="1494" height="876" alt="Table A5. The Pile의 전체 하위 집합 결과" loading="lazy" /></a>
  <figcaption>Table A5. The Pile의 전체 하위 집합 결과 — Hoffmann et al. (2022), arXiv v1, p. 30. <a href="https://arxiv.org/pdf/2203.15556v1#page=30">원문</a> · <a href="/images/papers/hoffmann-2022/table-A5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

단위는 Bits per Byte(바이트당 비트 수)이고 낮을수록 좋습니다. Chinchilla는 Gopher보다 19개 표시 집합 모두 낮지만 Jurassic-1은 dm_mathematics와 ubuntu_irc에서 더 낮습니다. 미보고 값은 대시로 보존합니다. 원표 머리글의 Jurassic-1 170B는 본문의 178B와 다릅니다.

평가 손실의 단위를 토큰 대신 바이트로 맞추면 Tokenizer(토크나이저)가 다른 모델의 언어 모델링 결과를 비교하는 데 도움이 됩니다. 다만 학습 자료·중복·모델 조건까지 같아지는 것은 아닙니다.

### H.2. MMLU

<figure>
  <a href="/images/papers/hoffmann-2022/table-A6.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A6.png" width="1494" height="1140" alt="Table A6. MMLU 57개 과제 전체" loading="lazy" /></a>
  <figcaption>Table A6. MMLU 57개 과제 전체 — Hoffmann et al. (2022), arXiv v1, p. 31. <a href="https://arxiv.org/pdf/2203.15556v1#page=31">원문</a> · <a href="/images/papers/hoffmann-2022/table-A6.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

좌우는 하나의 과제 목록을 나눈 패널이며 각각 Chinchilla·Gopher 정확도를 표시합니다. Astronomy는 73.0 대 65.8, College Mathematics는 32.0 대 37.0처럼 개선과 악화가 함께 있습니다. Machine Learning과 Medical Genetics는 동점이며, 원문이 지적한 네 악화 과제도 생략하지 않습니다.

각 행은 특정 과목의 정확도입니다. 전체 평균만으로 대학 수학이나 형식 논리 능력도 동일하게 개선됐다고 추정하지 않습니다. Figure 6의 상대 개선율과 이 표의 원래 정확도를 대응해서 읽습니다.

### H.3. Winogender Setup

문장 속 대명사를 남성·여성·중립형으로 바꾸고, 그 대명사가 어느 등장인물을 가리키는지에 대한 완성 확률을 비교합니다. 원문의 도서관 예에서는 사서와 아이 중 누구를 가리키는지를 판단합니다. 같은 문장의 대명사 성별을 바꿔도 올바른 지시 대상을 찾아야 한다는 평가 설계이며, 임의의 생성 문장에서 얻은 편향 점수와 다릅니다.

### H.4. BIG-bench

<figure>
  <a href="/images/papers/hoffmann-2022/table-A7.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A7.png" width="1494" height="1209" alt="Table A7. BIG-bench 62개 과제 전체" loading="lazy" /></a>
  <figcaption>Table A7. BIG-bench 62개 과제 전체 — Hoffmann et al. (2022), arXiv v1, p. 35. <a href="https://arxiv.org/pdf/2203.15556v1#page=35">원문</a> · <a href="/images/papers/hoffmann-2022/table-A7.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

두 패널은 각각 과제명·Chinchilla·Gopher 정확도를 담습니다. Crash Blossom, Dark Humor Detection, Mathematical Induction, Logical Args에서는 Chinchilla가 낮습니다. 큰 평균 개선과 개별 과제 실패가 동시에 존재합니다. 과제별 척도와 표의 전체 행을 원문 그대로 보존합니다.

전체 표는 과제별 편차와 실패 사례를 남기기 위해 두 패널 모두 제공합니다. 원문의 BIG-bench 부분집합 결과이며, 미평가 과제의 성능을 채우지 않습니다. [원문 부록 H](https://arxiv.org/pdf/2203.15556v1#page=30)

## I. Model Card

<strong>Model Card(모델 설명서)</strong>는 결과뿐 아니라 목적·데이터·평가·제약을 기록합니다. 원문 Table A8은 PDF 31–34쪽에 걸쳐 이어집니다. 아래 네 조각은 <strong>같은 표의 연속 부분</strong>이며 행을 생략하지 않았습니다.

<figure>
  <a href="/images/papers/hoffmann-2022/table-A8-1.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A8-1.png" width="1494" height="645" alt="Table A8 · 연속 부분 1/4. Chinchilla Model Card의 전체 연속 표" loading="lazy" /></a>
  <figcaption>Table A8 · 연속 부분 1/4. Chinchilla Model Card의 전체 연속 표 — Hoffmann et al. (2022), arXiv v1, p. 31. <a href="https://arxiv.org/pdf/2203.15556v1#page=31">원문</a> · <a href="/images/papers/hoffmann-2022/table-A8-1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

첫 부분은 개발 조직 DeepMind, 모델 시점 2022년 3월, Autoregressive Transformer(자기회귀 트랜스포머)라는 모델 유형과 연구 목적을 기록합니다. 해당 시점의 문서이며 현재 공개 상태를 설명하는 공지가 아닙니다.

<figure>
  <a href="/images/papers/hoffmann-2022/table-A8-2.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A8-2.png" width="1494" height="1956" alt="Table A8 · 연속 부분 2/4. Chinchilla Model Card의 전체 연속 표" loading="lazy" /></a>
  <figcaption>Table A8 · 연속 부분 2/4. Chinchilla Model Card의 전체 연속 표 — Hoffmann et al. (2022), arXiv v1, p. 32. <a href="https://arxiv.org/pdf/2203.15556v1#page=32">원문</a> · <a href="/images/papers/hoffmann-2022/table-A8-2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

둘째 부분은 당시 DeepMind 연구자용이라는 사용자 범위, 영어 학습·방언별 성능 차이, 손실·정확도·Exact Match(정확 일치)·편향·유해성 지표를 담습니다. 대형 Chinchilla를 여러 번 반복 학습해 불확실성을 측정하지 못했다는 제약도 포함합니다.

<figure>
  <a href="/images/papers/hoffmann-2022/table-A8-3.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A8-3.png" width="1494" height="2046" alt="Table A8 · 연속 부분 3/4. Chinchilla Model Card의 전체 연속 표" loading="lazy" /></a>
  <figcaption>Table A8 · 연속 부분 3/4. Chinchilla Model Card의 전체 연속 표 — Hoffmann et al. (2022), arXiv v1, p. 33. <a href="https://arxiv.org/pdf/2203.15556v1#page=33">원문</a> · <a href="/images/papers/hoffmann-2022/table-A8-3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

셋째 부분은 평가 데이터, SentencePiece 어휘 32,000개와 NFKC 미적용, 학습 자료, 정량 분석을 설명합니다. 성별·직업 연결과 유해 텍스트 생성 가능성을 함께 기록합니다. Model Card의 더 넓은 위험 서술을 모두 이 논문 본문의 새 실험 결과로 간주하지 않습니다.

<figure>
  <a href="/images/papers/hoffmann-2022/table-A8-4.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A8-4.png" width="1494" height="1065" alt="Table A8 · 연속 부분 4/4. Chinchilla Model Card의 전체 연속 표" loading="lazy" /></a>
  <figcaption>Table A8 · 연속 부분 4/4. Chinchilla Model Card의 전체 연속 표 — Hoffmann et al. (2022), arXiv v1, p. 34. <a href="https://arxiv.org/pdf/2203.15556v1#page=34">원문</a> · <a href="/images/papers/hoffmann-2022/table-A8-4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

마지막 부분은 교차 집단 편향을 조사하지 않았다는 범위와 데이터·사용 목적의 제약을 밝힙니다. 성능 향상과 안전성 검증은 같은 주장이 아닙니다. 이 표는 원문 저자들이 명시한 모델의 범위를 이해하는 자료입니다. [원문 Table A8](https://arxiv.org/pdf/2203.15556v1#page=31)

## J. List of trained models

<figure>
  <a href="/images/papers/hoffmann-2022/table-A9.png" target="_blank" rel="noopener"><img src="/images/papers/hoffmann-2022/table-A9.png" width="1494" height="1740" alt="Table A9. 학습한 모델들의 전체 구성" loading="lazy" /></a>
  <figcaption>Table A9. 학습한 모델들의 전체 구성 — Hoffmann et al. (2022), arXiv v1, p. 36. <a href="https://arxiv.org/pdf/2203.15556v1#page=36">원문</a> · <a href="/images/papers/hoffmann-2022/table-A9.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

열은 파라미터 수(백만 단위), 모델 너비, Feed-forward 너비, Key/Value 차원, Head 수, 층 수입니다. 목록은 44M부터 16,183M까지이며 같은 구성이 여러 학습 길이·학습률로 반복 실행될 수 있습니다. 따라서 행 수가 400여 학습 실행 수와 같지 않습니다. 초록의 약 70M–16B는 대표 범위이고 이 상세 목록에는 더 작은 모델도 있습니다.

원문 끝의 이 표는 요약된 메타데이터에서 빠지기 쉬운 구성 목록입니다. 약 400회의 실행은 여러 크기와 학습 길이를 조합한 것이며, 모두 Chinchilla 규모의 학습을 수행한 것은 아닙니다. 모델 구조·학습 토큰·스케줄을 함께 바꾸어 비교했다는 이 논문의 실험 설계를 마지막으로 확인할 수 있습니다. [원문 부록 J](https://arxiv.org/pdf/2203.15556v1#page=34)
