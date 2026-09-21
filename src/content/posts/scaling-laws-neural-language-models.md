---
title: 'Scaling Laws for Neural Language Models — 절별 해설'
description: 'Kaplan 등의 2020년 Scaling Laws를 Figure 24개, Table 6개와 수식으로 읽습니다. 모델·데이터·계산 예산의 관계와 배치 보정, 관측과 외삽의 차이를 설명합니다.'
publishedAt: '2026-09-21'
topic: llm-tech
category: pretraining
tags: ['Scaling Laws', 'Language Models', 'Compute Efficiency', 'Training', '논문 해설']
kind: research-review
readingTime: 40
featured: false
draft: false
sourceLinks:
  - title: 'Kaplan et al. · arXiv v1 · 2020-01-23'
    url: https://arxiv.org/abs/2001.08361v1
    kind: 원문
  - title: '검토 PDF · 본문과 부록 전체'
    url: https://arxiv.org/pdf/2001.08361v1
    kind: PDF
takeaway: '이 실험에서는 모델·데이터·계산량과 손실 사이에 규칙적인 관계가 나타난다. 계산 예산의 최적 배분은 데이터 제한과 배치 보정에 의존하며, 관측 범위 밖의 예측은 외삽이다.'
---

Jared Kaplan, Sam McCandlish 외 저자들의 논문입니다. **최초 공개와 검토 판본은 2020-01-23의 arXiv v1, 이 해설 게시일은 2026-09-21**입니다. 아래 결과는 2020년의 모델·데이터·학습 설정에서 얻은 경험적 관계로 읽습니다. [판본 기록](https://arxiv.org/abs/2001.08361v1)

원문 절 순서에 따라 본문과 부록 A–D를 해설합니다. PDF의 **Figure 1–24와 Table 1–6, 번호가 붙은 수식 50개**를 유지합니다. 표는 원본과 읽기용 해설을 함께 제공합니다. 초록 페이지의 “15 figures”와 달리 검토한 30쪽 PDF에는 부록까지 24개의 번호 있는 그림이 있습니다. 참고문헌 목록과 감사의 글은 재수록하지 않습니다. [전체 PDF](https://arxiv.org/pdf/2001.08361v1)

## Abstract

공부에 쓸 시간이 정해졌을 때 교재를 늘릴지, 학습 도구를 바꿀지, 같은 내용을 더 반복할지 선택하는 상황을 떠올릴 수 있습니다. 이 비유에서 출발하되, 실제 논문은 <strong>Language Model(언어 모델)</strong>의 크기·학습 데이터·연산량을 수치로 비교합니다.

핵심 결론은 <strong>Cross-Entropy Loss(교차 엔트로피 손실)</strong>가 이 자원들과 <strong>Power Law(거듭제곱 법칙)</strong> 관계를 보인다는 것입니다. 저자들의 실험에서는 큰 모델의 <strong>Sample Efficiency(샘플 효율)</strong>가 높아, 제한된 학습 계산량을 효율적으로 쓰려면 큰 모델을 골라 완전 수렴 전에 멈추는 편이 유리했습니다. 손실 감소를 정답률 상승으로 바꾸어 읽거나, 이 전략을 현재 모든 모델의 최적 처방으로 일반화하지 않습니다. [원문 초록](https://arxiv.org/pdf/2001.08361v1#page=1)

## 1. Introduction

### 1.1. Summary

여러 규모의 모델을 학습한 결과, 다른 자원이 충분한 구간에서는 모델·데이터·계산량 하나를 늘리는 효과를 간단한 함수로 설명할 수 있었습니다. 모델 형태의 세부 조정보다 전체 비임베딩 파라미터 수가 강한 예측 변수였고, 데이터가 제한되면 큰 모델의 개선은 포화되었습니다.

<figure>
  <a href="/images/papers/kaplan-2020/figure-1.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-1.png" alt="Figure 1. 모델·데이터·계산량과 손실. 세 패널은 각각 계산량, 데이터 토큰 수, Embedding을 제외한 파라미터 수와 Test Loss의 관계를 보여 줍니다. 로그 축에서 직선에 가까운 구간을 Power Law로 맞춥니다. 한 패널의 계수를 다른 제한 조건에 그대로 적용하면 안 됩니다." loading="lazy" /></a>
  <figcaption>Figure 1. 모델·데이터·계산량과 손실 — Kaplan et al. (2020), arXiv v1, p. 3. <a href="https://arxiv.org/pdf/2001.08361v1#page=3">원문</a> · <a href="/images/papers/kaplan-2020/figure-1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

세 패널은 각각 계산량, 데이터 토큰 수, Embedding을 제외한 파라미터 수와 Test Loss의 관계를 보여 줍니다. 로그 축에서 직선에 가까운 구간을 Power Law로 맞춥니다. 한 패널의 계수를 다른 제한 조건에 그대로 적용하면 안 됩니다.
<figure>
  <a href="/images/papers/kaplan-2020/figure-2.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-2.png" alt="Figure 2. 샘플 효율과 계산 효율. 왼쪽에서 큰 모델은 같은 목표 손실에 더 적은 토큰으로 도달합니다. 오른쪽은 계산 예산별 최적 모델 크기를 보여 줍니다. 토큰 하나의 처리 비용은 모델 크기에 따라 커지므로 두 효율은 구분해야 합니다." loading="lazy" /></a>
  <figcaption>Figure 2. 샘플 효율과 계산 효율 — Kaplan et al. (2020), arXiv v1, p. 4. <a href="https://arxiv.org/pdf/2001.08361v1#page=4">원문</a> · <a href="/images/papers/kaplan-2020/figure-2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽에서 큰 모델은 같은 목표 손실에 더 적은 토큰으로 도달합니다. 오른쪽은 계산 예산별 최적 모델 크기를 보여 줍니다. 토큰 하나의 처리 비용은 모델 크기에 따라 커지므로 두 효율은 구분해야 합니다.
<figure>
  <a href="/images/papers/kaplan-2020/figure-3.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-3.png" alt="Figure 3. 계산 예산의 배분. 계산량이 늘 때 모델 크기, 배치 크기, 순차 단계 수가 어떻게 변하는지 요약합니다. 큰 모델을 선택하되 끝까지 수렴시키지 않는 전략이며, 각 지수의 실험 조건은 §6에서 설명합니다." loading="lazy" /></a>
  <figcaption>Figure 3. 계산 예산의 배분 — Kaplan et al. (2020), arXiv v1, p. 4. <a href="https://arxiv.org/pdf/2001.08361v1#page=4">원문</a> · <a href="/images/papers/kaplan-2020/figure-3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

계산량이 늘 때 모델 크기, 배치 크기, 순차 단계 수가 어떻게 변하는지 요약합니다. 큰 모델을 선택하되 끝까지 수렴시키지 않는 전략이며, 각 지수의 실험 조건은 §6에서 설명합니다.

이때 <strong>Compute Efficiency(계산 효율)</strong>와 Sample Efficiency(샘플 효율)는 서로 다릅니다. 큰 모델은 적은 토큰으로 배울 수 있지만 토큰 하나를 처리하는 데 더 많은 연산을 씁니다. 논문의 최적화는 이 두 효과를 합친 학습 손실을 대상으로 합니다. 실제 서비스의 추론 비용이나 메모리 사용량은 목적함수에 포함하지 않습니다.

### 1.2. Summary of Scaling Laws

아래 세 법칙은 각각 다른 병목을 분리합니다. $N$만 바꿀 때는 데이터와 학습 시간이 충분해야 하고, $D$만 바꿀 때는 모델이 충분히 크며 적절히 종료되어야 합니다. $C_{\min}$은 배치의 비효율을 보정한 최소 계산량입니다.

$$
L(N) = (N_c/N)^{\alpha_N}; \quad \alpha_N \sim 0.076, \quad N_c \sim 8.8 \times 10^{13} \text{ (non-embedding parameters)} \tag{1.1}
$$
$$
L(D) = (D_c/D)^{\alpha_D}; \quad \alpha_D \sim 0.095, \quad D_c \sim 5.4 \times 10^{13} \text{ (tokens)} \tag{1.2}
$$
$$
L(C_{\min}) = (C_c^{\min}/C_{\min})^{\alpha_C^{\min}}; \quad \alpha_C^{\min} \sim 0.050, \quad C_c^{\min} \sim 3.1 \times 10^8 \text{ (PF-days)} \tag{1.3}
$$

예를 들어 $N$을 두 배로 하면 첫 식은 손실이 $2^{-0.076}\approx0.949$배가 된다고 예측합니다. 이는 약 5.1%의 **손실 감소**입니다. $N_c,D_c,C_c$는 적합의 척도 상수이며 “실제로 학습한 최대 크기”가 아닙니다. Tokenization(토큰화)이 바뀌면 수치의 의미도 달라집니다.

$$
B_{\text{crit}}(L) = \frac{B_*}{L^{1/\alpha_B}}, \quad B_* \sim 2 \cdot 10^8 \text{ tokens}, \quad \alpha_B \sim 0.21 \tag{1.4}
$$

<strong>Critical Batch Size(임계 배치 크기)</strong>는 병렬 처리로 단계 수를 줄이는 이득과 추가 계산 낭비가 갈리는 척도입니다. $B_*$는 토큰 수 단위이며 목표 손실이 낮을수록 임계 배치가 커집니다.

$$
L(N, D) = \left[ \left( \frac{N_c}{N} \right)^{\frac{\alpha_N}{\alpha_D}} + \frac{D_c}{D} \right]^{\alpha_D} \tag{1.5}
$$
$$
L(N, S) = \left( \frac{N_c}{N} \right)^{\alpha_N} + \left( \frac{S_c}{S_{\min}(S)} \right)^{\alpha_S} \tag{1.6}
$$

식 (1.5)는 모델 부족과 데이터 부족을 결합합니다. 식 (1.6)의 첫 항은 해당 모델이 충분히 학습했을 때의 한계, 둘째 항은 아직 학습을 덜 한 데 따른 손실입니다. $S_{\min}$은 관측 단계 수 자체가 아니라 배치 보정된 최소 순차 단계 수입니다.

<figure>
  <a href="/images/papers/kaplan-2020/figure-4.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-4.png" alt="Figure 4. 데이터와 학습 단계의 결합 효과. 왼쪽은 데이터 크기에 따른 모델 성능의 포화, 오른쪽은 학습 도중 손실과 모델 크기의 관계입니다. 곡선은 단일 변수 법칙에 데이터 부족 또는 학습 부족 항을 추가해야 함을 보여 줍니다." loading="lazy" /></a>
  <figcaption>Figure 4. 데이터와 학습 단계의 결합 효과 — Kaplan et al. (2020), arXiv v1, p. 5. <a href="https://arxiv.org/pdf/2001.08361v1#page=5">원문</a> · <a href="/images/papers/kaplan-2020/figure-4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 데이터 크기에 따른 모델 성능의 포화, 오른쪽은 학습 도중 손실과 모델 크기의 관계입니다. 곡선은 단일 변수 법칙에 데이터 부족 또는 학습 부족 항을 추가해야 함을 보여 줍니다.
$$
N \propto C^{\alpha_C^{\min}/\alpha_N}, \quad B \propto C^{\alpha_C^{\min}/\alpha_B}, \quad S \propto C^{\alpha_C^{\min}/\alpha_S}, \quad D = B \cdot S \tag{1.7}
$$
$$
\alpha_C^{\min} = 1 / (1/\alpha_S + 1/\alpha_B + 1/\alpha_N) \tag{1.8}
$$

세 자원의 지수가 결합되면서 계산량에 따른 손실 지수가 나옵니다. 식 (1.7)의 $D=BS$는 처리한 토큰 수를 뜻하며, 고유한 데이터셋 크기와 같으려면 재사용하지 않는 조건이 필요합니다. 요약 식과 실제 추정치의 차이는 §4–6의 적합 조건으로 설명합니다. [원문 §1](https://arxiv.org/pdf/2001.08361v1#page=2)

### 1.3. Notation

|기호|뜻과 주의점|
|---|---|
|$L$|평가 Cross-Entropy Loss(교차 엔트로피 손실), nats/token. 낮을수록 좋습니다.|
|$N$|Embedding(임베딩)을 제외한 파라미터 수.|
|$D$|고유 학습 데이터의 토큰 수. 반복 처리량 $BS$와 구분합니다.|
|$B,S$|한 배치의 토큰 수와 Parameter Update(파라미터 갱신) 단계 수.|
|$C$|학습 연산량. 근사식은 $6NBS$.|
|$C_{\min},S_{\min}$|배치에 따른 비효율을 제거해 추정한 최소 계산량·단계 수.|

**1 PF-day는 $8.64\times10^{19}$ FLOPs**입니다. 특정 GPU 한 대의 하루 처리량이나 실제 학습 소요 시간과 같지 않습니다.

## 2. Background and Methods

### 2.1. Parameter and Compute Scaling of Transformers

<strong>Transformer(트랜스포머)</strong>의 층 수와 너비를 이용하면 파라미터 수를 다음처럼 근사할 수 있습니다. 표준 비율 $d_{\mathrm{ff}}=4d_{\mathrm{model}}$, $d_{\mathrm{attn}}=d_{\mathrm{model}}$을 대입하면 두 번째 줄이 됩니다.

$$
\begin{aligned} N &\approx 2d_{\text{model}}n_{\text{layer}}(2d_{\text{attn}} + d_{\text{ff}}) \\ &= 12n_{\text{layer}}d_{\text{model}}^2 \quad \text{with the standard} \quad d_{\text{attn}} = d_{\text{ff}}/4 = d_{\text{model}} \end{aligned} \tag{2.1}
$$
$$
C_{\text{forward}} \approx 2N + 2n_{\text{layer}}n_{\text{ctx}}d_{\text{model}} \tag{2.2}
$$

식 (2.2)는 토큰당 Forward Pass(순전파) 계산량입니다. 문맥 관련 항이 작은 조건에서는 약 $2N$이고, Backward Pass(역전파)까지 합쳐 약 $6N$ FLOPs/token을 사용합니다. 긴 문맥에서 이 항을 무조건 버리면 안 됩니다.

<figure>
  <a href="/images/papers/kaplan-2020/table-1.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/table-1.png" alt="Table 1. 원문 표의 모든 행과 열. 아래 문단에서 조건과 수치를 해설합니다." loading="lazy" /></a>
  <figcaption>Table 1. 원문 표 — Kaplan et al. (2020), p. 7. <a href="https://arxiv.org/pdf/2001.08361v1#page=7">출처</a> · <a href="/images/papers/kaplan-2020/table-1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

Table 1은 Embedding, Q/K/V 투영, Attention Mask, 출력 투영, Feed-forward, De-embedding을 구분합니다. 총계는 비임베딩 부분이며, 비선형 함수·편향·정규화 등 작은 항을 생략합니다. 원표의 Project 행 FLOPs에는 $d_{\mathrm{embd}}$ 표기가 있지만 별도 정의가 명확하지 않습니다. 여기서는 원표를 보존하고 식 (2.1)–(2.2)의 $d_{\mathrm{model}}$ 기준으로 계산을 설명합니다.

### 2.2. Training Procedures

기본 실험은 길이 1024 시퀀스 512개, 즉 $2^{19}$ 토큰의 고정 배치로 최대 250,000 단계를 학습합니다. 보통 Adam을 사용하고 1B보다 큰 모델에는 Adafactor를 사용합니다. 3,000단계 Warmup(준비 구간) 뒤 Cosine Decay(코사인 감쇠)를 적용합니다. 데이터 제한 실험에서는 10% Dropout(드롭아웃)과 평가 손실 기준 Early Stopping(조기 종료)을 사용합니다.

### 2.3. Datasets

학습 자료 WebText2는 약 2,030만 문서, 96GB, 162억 단어, 229억 토큰입니다. 그중 약 6.6억 토큰을 평가용으로 남겨 학습에는 약 220억 토큰을 씁니다. 어휘 50,257개의 BPE(Byte Pair Encoding, 바이트 쌍 인코딩)를 사용합니다. 다른 분포로의 일반화 평가는 별도 데이터로 수행하며, 그 데이터를 모두 학습에 섞었다는 뜻은 아닙니다. [원문 §2](https://arxiv.org/pdf/2001.08361v1#page=6)

## 3. Empirical Results and Basic Power Laws

### 3.1. Approximate Transformer Shape and Hyperparameter Independence

비임베딩 파라미터 수를 고정하고 너비·깊이·Head 구성을 바꾸면 넓은 범위에서 손실 변화는 비교적 작았습니다. 한 요소를 바꿀 때 다른 차원을 함께 조절해 전체 파라미터 수를 맞춥니다. 따라서 이는 구조의 영향이 전혀 없다는 결론이 아니라, 이 비교 범위에서 크기가 강한 설명 변수라는 관측입니다.

<figure>
  <a href="/images/papers/kaplan-2020/figure-5.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-5.png" alt="Figure 5. 구조 형태와 하이퍼파라미터. 파라미터 수를 고정한 채 왼쪽 Feed-forward 비율, 가운데 너비/깊이 비율, 오른쪽 Attention Head 차원을 바꾼 비교입니다. 각 패널의 기준 대비 손실 변화를 읽어야 합니다. 넓은 구간에서 변화가 작지만 극단적인 형태까지 동등하다는 뜻은 아닙니다." loading="lazy" /></a>
  <figcaption>Figure 5. 구조 형태와 하이퍼파라미터 — Kaplan et al. (2020), arXiv v1, p. 8. <a href="https://arxiv.org/pdf/2001.08361v1#page=8">원문</a> · <a href="/images/papers/kaplan-2020/figure-5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

파라미터 수를 고정한 채 왼쪽 Feed-forward 비율, 가운데 너비/깊이 비율, 오른쪽 Attention Head 차원을 바꾼 비교입니다. 각 패널의 기준 대비 손실 변화를 읽어야 합니다. 넓은 구간에서 변화가 작지만 극단적인 형태까지 동등하다는 뜻은 아닙니다.

### 3.2. Performance with Non-Embedding Parameter Count N

실험 모델 범위는 768개부터 약 15억 파라미터입니다. 충분히 학습한 모델의 손실은 다음 형태로 근사됩니다. 작은 모델은 Embedding 비중이 크므로 전체 파라미터 수보다 비임베딩 수로 비교할 때 추세가 더 단순합니다.

$$
L(N) \approx \left( \frac{N_c}{N} \right)^{\alpha_N} \tag{3.1}
$$
<figure>
  <a href="/images/papers/kaplan-2020/figure-6.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-6.png" alt="Figure 6. 전체 파라미터와 비임베딩 파라미터. 왼쪽은 Embedding까지 센 수, 오른쪽은 이를 제외한 수입니다. 작은 모델에서 Embedding이 차지하는 비중 때문에 왼쪽은 곡선이 휘고, 오른쪽에서 단순한 추세가 더 잘 드러납니다." loading="lazy" /></a>
  <figcaption>Figure 6. 전체 파라미터와 비임베딩 파라미터 — Kaplan et al. (2020), arXiv v1, p. 8. <a href="https://arxiv.org/pdf/2001.08361v1#page=8">원문</a> · <a href="/images/papers/kaplan-2020/figure-6.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 Embedding까지 센 수, 오른쪽은 이를 제외한 수입니다. 작은 모델에서 Embedding이 차지하는 비중 때문에 왼쪽은 곡선이 휘고, 오른쪽에서 단순한 추세가 더 잘 드러납니다.

#### 3.2.1. Comparing to LSTMs and Universal Transformers

<strong>LSTM(Long Short-Term Memory, 장단기 기억 신경망)</strong>과 Transformer(트랜스포머)를 같은 데이터·문맥 길이로 비교합니다. 긴 문맥의 뒤쪽 위치에서 Transformer의 이점이 커집니다. 가중치를 재사용하는 Universal Transformer(유니버설 트랜스포머)는 파라미터 대비 성능과 계산량 대비 성능을 분리해 읽어야 합니다. 부록 D.2에서 재사용 횟수를 비교합니다.

<figure>
  <a href="/images/papers/kaplan-2020/figure-7.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-7.png" alt="Figure 7. LSTM과 Transformer 비교. 왼쪽은 모델 크기에 따른 손실, 오른쪽은 문맥 내 위치에 따른 토큰 손실입니다. 초반 위치에서는 차이가 작아도 뒤쪽에서는 Transformer가 문맥을 더 잘 활용합니다. 같은 데이터와 문맥 조건에서의 비교입니다." loading="lazy" /></a>
  <figcaption>Figure 7. LSTM과 Transformer 비교 — Kaplan et al. (2020), arXiv v1, p. 9. <a href="https://arxiv.org/pdf/2001.08361v1#page=9">원문</a> · <a href="/images/papers/kaplan-2020/figure-7.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 모델 크기에 따른 손실, 오른쪽은 문맥 내 위치에 따른 토큰 손실입니다. 초반 위치에서는 차이가 작아도 뒤쪽에서는 Transformer가 문맥을 더 잘 활용합니다. 같은 데이터와 문맥 조건에서의 비교입니다.

#### 3.2.2. Generalization Among Data Distributions

WebText2에서 손실이 낮아지는 모델은 다른 평가 분포에서도 대체로 개선됩니다. 다른 분포의 손실은 학습 분포 손실과 일정한 관계를 보이며 학습 중과 수렴 후에도 비슷합니다. 이는 언어 모델 손실의 분포 간 관계이며, 추론·안전성·모든 벤치마크를 직접 측정한 결과는 아닙니다.

<figure>
  <a href="/images/papers/kaplan-2020/figure-8.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-8.png" alt="Figure 8. 다른 데이터 분포로의 일반화. 왼쪽은 WebText2로 학습한 모델을 Books, Wikipedia, Common Crawl 등에서 평가한 결과입니다. 오른쪽은 학습 분포 손실과 다른 분포 손실을 대조합니다. 수렴한 점과 학습 중 궤적이 비슷한 관계를 보이지만, 모든 응용 과제의 성능을 보장하지는 않습니다." loading="lazy" /></a>
  <figcaption>Figure 8. 다른 데이터 분포로의 일반화 — Kaplan et al. (2020), arXiv v1, p. 10. <a href="https://arxiv.org/pdf/2001.08361v1#page=10">원문</a> · <a href="/images/papers/kaplan-2020/figure-8.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 WebText2로 학습한 모델을 Books, Wikipedia, Common Crawl 등에서 평가한 결과입니다. 오른쪽은 학습 분포 손실과 다른 분포 손실을 대조합니다. 수렴한 점과 학습 중 궤적이 비슷한 관계를 보이지만, 모든 응용 과제의 성능을 보장하지는 않습니다.

### 3.3. Performance with Dataset Size and Compute

데이터 실험은 약 2,200만–230억 토큰 규모를 다룹니다. 모델이 충분히 크고 데이터 제한에 맞춰 종료하면 첫 식을, 고정 배치에서 계산 예산별 가장 좋은 손실을 고르면 둘째 식을 얻습니다.

$$
L(D) \approx \left(\frac{D_c}{D}\right)^{\alpha_D} \tag{3.2}
$$
$$
L(C) \approx \left( \frac{C_c}{C} \right)^{\alpha_C} \tag{3.3}
$$

이 고정 배치 계산량 적합의 지수는 약 0.057이며, 배치 보정 후 0.050과 다릅니다. 원문의 이 절에 있는 단계 수 환산 문장에는 분모에 $N$ 대신 $S$가 들어간 표기가 있습니다. 계산은 §2의 $C\approx6NBS$에 따라 $S=C/(6NB)$로 해석합니다. [원문 §3](https://arxiv.org/pdf/2001.08361v1#page=8)

## 4. Charting the Infinite Data Limit and Overfitting

### 4.1. Proposed L(N, D) Equation

$$
L(N, D) = \left[ \left( \frac{N_c}{N} \right)^{\frac{\alpha_N}{\alpha_D}} + \frac{D_c}{D} \right]^{\alpha_D} \tag{4.1}
$$

$D\to\infty$이면 모델 크기 법칙이 남고, $N\to\infty$이면 데이터 크기 법칙이 남도록 설계한 식입니다. 또 큰 $D$에서 $1/D$에 대한 전개가 가능하도록 선택합니다. 이런 경계 조건은 함수 형태를 제안하는 이유이지, 그 함수가 유일하다는 증명은 아닙니다.

### 4.2. Results

<figure>
  <a href="/images/papers/kaplan-2020/figure-9.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-9.png" alt="Figure 9. 데이터 병목과 과적합의 정규화. 왼쪽은 데이터가 적을 때 모델을 키워도 개선이 포화되는 모습입니다. 오른쪽은 모델 크기와 데이터 크기를 하나의 조합으로 묶으면 상대 손실 증가가 한 곡선에 모이는 결과입니다. 색상별 데이터 크기와 점·적합선의 차이를 보존했습니다." loading="lazy" /></a>
  <figcaption>Figure 9. 데이터 병목과 과적합의 정규화 — Kaplan et al. (2020), arXiv v1, p. 11. <a href="https://arxiv.org/pdf/2001.08361v1#page=11">원문</a> · <a href="/images/papers/kaplan-2020/figure-9.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 데이터가 적을 때 모델을 키워도 개선이 포화되는 모습입니다. 오른쪽은 모델 크기와 데이터 크기를 하나의 조합으로 묶으면 상대 손실 증가가 한 곡선에 모이는 결과입니다. 색상별 데이터 크기와 점·적합선의 차이를 보존했습니다.
<figure>
  <a href="/images/papers/kaplan-2020/table-2.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/table-2.png" alt="Table 2. 원문 표의 모든 행과 열. 아래 문단에서 조건과 수치를 해설합니다." loading="lazy" /></a>
  <figcaption>Table 2. 원문 표 — Kaplan et al. (2020), p. 11. <a href="https://arxiv.org/pdf/2001.08361v1#page=11">출처</a> · <a href="/images/papers/kaplan-2020/table-2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

|Table 2의 결합 적합|값|
|---|---|
|$\alpha_N$|0.076|
|$\alpha_D$|0.103|
|$N_c$|$6.4\times10^{13}$|
|$D_c$|$1.8\times10^{13}$|

<strong>Overfitting(과적합)</strong>의 크기는 Train–Test 손실 차이 대신, 같은 모델에 데이터가 충분할 때의 평가 손실 대비 증가로 정의합니다. 실제 실험에서 무한 데이터를 관측한 것은 아니며 큰 데이터 실험과 적합으로 기준을 추정합니다.

$$
\delta L(N, D) \equiv \frac{L(N, D)}{L(N, \infty)} - 1 \tag{4.2}
$$
$$
\delta L \approx \left( 1 + \left( \frac{N}{N_c} \right)^{\frac{\alpha_N}{\alpha_D}} \frac{D_c}{D} \right)^{\alpha_D} - 1 \tag{4.3}
$$
$$
D \gtrsim (5 \times 10^3) N^{0.74} \tag{4.4}
$$

식 (4.4)는 실행 간 손실 변동 약 0.02 수준을 기준으로 과적합을 작게 유지하기 위한 경험적 규모입니다. **지수 0.74는 결합 적합 $0.076/0.103\approx0.738$에 대응합니다.** §1의 단일 변수 지수 $0.076/0.095=0.8$을 그대로 나눈 값과 다릅니다. 원문 요약의 수치를 하나의 동일한 적합 결과처럼 섞지 않습니다. 가장 작은 데이터에서는 한 Epoch(전체 데이터 1회 순회)가 약 40단계에 불과해 적합이 잘 맞지 않았습니다. [원문 §4](https://arxiv.org/pdf/2001.08361v1#page=10)

## 5. Scaling Laws with Model Size and Training Time

### 5.1. Adjustment for Training at Bcrit(L)

같은 목표 손실까지 필요한 처리 토큰 수를 $E=BS$라고 합시다. 작은 배치는 연산 낭비가 적지만 순차 단계가 많고, 큰 배치는 단계 수를 줄이지만 처리 토큰을 더 요구할 수 있습니다.

$$
\left(\frac{S}{S_{\min}} - 1\right) \left(\frac{E}{E_{\min}} - 1\right) = 1 \tag{5.1}
$$
$$
B_{\text{crit}}(L) \equiv \frac{E_{\min}}{S_{\min}} \tag{5.2}
$$
$$
B_{\text{crit}}(L) \approx \frac{B_*}{L^{1/\alpha_B}} \tag{5.3}
$$
<figure>
  <a href="/images/papers/kaplan-2020/figure-10.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-10.png" alt="Figure 10. 손실에 따른 임계 배치 크기. 가로축 손실이 낮아질수록 Critical Batch Size가 커집니다. 3M·85M 모델의 측정과 Noise Scale 기반 추정이 비교됩니다. 원문은 약 13% 손실 감소에 배치 크기가 대략 두 배가 된다고 설명합니다." loading="lazy" /></a>
  <figcaption>Figure 10. 손실에 따른 임계 배치 크기 — Kaplan et al. (2020), arXiv v1, p. 12. <a href="https://arxiv.org/pdf/2001.08361v1#page=12">원문</a> · <a href="/images/papers/kaplan-2020/figure-10.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축 손실이 낮아질수록 Critical Batch Size가 커집니다. 3M·85M 모델의 측정과 Noise Scale 기반 추정이 비교됩니다. 원문은 약 13% 손실 감소에 배치 크기가 대략 두 배가 된다고 설명합니다.
$$
S_{\min}(S) \equiv \frac{S}{1 + B_{\text{crit}}(L)/B} \quad (\text{minimum steps, at } B \gg B_{\text{crit}}) \tag{5.4}
$$
$$
C_{\min}(C) \equiv \frac{C}{1 + B/B_{\text{crit}}(L)} \quad (\text{minimum compute, at } B \ll B_{\text{crit}}) \tag{5.5}
$$

관측한 $S,C$를 위 식으로 보정합니다. $B=B_{\mathrm{crit}}$이면 $S=2S_{\min}$, $E=2E_{\min}$이므로 계산량도 $C=2C_{\min}$입니다. 최소 계산량과 최소 순차 단계 수는 서로 다른 배치 극한에서 얻는 척도입니다. 이 보정값을 측정한 실제 벽시계 시간으로 읽으면 안 됩니다.

### 5.2. Results for L(N, Smin) and Performance with Model Size and Compute

$$
L(N, S_{\min}) = \left(\frac{N_c}{N}\right)^{\alpha_N} + \left(\frac{S_c}{S_{\min}}\right)^{\alpha_S} \tag{5.6}
$$
<figure>
  <a href="/images/papers/kaplan-2020/figure-11.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-11.png" alt="Figure 11. 고정 계산량과 고정 단계 수의 차이. 왼쪽은 계산 예산별로 최적인 모델 크기가 달라짐을, 오른쪽은 단계 수를 고정하면 큰 모델의 이점이 유지됨을 보여 줍니다. 색상 막대는 왼쪽 계산량, 오른쪽 단계 수를 나타냅니다." loading="lazy" /></a>
  <figcaption>Figure 11. 고정 계산량과 고정 단계 수의 차이 — Kaplan et al. (2020), arXiv v1, p. 14. <a href="https://arxiv.org/pdf/2001.08361v1#page=14">원문</a> · <a href="/images/papers/kaplan-2020/figure-11.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 계산 예산별로 최적인 모델 크기가 달라짐을, 오른쪽은 단계 수를 고정하면 큰 모델의 이점이 유지됨을 보여 줍니다. 색상 막대는 왼쪽 계산량, 오른쪽 단계 수를 나타냅니다.
<figure>
  <a href="/images/papers/kaplan-2020/table-3.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/table-3.png" alt="Table 3. 원문 표의 모든 행과 열. 아래 문단에서 조건과 수치를 해설합니다." loading="lazy" /></a>
  <figcaption>Table 3. 원문 표 — Kaplan et al. (2020), p. 14. <a href="https://arxiv.org/pdf/2001.08361v1#page=14">출처</a> · <a href="/images/papers/kaplan-2020/table-3.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

Table 3은 $\alpha_N=0.077$, $\alpha_S=0.76$, $N_c=6.5\times10^{13}$, $S_c=2.1\times10^3$을 제시합니다. 모델 한계 항과 학습 부족 항을 더한 간단한 모형입니다. 초기 Warmup(준비 구간)·과도 상태를 지나 Power Law(거듭제곱 법칙) 구간에 들어간 학습 곡선에 적용하며, 학습 첫 순간까지 설명하는 식은 아닙니다.

### 5.3. Lower Bound on Early Stopping Step

$$
S_{\text{stop}}(N, D) \gtrsim \frac{S_c}{[L(N, D) - L(N, \infty)]^{1/\alpha_S}} \tag{5.7}
$$

데이터 제한으로 추가 학습이 유익하지 않게 되는 손실 수준과, 무한 데이터 학습 곡선이 만나는 시점을 이용합니다. 실제 제한 데이터에서는 손실이 더 느리게 줄 수 있으므로 **종료 단계의 하한**입니다. 정확한 종료 시각을 보장하는 규칙은 아닙니다. Figure 16의 점과 하한선을 함께 읽어야 합니다. [원문 §5](https://arxiv.org/pdf/2001.08361v1#page=12)

## 6. Optimal Allocation of the Compute Budget

### 6.1. Optimal Performance and Allocations

<figure>
  <a href="/images/papers/kaplan-2020/figure-12.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-12.png" alt="Figure 12. 최적 크기에서 벗어날 때의 비용. 왼쪽은 최적 크기의 약 0.6–2.2배 범위에서 추가 계산량이 약 20% 이내인 예측입니다. 오른쪽은 큰 모델이 더 적은 순차 단계를 필요로 함을 보여 줍니다. 점선으로 표시한 매우 큰 모델 영역은 초기 학습 동역학을 설명하지 못합니다." loading="lazy" /></a>
  <figcaption>Figure 12. 최적 크기에서 벗어날 때의 비용 — Kaplan et al. (2020), arXiv v1, p. 15. <a href="https://arxiv.org/pdf/2001.08361v1#page=15">원문</a> · <a href="/images/papers/kaplan-2020/figure-12.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 최적 크기의 약 0.6–2.2배 범위에서 추가 계산량이 약 20% 이내인 예측입니다. 오른쪽은 큰 모델이 더 적은 순차 단계를 필요로 함을 보여 줍니다. 점선으로 표시한 매우 큰 모델 영역은 초기 학습 동역학을 설명하지 못합니다.
<figure>
  <a href="/images/papers/kaplan-2020/figure-13.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-13.png" alt="Figure 13. 배치 보정 전후 계산량 법칙. 검은 경험적 경계와 배치 크기를 보정한 추세를 비교합니다. 보정 후 지수는 약 0.050입니다. 작은 계산량의 불연속은 1층에서 2층 모델로 바뀌는 구간이며 적합에서 제외됩니다." loading="lazy" /></a>
  <figcaption>Figure 13. 배치 보정 전후 계산량 법칙 — Kaplan et al. (2020), arXiv v1, p. 15. <a href="https://arxiv.org/pdf/2001.08361v1#page=15">원문</a> · <a href="/images/papers/kaplan-2020/figure-13.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

검은 경험적 경계와 배치 크기를 보정한 추세를 비교합니다. 보정 후 지수는 약 0.050입니다. 작은 계산량의 불연속은 1층에서 2층 모델로 바뀌는 구간이며 적합에서 제외됩니다.
<figure>
  <a href="/images/papers/kaplan-2020/figure-14.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-14.png" alt="Figure 14. 최적 모델 크기와 순차 단계 수. 왼쪽은 보정 후 모델 크기의 지수 약 0.73, 오른쪽은 최소 단계 수의 지수 약 0.03을 보여 줍니다. 고정 배치로 측정한 주황색 단계 수와 보정한 파란색을 혼동하지 않아야 합니다." loading="lazy" /></a>
  <figcaption>Figure 14. 최적 모델 크기와 순차 단계 수 — Kaplan et al. (2020), arXiv v1, p. 16. <a href="https://arxiv.org/pdf/2001.08361v1#page=16">원문</a> · <a href="/images/papers/kaplan-2020/figure-14.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 보정 후 모델 크기의 지수 약 0.73, 오른쪽은 최소 단계 수의 지수 약 0.03을 보여 줍니다. 고정 배치로 측정한 주황색 단계 수와 보정한 파란색을 혼동하지 않아야 합니다.
$$
N(C_{\min}) \propto (C_{\min})^{0.73}. \tag{6.1}
$$
$$
S_{\min} \propto (C_{\min})^{0.03}, \tag{6.2}
$$

경험적 최적점에서는 모델 크기가 $C_{\min}^{0.73}$, 최소 단계 수가 약 $C_{\min}^{0.03}$으로 증가합니다. 계산량을 10배로 늘리면 모델은 약 5.4배, 단계 수는 약 1.07배라는 뜻입니다. 나머지 증가는 더 큰 배치·처리 토큰 수에 배분됩니다. 0.03은 작은 추정치이며 원문은 0과도 양립할 수 있다고 설명합니다.

### 6.2. Predictions from L(N, Smin)

$$
L(C_{\min}) = \left( \frac{C_c^{\min}}{C_{\min}} \right)^{\alpha_C^{\min}} \tag{6.3}
$$
$$
\alpha_C^{\min} \equiv \frac{1}{1/\alpha_S + 1/\alpha_B + 1/\alpha_N} \approx 0.054 \tag{6.4}
$$
$$
N(C_{\min}) \propto (C_{\min})^{\alpha_C^{\min}/\alpha_N} \approx (C_{\min})^{0.71} \tag{6.5}
$$

결합 모형을 계산 예산 아래에서 최적화하면 경험적 추세와 가까운 지수가 나옵니다. 직접 적합한 손실 지수 0.050, 이 절의 계산값 약 0.054, 부록의 약 0.052는 원문이 제시한 서로 다른 근사 수치입니다. 모델 크기도 관측 0.73과 예측 약 0.71을 구분합니다.

### 6.3. Contradictions and a Conjecture

<figure>
  <a href="/images/papers/kaplan-2020/figure-15.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-15.png" alt="Figure 15. 계산량 외삽과 데이터 한계의 충돌. 계산량 법칙과 최적 학습에서 공급되는 데이터로 가능한 손실의 외삽이 교차합니다. 붉은 영역과 주석은 교차 위치가 계수에 민감함을 강조합니다. 실제로 그 규모의 모델을 학습해 확인한 그래프가 아닙니다." loading="lazy" /></a>
  <figcaption>Figure 15. 계산량 외삽과 데이터 한계의 충돌 — Kaplan et al. (2020), arXiv v1, p. 17. <a href="https://arxiv.org/pdf/2001.08361v1#page=17">원문</a> · <a href="/images/papers/kaplan-2020/figure-15.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

계산량 법칙과 최적 학습에서 공급되는 데이터로 가능한 손실의 외삽이 교차합니다. 붉은 영역과 주석은 교차 위치가 계수에 민감함을 강조합니다. 실제로 그 규모의 모델을 학습해 확인한 그래프가 아닙니다.
$$
D \propto N^{0.74} \propto C_{\min}^{0.54} \tag{6.6}
$$
$$
D(C_{\min}) = \frac{2C_{\min}}{6N(C_{\min})} \approx (4 \times 10^{10} \text{ tokens}) (C_{\min}/\text{PF-Day})^{0.26} \tag{6.7}
$$
$$
C^* \sim 10^4 \text{ PF-Days} \quad N^* \sim 10^{12} \text{ parameters}, \quad D^* \sim 10^{12} \text{ tokens}, \quad L^* \sim 1.7 \text{ nats/token} \tag{6.8}
$$

과적합을 계속 억제하며 충분히 수렴시키려면 식 (6.6)처럼 데이터가 늘어야 합니다. 반면 계산 효율을 최적화한 경로에서 소비할 수 있는 토큰은 식 (6.7)처럼 더 느리게 증가합니다. 두 경로를 끝없이 외삽하면 양립하지 않는 손실 예측이 나옵니다.

식 (6.7)의 2는 임계 배치에서 $C=2C_{\min}$인 조건 때문입니다. 분수에서 $C$는 FLOPs로 환산해야 하고, 뒤의 수치식은 PF-day 단위를 씁니다. 부록 Table 6의 최소 계산 기준과 상수·지수가 다르므로 같은 표준화로 간주하지 않습니다.

저자들은 약 $10^{12}$ 파라미터·토큰 부근의 교차를 추정하지만 위치는 한 자릿수 규모 이상 흔들릴 수 있다고 밝힙니다. 자연어의 Entropy(엔트로피)와 연결하는 설명은 **저자의 추측**이며, 해당 크기에서 측정한 성능이나 확정된 지능 한계가 아닙니다. [원문 §6](https://arxiv.org/pdf/2001.08361v1#page=15)

## 7. Related Work

원문은 언어 모델 손실과 데이터 규모의 관계, Vision(시각) 등 다른 분야의 학습 곡선, 대규모 언어 모델, 배치 크기와 Gradient Noise(그래디언트 잡음)의 선행 연구를 연결합니다. 이 논문의 기여는 각 자원을 따로 관찰하는 데서 나아가 모델·데이터·시간의 결합식으로 계산 예산 배분을 다룬 데 있습니다. 관련 연구의 모델과 평가 조건을 이 논문의 계수에 그대로 대입할 수는 없습니다.

## 8. Discussion

이 연구는 모델 학습을 매번 독립적인 시행착오로만 보지 않고, 작은 실험들에서 큰 실험의 자원 배분을 예측하려는 틀을 제공합니다. 다만 법칙의 이론적 원인은 충분히 설명되지 않았고, 외삽이 어디서 실패하는지도 확정하지 못했습니다.

이 해설의 해석은 다음과 같습니다. 재현하거나 활용하려면 우선 자신의 Tokenization(토큰화), 데이터 분포, 학습 설정에서 손실 곡선을 측정하고, 데이터 제한과 초기 학습 구간을 구분해야 합니다. 이는 새 실험 제안이며 이 글에서 추가 실험을 실행한 결과는 아닙니다. [원문 §7–8](https://arxiv.org/pdf/2001.08361v1#page=18)

## A. Summary of Power Laws

<figure>
  <a href="/images/papers/kaplan-2020/table-4.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/table-4.png" alt="Table 4. 원문 표의 모든 행과 열. 아래 문단에서 조건과 수치를 해설합니다." loading="lazy" /></a>
  <figcaption>Table 4. 원문 표 — Kaplan et al. (2020), p. 20. <a href="https://arxiv.org/pdf/2001.08361v1#page=20">출처</a> · <a href="/images/papers/kaplan-2020/table-4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

Table 4의 여섯 행은 같은 식을 아무 조건에나 적용하지 않도록 정리한 표입니다. 순서대로 모델 제한, 데이터 제한, 고정 배치 계산 제한, 배치 보정 계산 최적화, 모델·데이터 결합, 모델·학습 단계 결합입니다. $\infty$는 실험에서 무한 자원을 사용했다는 뜻이 아니라 해당 자원이 병목이 아닌 극한을 나타냅니다.

<figure>
  <a href="/images/papers/kaplan-2020/table-5.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/table-5.png" alt="Table 5. 원문 표의 모든 행과 열. 아래 문단에서 조건과 수치를 해설합니다." loading="lazy" /></a>
  <figcaption>Table 5. 원문 표 — Kaplan et al. (2020), p. 20. <a href="https://arxiv.org/pdf/2001.08361v1#page=20">출처</a> · <a href="/images/papers/kaplan-2020/table-5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

|Table 5의 법칙|지수|척도 상수|
|---|---|---|
|모델 크기|$\alpha_N=0.076$|$N_c=8.8\times10^{13}$ 비임베딩 파라미터|
|데이터 크기|$\alpha_D=0.095$|$D_c=5.4\times10^{13}$ 토큰|
|고정 배치 계산량|$\alpha_C=0.057$|$C_c=1.6\times10^7$ PF-days|
|보정 계산량|$\alpha_C^{\min}=0.050$|$C_c^{\min}=3.1\times10^8$ PF-days|
|임계 배치|$\alpha_B=0.21$|$B_*=2.1\times10^8$ 토큰|
|학습 단계|$\alpha_S=0.76$|$S_c=2.1\times10^3$ 단계|

<figure>
  <a href="/images/papers/kaplan-2020/table-6.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/table-6.png" alt="Table 6. 원문 표의 모든 행과 열. 아래 문단에서 조건과 수치를 해설합니다." loading="lazy" /></a>
  <figcaption>Table 6. 원문 표 — Kaplan et al. (2020), p. 20. <a href="https://arxiv.org/pdf/2001.08361v1#page=20">출처</a> · <a href="/images/papers/kaplan-2020/table-6.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

|Table 6의 계산 최적 배분|계산량 지수|원표 척도|
|---|---|---|
|$N_{\mathrm{opt}}=N_e C_{\min}^{p_N}$|0.73|$N_e=1.3\times10^9$ 파라미터|
|$B\ll B_{\mathrm{crit}}=B_e C_{\min}^{p_B}$|0.24|$B_e=2.0\times10^6$ 토큰|
|$S_{\min}=S_e C_{\min}^{p_S}$, 하한|0.03|$S_e=5.4\times10^3$ 단계|
|$D_{\mathrm{opt}}=D_e C_{\min}^{p_D}$, 1 Epoch|0.27|$D_e=2\times10^{10}$ 토큰|

Table 6의 수치형 계산량은 PF-day 기준입니다. 배치 행은 **실제 배치를 임계 배치보다 작게 둔다**는 조건과 임계 배치의 규모식을 함께 제시합니다. $B$가 반드시 $B_{\mathrm{crit}}$과 같다는 처방이 아닙니다. 각 표의 척도는 데이터·토큰화·보정 관례에 의존합니다. [원문 부록 A](https://arxiv.org/pdf/2001.08361v1#page=20)

## B. Empirical Model of Compute-Efficient Frontier

이 부록의 $C,S,\alpha_C$는 배치 보정된 표기이며 원문은 표기를 줄이기 위해 보정 표시를 생략합니다. 본문의 고정 배치 $C$와 구분해 읽습니다.

### B.1. Defining Equations

$$
L(N, S) = \left(\frac{N_c}{N}\right)^{\alpha_N} + \left(\frac{S_c}{S}\right)^{\alpha_S}. \tag{B.1}
$$
$$
B(L) = \frac{B_*}{L^{1/\alpha_B}}. \tag{B.2}
$$
$$
L(N, C) = \left(\frac{N_c}{N}\right)^{\alpha_N} + \left(6B_*S_c\frac{N}{L^{1/\alpha_B}C}\right)^{\alpha_S}. \tag{B.3}
$$

학습 부족 항에서 단계 수를 계산량으로 바꾸면 $L$이 양쪽에 들어가는 Implicit Equation(암시적 방정식)이 됩니다. 배치 크기 자체가 목표 손실에 의존하기 때문입니다. 고정 계산량에서 $N$을 바꿔 미분값을 0으로 놓습니다.

$$
\begin{aligned} 0 &= \frac{\partial L}{\partial N}|_C \\ &= -\frac{\alpha_N}{N} \left(\frac{N_c}{N}\right)^{\alpha_N} + \frac{\alpha_S}{N} \left(6B_*S_c\frac{N}{L^{1/\alpha_B}C}\right)^{\alpha_S} \left(1 - 5\frac{N}{L} \frac{\partial L}{\partial N}|_C\right) \\ \implies \frac{\alpha_N}{\alpha_S} \left(\frac{N_c}{N}\right)^{\alpha_N} &= \left(6B_*S_c\frac{N}{L^{1/\alpha_B}C}\right)^{\alpha_S} \end{aligned} \tag{B.4}
$$

원문 중간 줄의 5는 $1/\alpha_B\approx4.76$에 해당하는 근사 표기입니다. 최적점에서는 그 항에 곱해진 미분이 0이므로 마지막 균형식에는 영향을 주지 않습니다. 모델 부족 항과 학습 부족 항의 비율이 지수 비율로 정해진다는 것이 핵심입니다.

### B.2. Efficient Training

$$
L(N_{\text{eff}}(C), C) = \left(1 + \frac{\alpha_N}{\alpha_S}\right) L(N_{\text{eff}}, \infty), \tag{B.5}
$$
$$
L(C) = \left(\frac{C_c}{C}\right)^{\alpha_C} \tag{B.6}
$$
$$
\alpha_C = 1/(1/\alpha_S + 1/\alpha_B + 1/\alpha_N) \approx 0.052 \tag{B.7}
$$
$$
C_c = 6N_cB_*S_c \left(1 + \frac{\alpha_N}{\alpha_S}\right)^{1/\alpha_S + 1/\alpha_N} \left(\frac{\alpha_S}{\alpha_N}\right)^{1/\alpha_S}. \tag{B.8}
$$
$$
\frac{N(C)}{N_c} = \left(\frac{C}{C_c}\right)^{\alpha_C/\alpha_N} \left(1 + \frac{\alpha_N}{\alpha_S}\right)^{1/\alpha_N} \tag{B.9}
$$
$$
S(C) = \frac{C_c}{6N_cB_*} \left(1 + \frac{\alpha_N}{\alpha_S}\right)^{-1/\alpha_N} \left(\frac{C}{C_c}\right)^{\alpha_C/\alpha_S} \tag{B.10}
$$

식 (B.5)는 계산 효율이 최적인 종료점에서 손실이 그 모델의 수렴 손실보다 약 10% 높다는 예측입니다. (B.6)–(B.8)은 계산량과 손실의 지수 및 원문 척도식을, (B.9)–(B.10)은 모델 크기·단계 수의 배분을 나타냅니다. 상수식은 원문 그대로 보존하며, 실제 예산 환산에서는 본문과 부록의 배치 보정·단위 관례를 먼저 맞춰야 합니다.

### B.3. Comparison to Inefficient

$$
L(N, C) = (1 + f) L(N, \infty). \tag{B.11}
$$
$$
\frac{N_f}{N_{f'}} = \left( \frac{1 + f}{1 + f'} \right)^{1/\alpha_N} \approx 2.7 \tag{B.12}
$$
$$
\frac{S_f}{S_{f'}} = \left( \frac{1 + \frac{1}{f}}{1 + \frac{1}{f'}} \right)^{1/\alpha_S} \approx 0.13 \tag{B.13}
$$
$$
\frac{C_f}{C_{f'}} = \frac{N_f}{N_{f'}} \frac{S_f}{S_{f'}} \approx 0.35 \tag{B.14}
$$

$f$는 수렴 손실 대비 남겨 둔 상대 손실입니다. 원문은 효율적인 $f\approx10\%$와 더 오래 학습하는 $f'=2\%$를 비교합니다. **같은 목표 손실**에서 전자는 약 2.7배 큰 모델, 약 0.13배의 갱신 단계, 약 0.35배 계산량을 예측합니다. 65% 절감은 이 모형·종료 조건의 계산이며, 실제 모든 학습 작업에서 측정한 절감률이 아닙니다.

### B.4. Suboptimal Model Sizes

$$
C(N, L) = \left( 6B_* S_c \frac{N}{L^{1/\alpha_B}} \right) \left( L - \left( \frac{N_c}{N} \right)^{\alpha_N} \right)^{-1/\alpha_S}. \tag{B.15}
$$
$$
\frac{C(N, N_{\text{eff}})}{C(N_{\text{eff}}, N_{\text{eff}})} = \frac{N}{N_{\text{eff}}} \left[ 1 + \frac{\alpha_S}{\alpha_N} \left( 1 - \left( \frac{N_{\text{eff}}}{N} \right)^{\alpha_N} \right) \right]^{-1/\alpha_S}. \tag{B.16}
$$
$$
\frac{S(N, N_{\text{eff}})}{S(N_{\text{eff}}, N_{\text{eff}})} = \left[ 1 + \frac{\alpha_S}{\alpha_N} \left( 1 - \left( \frac{N_{\text{eff}}}{N} \right)^{\alpha_N} \right) \right]^{-1/\alpha_S}. \tag{B.17}
$$

주어진 손실 $L$에 도달하는 데 필요한 계산량과 단계 수를 최적 크기 $N_{\mathrm{eff}}$ 대비로 표시합니다. $N$이 너무 작아 자체 수렴 손실이 목표보다 높으면 유한 계산량으로 목표에 도달할 수 없습니다. 최적보다 2.2배 큰 모델은 약 20% 계산량을 더 써서 단계 수를 약 45% 줄일 수 있다는 예측이 Figure 12에 대응합니다.

원문 이 절의 “A.1/A.6/A.9”와 “Figure X/Y”는 남아 있는 내부 참조 표기입니다. 여기서는 식 내용에 맞는 B.1/B.6/B.9와 Figure 12로 연결했습니다. 매우 큰 모델의 초기 학습까지 이 비율식을 외삽하지 않습니다. [원문 부록 B](https://arxiv.org/pdf/2001.08361v1#page=20)

## C. Caveats

원문이 제시한 한계는 결과의 적용 범위를 정합니다.

- Scaling Laws(스케일링 법칙)의 이론적 근거와 보정항을 충분히 알지 못합니다.
- 관측한 손실 범위 밖의 Critical Batch Size(임계 배치 크기)는 불확실하며, 실제 병렬 효율과 학습 시간에 영향을 줍니다.
- 작은 데이터에서 적합이 좋지 않고 Regularization(정규화)·Data Augmentation(데이터 증강)을 폭넓게 최적화하지 않았습니다.
- $C\approx6NBS$는 문맥 관련 연산을 생략합니다. 특히 $n_{\mathrm{ctx}}\gtrsim12d_{\mathrm{model}}$이면 이 근사를 재검토해야 합니다.
- 초기화·Momentum(모멘텀) 등 모든 하이퍼파라미터를 조정한 것이 아닙니다.
- 목표 손실과 종료 시점에 따라 최적 학습률이 달라질 수 있으며, 짧은 학습을 위한 더 큰 학습률은 충분히 실험하지 않았습니다.

따라서 “모델을 키우면 항상 같은 지수로 좋아진다”는 무조건적 보장으로 읽지 않습니다. [원문 부록 C](https://arxiv.org/pdf/2001.08361v1#page=22)

## D. Supplemental Figures

### D.1. Early Stopping and Test vs Train

<figure>
  <a href="/images/papers/kaplan-2020/figure-16.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-16.png" alt="Figure 16. 조기 종료와 학습·평가 손실. 왼쪽 점은 관측 종료 단계이고 붉은 선은 이론적 하한입니다. 오른쪽은 300M 모델에서 데이터 크기별 Train/Test 곡선입니다. 검은 막대의 Train–Test 차이는 무한 데이터 기준의 성능 악화를 과대평가할 수 있습니다." loading="lazy" /></a>
  <figcaption>Figure 16. 조기 종료와 학습·평가 손실 — Kaplan et al. (2020), arXiv v1, p. 23. <a href="https://arxiv.org/pdf/2001.08361v1#page=23">원문</a> · <a href="/images/papers/kaplan-2020/figure-16.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽 점은 관측 종료 단계이고 붉은 선은 이론적 하한입니다. 오른쪽은 300M 모델에서 데이터 크기별 Train/Test 곡선입니다. 검은 막대의 Train–Test 차이는 무한 데이터 기준의 성능 악화를 과대평가할 수 있습니다.

Early Stopping(조기 종료)은 평가 손실이 개선되지 않는 때를 추적합니다. 학습 손실은 계속 떨어질 수 있으므로 두 곡선의 차이만으로 데이터 부족의 비용을 재면 다른 양을 측정하게 됩니다. §5.3의 하한은 관측 종료 단계보다 작게 나타나는지 확인하는 용도입니다.

### D.2. Universal Transformers

<figure>
  <a href="/images/papers/kaplan-2020/figure-17.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-17.png" alt="Figure 17. 파라미터를 재사용하는 Transformer. 2·4·8회 재사용을 표준 모델과 비교합니다. 왼쪽은 재사용 횟수를 계산에 반영하는 축, 오른쪽은 실제 고유 파라미터 수 축입니다. 재사용은 파라미터 효율을 높여도 계산 효율에서는 약간 불리합니다." loading="lazy" /></a>
  <figcaption>Figure 17. 파라미터를 재사용하는 Transformer — Kaplan et al. (2020), arXiv v1, p. 24. <a href="https://arxiv.org/pdf/2001.08361v1#page=24">원문</a> · <a href="/images/papers/kaplan-2020/figure-17.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

2·4·8회 재사용을 표준 모델과 비교합니다. 왼쪽은 재사용 횟수를 계산에 반영하는 축, 오른쪽은 실제 고유 파라미터 수 축입니다. 재사용은 파라미터 효율을 높여도 계산 효율에서는 약간 불리합니다.

Parameter Sharing(파라미터 공유)은 저장할 가중치 수를 줄이지만 같은 가중치를 여러 번 적용하는 연산은 남습니다. 이 그림은 모델 크기만 기준으로 순위를 매기는 것과 계산량 기준 평가가 달라질 수 있음을 보여 줍니다.

### D.3. Batch Size

<figure>
  <a href="/images/papers/kaplan-2020/figure-18.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-18.png" alt="Figure 18. 배치 크기 실험. 3M과 85M 모델에서 특정 손실에 도달하는 단계 수와 처리 토큰 수를 측정합니다. 색은 목표 손실이며, 곡선은 식 (5.1)의 단계–샘플 교환관계를 맞춘 결과입니다. Figure 10의 임계 배치 추정 근거입니다." loading="lazy" /></a>
  <figcaption>Figure 18. 배치 크기 실험 — Kaplan et al. (2020), arXiv v1, p. 24. <a href="https://arxiv.org/pdf/2001.08361v1#page=24">원문</a> · <a href="/images/papers/kaplan-2020/figure-18.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

3M과 85M 모델에서 특정 손실에 도달하는 단계 수와 처리 토큰 수를 측정합니다. 색은 목표 손실이며, 곡선은 식 (5.1)의 단계–샘플 교환관계를 맞춘 결과입니다. Figure 10의 임계 배치 추정 근거입니다.

Batch Size(배치 크기) 실험의 곡선은 식 (5.1)의 관측 근거입니다. 같은 손실에 도달한 점들을 비교해야 하며, 색이 다른 점을 직접 비교하면 목표 성능 차이가 섞입니다.

### D.4. Sample Efficiency vs Model Size

<figure>
  <a href="/images/papers/kaplan-2020/figure-19.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-19.png" alt="Figure 19. 목표 손실별 샘플 효율. 왼쪽은 필요한 최소 단계 수, 오른쪽은 필요한 최소 처리 토큰 수입니다. 각 색은 같은 목표 손실입니다. 큰 모델은 목표 달성에 필요한 토큰을 크게 줄일 수 있지만 토큰당 연산량도 증가합니다." loading="lazy" /></a>
  <figcaption>Figure 19. 목표 손실별 샘플 효율 — Kaplan et al. (2020), arXiv v1, p. 24. <a href="https://arxiv.org/pdf/2001.08361v1#page=24">원문</a> · <a href="/images/papers/kaplan-2020/figure-19.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 필요한 최소 단계 수, 오른쪽은 필요한 최소 처리 토큰 수입니다. 각 색은 같은 목표 손실입니다. 큰 모델은 목표 달성에 필요한 토큰을 크게 줄일 수 있지만 토큰당 연산량도 증가합니다.

원문은 일부 목표 손실에서 최소 가능한 모델과 매우 큰 모델 사이의 샘플 효율 차이가 거의 100배라고 설명합니다. 이 수치는 고정 손실·최소 처리량 조건이며, 비용이나 정확도가 100배 개선된다는 뜻은 아닙니다.

### D.5. Context Dependence

<figure>
  <a href="/images/papers/kaplan-2020/figure-20.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-20.png" alt="Figure 20. 문맥 위치와 학습 시간. 왼쪽은 1024개 문맥 위치 T에 따른 토큰별 손실, 오른쪽은 774M 모델의 위치별 학습 곡선입니다. 짧은 문맥의 규칙을 먼저 익히고 더 긴 의존성을 나중에 활용하는 양상이 보입니다." loading="lazy" /></a>
  <figcaption>Figure 20. 문맥 위치와 학습 시간 — Kaplan et al. (2020), arXiv v1, p. 25. <a href="https://arxiv.org/pdf/2001.08361v1#page=25">원문</a> · <a href="/images/papers/kaplan-2020/figure-20.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 1024개 문맥 위치 T에 따른 토큰별 손실, 오른쪽은 774M 모델의 위치별 학습 곡선입니다. 짧은 문맥의 규칙을 먼저 익히고 더 긴 의존성을 나중에 활용하는 양상이 보입니다.
<figure>
  <a href="/images/papers/kaplan-2020/figure-21.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-21.png" alt="Figure 21. 모델 크기별 위치 손실. 1024 문맥에서 첫 토큰을 제외한 여러 위치의 손실이 모델 크기와 함께 개선됩니다. 점선의 길이 8 문맥 모델은 초반 토큰에 용량을 집중할 수 있어 긴 문맥 모델보다 낮은 손실을 보입니다." loading="lazy" /></a>
  <figcaption>Figure 21. 모델 크기별 위치 손실 — Kaplan et al. (2020), arXiv v1, p. 25. <a href="https://arxiv.org/pdf/2001.08361v1#page=25">원문</a> · <a href="/images/papers/kaplan-2020/figure-21.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

1024 문맥에서 첫 토큰을 제외한 여러 위치의 손실이 모델 크기와 함께 개선됩니다. 점선의 길이 8 문맥 모델은 초반 토큰에 용량을 집중할 수 있어 긴 문맥 모델보다 낮은 손실을 보입니다.

문맥의 첫 위치는 이전 토큰 정보가 거의 없어 모델 크기를 늘려도 개선이 제한됩니다. 뒤쪽 위치에서는 더 많은 문맥을 활용하며 손실이 낮아집니다. 짧은 문맥에서 초반 토큰 성능이 더 좋다는 결과는 짧은 문맥이 모든 작업에 유리하다는 결론과 다릅니다.

### D.6. Learning Rate Schedules and Error Analysis

<figure>
  <a href="/images/papers/kaplan-2020/figure-22.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-22.png" alt="Figure 22. 학습률 스케줄 실험. 왼쪽은 3M 모델에서 바꾼 학습률 곡선, 오른쪽은 누적 학습률과 최종 손실입니다. 지나치게 작은 학습률이나 빠른 감쇠를 피한 범위에서는 스케줄 차이보다 실행 간 변동도 고려해야 합니다." loading="lazy" /></a>
  <figcaption>Figure 22. 학습률 스케줄 실험 — Kaplan et al. (2020), arXiv v1, p. 26. <a href="https://arxiv.org/pdf/2001.08361v1#page=26">원문</a> · <a href="/images/papers/kaplan-2020/figure-22.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽은 3M 모델에서 바꾼 학습률 곡선, 오른쪽은 누적 학습률과 최종 손실입니다. 지나치게 작은 학습률이나 빠른 감쇠를 피한 범위에서는 스케줄 차이보다 실행 간 변동도 고려해야 합니다.
$$
LR(N) \approx 0.003239 + -0.0001395 \log(N) \tag{D.1}
$$

위 식은 실험한 모델에서 사용한 Learning Rate(학습률)의 경험적 규칙입니다. 원문의 $\log$ 표기를 보존했으며, 이를 임의의 큰 모델에 적용하지 않습니다. 저자들은 약 $N>10^{10}$에서 식이 깨진다고 밝힙니다. 스케줄 비교의 실행 간 손실 변동은 약 0.05로, §4의 다른 실험에서 언급한 약 0.02와 조건이 다릅니다.

### D.7. Fit Details and Power Law Quality

<figure>
  <a href="/images/papers/kaplan-2020/figure-23.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-23.png" alt="Figure 23. Power Law와 로그 적합. 수렴 손실과 파라미터 수의 관계를 두 함수로 비교합니다. 원문의 실험 범위에서 Power Law가 로그 함수보다 추세를 더 잘 설명합니다. 모든 가능한 함수에 대한 통계적 우월성을 증명한 것은 아닙니다." loading="lazy" /></a>
  <figcaption>Figure 23. Power Law와 로그 적합 — Kaplan et al. (2020), arXiv v1, p. 26. <a href="https://arxiv.org/pdf/2001.08361v1#page=26">원문</a> · <a href="/images/papers/kaplan-2020/figure-23.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

수렴 손실과 파라미터 수의 관계를 두 함수로 비교합니다. 원문의 실험 범위에서 Power Law가 로그 함수보다 추세를 더 잘 설명합니다. 모든 가능한 함수에 대한 통계적 우월성을 증명한 것은 아닙니다.

계산량 적합에서 1층 모델을 제외하고, 모델 크기 적합에서는 매우 작은 1층 모델 및 충분히 수렴하지 않은 가장 큰 모델을 제외합니다. 포함하는 범위를 바꾸면 계수가 달라질 수 있다는 한계도 함께 남깁니다.

### D.8. Generalization and Architecture

<figure>
  <a href="/images/papers/kaplan-2020/figure-24.png" target="_blank" rel="noopener"><img src="/images/papers/kaplan-2020/figure-24.png" alt="Figure 24. 깊이와 분포 간 일반화. 약 1.5B 파라미터를 유지하며 깊이를 바꾼 평가입니다. 분포마다 손실 수준은 다르지만 깊이에 따른 일관된 개선은 뚜렷하지 않습니다. 12층의 Internet Books 과적합 예외에서는 조기 종료 성능을 표시했습니다." loading="lazy" /></a>
  <figcaption>Figure 24. 깊이와 분포 간 일반화 — Kaplan et al. (2020), arXiv v1, p. 27. <a href="https://arxiv.org/pdf/2001.08361v1#page=27">원문</a> · <a href="/images/papers/kaplan-2020/figure-24.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

약 1.5B 파라미터를 유지하며 깊이를 바꾼 평가입니다. 분포마다 손실 수준은 다르지만 깊이에 따른 일관된 개선은 뚜렷하지 않습니다. 12층의 Internet Books 과적합 예외에서는 조기 종료 성능을 표시했습니다.

파라미터 수 약 15억을 고정한 이 실험에서 깊이는 다른 분포로의 일반화에 뚜렷한 독립 효과를 보이지 않았습니다. 저자들이 관측한 12층 모델의 Internet Books 예외도 원문 설명대로 유지합니다. [원문 부록 D](https://arxiv.org/pdf/2001.08361v1#page=23)
