---
title: 'MoE의 expert는 몇 개가 적당할까? — 전체 expert 수, router top-k, 활성 파라미터의 최적 설계'
description: 'MoE의 전체·활성 파라미터, 희소성과 expert 세분도를 구분하고, 6편의 원문으로 고정 FLOPs·데이터·추론 정확도·하드웨어에 따른 설계 기준을 정리합니다.'
publishedAt: '2026-09-22'
topic: llm-tech
category: architecture
tags: ['MoE', 'Scaling Laws', 'Expert Granularity', 'Router Top-k', 'Active Parameters', 'SLM', 'Financial QA', 'Reliability', '2024', '2025', '2026', '1B–3B']
kind: research-note
readingTime: 28
featured: false
draft: false
sourceLinks:
  - title: 'Abnar et al. · Parameters vs FLOPs · v3'
    url: https://arxiv.org/abs/2501.12370v3
    kind: 원문
  - title: 'Krajewski et al. · Fine-Grained MoE · v1'
    url: https://arxiv.org/abs/2402.07871v1
    kind: 원문
  - title: 'Tian et al. · Towards Greater Leverage · v4'
    url: https://arxiv.org/abs/2507.17702v4
    kind: 원문
  - title: 'Nakamura et al. · Optimal Sparsity for Reasoning · v3'
    url: https://arxiv.org/abs/2508.18672v3
    kind: 원문
  - title: 'Ludziejewski et al. · Joint MoE Scaling Laws · v2'
    url: https://arxiv.org/abs/2502.05172v2
    kind: 원문
  - title: 'Tian et al. · Hyperparameter Scaling Laws · v1'
    url: https://arxiv.org/abs/2609.08690v1
    kind: 원문
takeaway: '최적 E와 k는 단독 숫자가 아니다. 전체·활성 파라미터를 구분하고, 희소성과 expert 세분도를 따로 바꾸며, 학습 예산·과제 정확도·실측 추론 비용을 함께 평가해야 한다.'
---

도서관에 책장을 더 놓는 것과, 질문 하나를 풀기 위해 여러 책장을 동시에 찾아보는 것은 다른 일입니다. <strong>MoE(Mixture of Experts, 전문가 혼합)</strong>도 비슷합니다. 전체 Expert(전문가 모듈) 수는 저장할 수 있는 용량과 관계가 있고, 토큰마다 선택하는 Expert(전문가 모듈) 수는 그 순간 사용하는 계산과 관계가 있습니다. 다만 실제 Expert(전문가 모듈)가 금융·법률처럼 사람이 정한 주제로 나뉜다는 보장은 없습니다.

<strong>“전체 expert는 몇 개, top-k는 몇 개가 정답인가?”에 보편적인 숫자는 없습니다.</strong> 먼저 총 파라미터 예산, 활성 파라미터 예산, 학습 데이터와 연산량, 실제 과제를 정해야 합니다. 같은 3B 모델이라도 저장된 3B를 얼마나 자주, 얼마나 충분히 학습하고 사용하는지에 따라 결과가 달라집니다.

이 글은 여섯 논문을 질문별로 교차해 읽는 Research Note(연구 노트)입니다. 아래 판본의 원문을 <strong>2026-09-22</strong>에 확인했으며, 게시일과 논문 최초 공개일을 구분합니다. 논문의 관측은 출처와 조건을 붙이고, 3B 계산 예시와 금융 QA(Question Answering, 질의응답) 실험은 <strong>작성자의 설계 제안이며 실행 결과가 아님</strong>을 명시합니다. 핵심 비교를 뒷받침하는 원문 Figure 6개를 패널·축·범례와 함께 싣습니다.

## 1. 먼저 무엇을 세는지 통일하자

### 전체 파라미터와 활성 파라미터

<strong>Total Parameters(전체 파라미터)</strong>는 모델이 보유한 가중치의 총량이고, <strong>Active Parameters(활성 파라미터)</strong>는 특정 토큰을 처리할 때 선택되는 경로의 가중치 규모입니다. Router(라우터)가 고르는 대상은 보통 FFN(Feed-Forward Network, 피드포워드 신경망) 부분이며, Attention(어텐션) 등 공통 부분은 계속 사용합니다.

기호를 다음처럼 정하겠습니다. 이 글의 $E$는 항상 <strong>한 MoE 층의 전체 routed expert 수</strong>, $k$는 그중 토큰당 선택 수입니다. 모든 층에서 $E,k$와 expert 크기가 같다는 단순화를 먼저 사용합니다.

| 기호 | 이 글에서의 뜻 |
| --- | --- |
| $P_c$ | Common Parameters(공통 파라미터): 항상 사용하는 Attention(어텐션), dense 블록, shared expert 등 |
| $p_e$ | 각 층에서 expert 하나씩을 취했을 때, 모든 MoE 층에 걸쳐 합산한 가중치 수 |
| $P_{\mathrm{tot}}$ | 전체 모델의 파라미터 수 |
| $P_{\mathrm{act}}$ | 토큰당 선택되는 경로의 활성 파라미터 수 |
| $a=k/E$ | Routed Expert Activation Ratio(라우팅 expert 활성 비율) |
| $s=1-k/E$ | 이 글에서 사용하는 Expert Sparsity(전문가 희소성) |

$p_e$는 <strong>단일 층의 expert 크기가 아니라 층 전체에 걸친 합</strong>입니다. 예를 들어 동일한 MoE 층이 $L$개이고 각 expert가 $p$개 가중치를 가지면 $p_e=Lp$입니다.

$$
P_{\mathrm{tot}}=P_c+Ep_e,\qquad
P_{\mathrm{act}}=P_c+kp_e.
$$

층마다 구성이 다르면 $Ep_e$를 $\sum_\ell E_\ell p_\ell$로, $kp_e$를 $\sum_\ell k_\ell p_\ell$로 바꾸면 됩니다. 크기가 다른 expert나 토큰별로 선택 수가 다른 구조에서는 활성 파라미터도 토큰마다 달라지므로 평균과 분포를 함께 기록해야 합니다.

공통 부분의 비중을 $q=P_c/P_{\mathrm{tot}}$라고 하면,

$$
\frac{P_{\mathrm{act}}}{P_{\mathrm{tot}}}
=q+(1-q)\frac{k}{E}.
$$

따라서 <strong>$k/E$는 모델 전체의 활성 파라미터 비율이 아닙니다.</strong> $k/E$가 작아져도 공통 부분은 사라지지 않습니다. 모든 공통 가중치를 활성으로 세는 이 계산 관례에서는 전체 활성 비율의 하한이 $q$입니다.

이는 파라미터 회계입니다. 실제 FLOPs(Floating Point Operations, 부동소수점 연산 수)와 완전히 같지 않습니다. Embedding(임베딩)의 lookup, 출력 projection, Attention(어텐션)의 문맥 길이 의존 연산, Router(라우터) 비용을 따로 계산해야 합니다. 논문마다 embedding을 제외하는지, 공유된 입력·출력 가중치를 어떻게 세는지도 확인해야 합니다. [Abnar et al., 부록 A·C](https://arxiv.org/pdf/2501.12370v3#page=18)

### 3B 모델에서 12.5%만 선택하면 0.375B가 활성일까?

다음은 <strong>설명용 가상 설계 계산</strong>입니다. 검증된 최적 구성이나 학습 결과가 아닙니다. $1\mathrm{B}=10^9$, $1\mathrm{M}=10^6$개 파라미터입니다.

$$
P_{\mathrm{tot}}=3\mathrm{B},\quad P_c=0.6\mathrm{B},\quad
P_{\mathrm{act}}=0.9\mathrm{B}.
$$

전체 routed expert에는 $2.4\mathrm{B}$가 저장되고, 매 토큰이 사용하는 routed expert는 $0.3\mathrm{B}$입니다. 그러므로

$$
\frac{k}{E}=\frac{0.9-0.6}{3-0.6}=\frac18=12.5\%,
\qquad
\frac{P_{\mathrm{act}}}{P_{\mathrm{tot}}}=\frac{0.9}{3}=30\%.
$$

<strong>Expert Sparsity(전문가 희소성)는 87.5%, 모델 전체에서 비활성인 가중치 비중은 70%</strong>입니다. 서로 다른 분모를 사용한 값입니다.

| 구성 $E$/top-$k$ | expert 하나의 층 전체 합 $p_e$ | 전체 routed 가중치 $Ep_e$ | 활성 routed 가중치 $kp_e$ | 전체 / 활성 파라미터 | $k/E$ |
| --- | ---: | ---: | ---: | ---: | ---: |
| 8 / top-1 | 300M | 2.4B | 0.3B | 3B / 0.9B | 12.5% |
| 16 / top-2 | 150M | 2.4B | 0.3B | 3B / 0.9B | 12.5% |
| 32 / top-4 | 75M | 2.4B | 0.3B | 3B / 0.9B | 12.5% |
| 64 / top-8 | 37.5M | 2.4B | 0.3B | 3B / 0.9B | 12.5% |

8/top-1은 큰 expert 하나, 64/top-8은 그 1/8 크기 expert 여덟 개를 사용합니다. <strong>top-k가 8배가 되어도 활성 가중치는 같습니다.</strong> 다만 Router(라우터) 출력 수와 배치 분할, 통신·커널 호출 비용은 같지 않습니다.

표는 expert 가중치가 균일하고 Router(라우터) 증가분·bias·차원 정렬을 무시한 산술입니다. 실제 구현에서는 $E$에 따라 Router(라우터) 파라미터도 변하므로 expert의 hidden dimension을 조절한 뒤 정확한 총량과 FLOPs(부동소수점 연산 수)를 다시 셉니다. SwiGLU 계열 expert는 대략 $3d_{\mathrm{model}}d_{\mathrm{expert}}$개의 행렬 가중치를 가지므로, 이 관계를 이용해 크기를 맞출 수 있습니다.

## 2. 희소하게 만드는 것과 잘게 나누는 것은 다르다

<strong>Sparsity(희소성)</strong>는 전체 expert 중 얼마나 적게 사용하는지, <strong>Expert Granularity(전문가 세분도)</strong>는 같은 가중치 예산을 얼마나 작은 expert 단위로 나누는지를 말합니다.

앞의 네 구성은 모두 $k/E=1/8$입니다. 따라서 <strong>Sparsity(희소성)를 바꾼 비교가 아니라, 전체·활성 파라미터를 맞춘 Expert Granularity(전문가 세분도) 비교</strong>입니다. 작은 expert 여러 개를 조합할 수 있다는 구조적 차이가 생기지만, 그것만으로 정확도가 오른다고 결론 내릴 수는 없습니다.

| 바꾸는 축 | 고정하는 것 | 달라지는 것 | 답하려는 질문 |
| --- | --- | --- | --- |
| $E,k$를 함께 늘리고 expert를 축소 | 전체·활성 expert 가중치, $k/E$ | 세분도, Router(라우터)·실행 비용 | 같은 용량과 활성 예산을 더 잘게 나누면 유리한가? |
| $E$와 expert 크기를 고정하고 $k$ 변경 | 전체 파라미터 | 활성 파라미터, 토큰당 계산 | 같은 저장 용량을 더 많이 사용하면 유리한가? |
| $k$와 expert 크기를 고정하고 $E$ 증가 | 활성 expert 가중치 | 전체 파라미터·메모리, $k/E$ | 같은 활성 예산에 더 많은 용량을 저장하면 유리한가? |

세 번째 비교는 MoE(전문가 혼합)의 장점을 보여주기 쉽지만, <strong>총 파라미터 3B 고정</strong>이라는 처음 질문과는 다른 실험입니다.

### 같은 G라는 기호도 같은 단위가 아니다

2024년 *Scaling Laws for Fine-Grained Mixture of Experts*는 다음처럼 정의합니다.

$$
G_{2024}=\frac{d_{\mathrm{ff}}}{d_{\mathrm{expert}}},\qquad
 d_{\mathrm{ff}}=4d_{\mathrm{model}}.
$$

이 논문의 $E$는 전체 expert 수가 아니라 <strong>Expansion Rate(확장 배율)</strong>입니다. 혼동을 피하려고 그 값을 $R$로 바꾸어 쓰면, 전체 expert 수는 이 글의 기호로 $E=RG$입니다. 다만 실제 실험은 Expert Choice(전문가가 토큰을 선택하는 라우팅)를 사용하므로, $G$는 토큰당 평균 활성 expert 수에 대응합니다. 일반적인 Token Choice(토큰이 전문가를 선택하는 라우팅)의 고정 top-$k=G$와 동일한 알고리즘은 아닙니다. 논문이 $R=64$를 고정하고 $G$를 바꾸었다고 해서 “expert 64개에서 top-k만 바꿨다”고 읽으면 안 됩니다. [Krajewski et al., §3–5·부록 A](https://arxiv.org/pdf/2402.07871v1)

2025년 *Towards Greater Leverage*의 정의는 다음과 같습니다.

$$
G_{2025}=\frac{2d_{\mathrm{model}}}{d_{\mathrm{expert}}}.
$$

같은 $d_{\mathrm{model}}$과 $d_{\mathrm{expert}}$라면 앞 정의의 값은 뒤 정의의 두 배입니다. <strong>이것은 단위 환산일 뿐, 서로 다른 실험의 최적값이 같다는 뜻이 아닙니다.</strong> 더구나 Shared Expert(공유 전문가 모듈)가 있는 이 논문은 활성 비율도

$$
A=\frac{E_a+E_s}{E+E_s}
$$

로 정의합니다. $E_a$는 선택된 routed expert, $E_s$는 항상 켜지는 shared expert 수입니다. 동일 크기 expert라는 조건에서 사용하는 expert 집합의 비율이며, Attention(어텐션)까지 포함한 모델 전체의 활성 비율은 여전히 아닙니다. [Tian et al., §2.1](https://arxiv.org/pdf/2507.17702v4#page=3)

## 3. 여섯 논문은 서로 다른 최적화 문제를 푼다

아래 날짜는 arXiv의 <strong>최초 공개일 → 검토 시점 최신 판본 날짜</strong>입니다. 같은 토크나이저·데이터·구조를 쓴 실험들이 아니므로 loss(손실)의 절대값이나 fitted coefficient(추정 계수)를 논문 사이에서 직접 비교하지 않습니다.

| 원문·서지정보 | 무엇을 바꾸고 무엇을 고정했나? | 이 글에 필요한 직접적 근거 | 적용 범위 |
| --- | --- | --- | --- |
| Samira Abnar et al., *Parameters vs FLOPs: Scaling Laws for Optimal Sparsity for Mixture-of-Experts Language Models*. [2501.12370v3](https://arxiv.org/abs/2501.12370v3). 2025-01-21 → 2025-07-02 | RedPajamaV1 기반. 전체 $N$, expert 희소성 $S$, 학습 연산량 $C$를 분석. 고정 $C$에서 토큰 수를 조절 | 고정 $N,C$에서 최적 $S$가 존재. 같은 $N$에 더 많은 $C$를 주면 최적 $S$가 낮아지는 경향 | 전체 $N$까지 자유롭게 늘리는 경우의 결론과 분리해야 함 |
| Jakub Krajewski et al., *Scaling Laws for Fine-Grained Mixture of Experts*. [2402.07871v1](https://arxiv.org/abs/2402.07871v1). 2024-02-12 → 동일 | C4, Expert Choice(전문가 선택 라우팅), 129M–3.7B, 16B–130B 토큰, 100회 넘는 실험. 확장 배율 64, $G=1$–16 | 같은 모델·데이터 규모에서 세분화의 이점. Router(라우터) 비용을 포함하면 무한 세분화가 최선은 아님 | $G=d_{\mathrm{ff}}/d_{\mathrm{expert}}$이며 논문 $E$는 확장 배율 |
| Changxin Tian et al., *Towards Greater Leverage: Scaling Laws for Efficient Mixture-of-Experts Language Models*. [2507.17702v4](https://arxiv.org/abs/2507.17702v4). 2025-07-23 → 2025-10-21 | 토큰당 연산 규모 $M$, 활성 비율 $A$, shared 비율을 통제한 granularity sweep. $G=2$–16, expert 64–512, $C=10^{18}$–$10^{20}$ | 해당 실험에서 loss가 U자형이고 최적 $G$가 약 12. Routing Balance(라우팅 균형)가 나쁘면 더 거친 쪽으로 이동 | $G=2d_{\mathrm{model}}/d_{\mathrm{expert}}$. 12는 보편적인 expert 수나 top-k가 아님 |
| Taishi Nakamura et al., *Optimal Sparsity of Mixture-of-Experts Language Models for Reasoning Tasks*. [2508.18672v3](https://arxiv.org/abs/2508.18672v3). 2025-08-26 → 2026-03-01 | 주 실험은 125B 토큰, 16층 Mixtral 계열. 폭 512/1024/2048, expert 수·top-k를 변경하고 활성 연산별 비교 | 사전학습 loss와 GSM8K·GSM-Plus의 성능이 어긋남. 수학 추론은 활성 계산과 데이터 대비 전체 용량에 민감 | expert 폭을 모델 폭의 두 배로 둔 실험. 이 글의 총·활성 파라미터 동시 고정 세분도 비교와 다름 |
| Jan Ludziejewski et al., *Joint MoE Scaling Laws: Mixture of Experts Can Be Memory Efficient*. [2502.05172v2](https://arxiv.org/abs/2502.05172v2). 2025-02-07 → 2025-02-19 | FineWeb-Edu, 280개 넘는 모델, 최대 5B. 주로 Switch top-1, $N_{\mathrm{act}},D,E$ 공동 분석 | 총 메모리·학습 연산 제약에서도 MoE가 유리할 수 있음. 1.1B 전체 크기를 맞춘 dense와 $E=2,4$의 검증 포함 | 모든 MoE가 더 적은 메모리를 쓰거나, 최적 top-k가 1이라는 결론은 아님 |
| Changxin Tian et al., *Hyperparameter Scaling Laws Across MoE Sparsity*. [2609.08690v1](https://arxiv.org/abs/2609.08690v1). 2026-09-08 → 동일 | 주 sweep의 $A\in\{1,1/4,1/16,1/32\}$, 4096-token 문맥, hybrid linear-attention/MLA(Multi-head Latent Attention, 다중 헤드 잠재 어텐션) 구조, Muon optimizer | Learning Rate(학습률)는 $C,A$, Batch Size(배치 크기)는 $D,A$를 함께 고려해야 함 | 2026년 9월 preprint. 특정 optimizer·구조의 계수를 AdamW 기반 소형 모델에 그대로 복사하지 않음 |

최적화 대상도 구별해야 합니다. 위 논문들은 주로 학습 loss, 최종 모델 품질, 메모리 또는 Hyperparameter(하이퍼파라미터)를 연구했습니다. <strong>금융 QA(질의응답)의 정확도·신뢰도에 대한 최적 $E,k$를 직접 검증한 여섯 논문은 아닙니다.</strong>

## 4. 같은 FLOPs와 같은 토큰 수는 다른 질문이다

### 고정 토큰 비교: 같은 양을 읽고 누가 더 잘 배우나?

학습 토큰 수를 $D$라 하고 토큰당 학습 연산량을 $c_{\mathrm{train}}$이라 하면,

$$
C=D\,c_{\mathrm{train}},\qquad
C\approx6DP_{\mathrm{act}}
$$

라는 근사를 출발점으로 삼을 수 있습니다. 뒤 식은 주로 행렬 가중치 연산을 세는 근사입니다. Attention(어텐션), Router(라우터), embedding 처리 방식 등을 반영한 정확한 연산 회계와 실측 시간으로 보완해야 합니다. 실제로 Abnar et al.은 부록 C에서 $6N_aD$ 근사와 더 상세한 추정의 차이를 비교합니다. [원문 부록 C·Figure 7](https://arxiv.org/pdf/2501.12370v3#page=22)

$D$를 고정한 채 활성 파라미터를 늘리면 학습 연산량도 증가합니다. 이때 정확도가 높아져도 “동일한 학습 비용으로 더 좋다”고 할 수 없습니다. 반대로 3B 계산 예시의 네 행처럼 활성 가중치까지 같다면 주요 expert 행렬 연산은 비슷하지만, Router(라우터)와 하드웨어 실행 비용은 추가로 비교해야 합니다.

### 고정 FLOPs 비교: 같은 연산 예산을 어디에 쓸까?

$C$를 고정하면 토큰당 계산이 작은 모델은 더 많은 토큰을 처리할 수 있습니다.

$$
D=\frac{C}{c_{\mathrm{train}}}.
$$

이 경우 Sparsity(희소성)의 효과에는 <strong>활성 경로를 줄이는 효과와 그 대신 더 오래 학습하는 효과</strong>가 함께 들어갑니다. 유일한 원인이 expert 구조라고 해석하면 안 됩니다. 더 많은 토큰을 처리할 때 새 데이터가 늘어나는지, 같은 데이터를 반복하는지도 기록해야 합니다.

| 비교 기준 | 맞추는 것 | 달라질 수 있는 것 | 결론의 의미 |
| --- | --- | --- | --- |
| Fixed Tokens(토큰 수 고정) | 같은 데이터 분포·토큰 수 $D$ | 총 FLOPs, GPU 시간 | 같은 학습량에서 구조가 유리한가? |
| IsoFLOP(연산량 고정) | 동일한 회계로 계산한 총 $C$ | 토큰 수·step 수·학습 기간 | 연산 예산의 배분이 유리한가? |
| Fixed GPU-hours(GPU 시간 고정) | 같은 장비·실행 시간 | 처리 토큰·유효 FLOPs | 실제 장비에서 유리한가? |
| Matched Inference Budget(추론 예산 일치) | 문맥·출력 길이·batch·지연 또는 연산 상한 | 모델·샘플 수 | 운영 조건에서 더 좋은 답을 주는가? |

Learning Rate Schedule(학습률 일정)도 각 학습 종료점에 맞춰야 합니다. 긴 학습의 중간 checkpoint와 짧은 학습의 decay 완료 지점을 섞으면 구조 차이와 학습 진행도 차이가 함께 측정됩니다.

### 총 파라미터를 고정하면 희소성의 최적점이 생긴다

Abnar et al.의 핵심은 조건부 결론입니다. <strong>같은 전체 파라미터 $N$와 학습 연산량 $C$</strong>에서, 너무 많이 활성화하면 읽을 수 있는 토큰 수가 줄고, 너무 적게 활성화하면 한 토큰을 처리하는 경로가 약해집니다. 이 균형에서 최적 Sparsity(희소성)가 나타납니다.

<figure>
  <a href="/images/papers/moe-expert-design/abnar-figure-4.png" target="_blank" rel="noopener"><img src="/images/papers/moe-expert-design/abnar-figure-4.png" width="612" height="675" alt="Figure 4. 전체 파라미터와 학습 연산 예산에 따른 최적 expert 희소성" loading="lazy" /></a>
  <figcaption>Abnar et al., Figure 4. 전체 파라미터와 학습 연산 예산에 따른 최적 expert 희소성 — v3, p. 6. <a href="https://arxiv.org/pdf/2501.12370v3#page=6">원문</a> · <a href="/images/papers/moe-expert-design/abnar-figure-4.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축은 전체 파라미터 $N$의 로그 척도, 세로축은 최적 expert 희소성 $S^*$이며, 색은 학습 연산 예산입니다. 같은 연산 예산에서는 더 큰 모델에 더 높은 Sparsity(희소성)가 대응합니다. 반대로 <strong>같은 전체 크기에 더 많은 학습 연산을 허용하면 더 낮은 Sparsity(희소성), 즉 더 많은 활성 계산이 최적</strong>으로 이동합니다. fitted surface(추정 곡면)에서 얻은 추세이지 모든 개별 구조의 보장값은 아닙니다. [§2–3](https://arxiv.org/pdf/2501.12370v3#page=3)

전체 파라미터 상한을 없애고 $N$까지 키우는 최적화에서는 더 큰 용량과 더 높은 Sparsity(희소성)를 함께 택할 수 있습니다. 이것은 “같은 3B에서 $k$를 계속 줄이면 좋다”는 주장과 다릅니다.

## 5. 그럼 작게 나눈 expert를 많이 고르면 항상 좋을까?

2024년 fine-grained 연구는 전체 non-embedding 파라미터 $N$, 토큰 수 $D$, 세분도 $G$에 대해 다음 형태를 적합합니다.

$$
L(N,D,G)=c+\left(a+\frac{g}{G^\gamma}\right)\frac1{N^\alpha}
+\frac{b}{D^\beta}.
$$

이 식에서 $G$가 커지면 세분화와 관련된 추가 손실 항이 줄지만, $a/N^\alpha$와 데이터 항은 남습니다. “잘게 나누기만 하면 작은 모델도 완벽해진다”는 식이 아닙니다. 또한 이 식의 loss 개선과 Router(라우터)를 실행하는 비용은 별도로 고려합니다. [Krajewski et al., Eq. 9·§6](https://arxiv.org/pdf/2402.07871v1#page=7)

<figure>
  <a href="/images/papers/moe-expert-design/fine-grained-figure-5.png" target="_blank" rel="noopener"><img src="/images/papers/moe-expert-design/fine-grained-figure-5.png" width="1209" height="672" alt="Figure 5. 스케일링 법칙의 적합도와 세분도별 GPU 시간 대비 학습 loss" loading="lazy" /></a>
  <figcaption>Krajewski et al., Figure 5. 스케일링 법칙의 적합도와 세분도별 GPU 시간 대비 학습 loss — v1, p. 8. <a href="https://arxiv.org/pdf/2402.07871v1#page=8">원문</a> · <a href="/images/papers/moe-expert-design/fine-grained-figure-5.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

왼쪽 (a)는 예측 loss와 관측 loss의 일치 정도를 보여줍니다. 오른쪽 (b)는 원문 표기 $N=64\times7\mathrm{M}$, $D=66\mathrm{B}$ 조건의 loss를 NVIDIA A100 GPU 시간에 대해 그립니다. 색은 $G=1,2,4,8,16$입니다. <strong>이 실행 시간 비교에서는 $G=8$이 가장 좋고, $G=16$은 Router(라우터) 비용 때문에 이득이 줄었습니다.</strong> 이 특정 결과를 “어떤 모델이든 top-8”로 바꾸어 읽어서는 안 됩니다.

2025년 *Towards Greater Leverage*는 $G=2$–16의 별도 정의와 실험 조건에서 학습 loss 자체의 U자형 관계를 보고합니다.

<figure>
  <a href="/images/papers/moe-expert-design/leverage-figure-6.png" target="_blank" rel="noopener"><img src="/images/papers/moe-expert-design/leverage-figure-6.png" width="1431" height="687" alt="Figure 6. expert 세분도에 따른 loss와 효율 배율" loading="lazy" /></a>
  <figcaption>Tian et al. (2025), Figure 6. expert 세분도에 따른 loss와 효율 배율 — v4, p. 11. <a href="https://arxiv.org/pdf/2507.17702v4#page=11">원문</a> · <a href="/images/papers/moe-expert-design/leverage-figure-6.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

(a)는 Granularity(세분도)·FLOPs(부동소수점 연산 수)·loss의 관계를 보여주고 주황색 별이 예산별 최적점입니다. (b)는 연산량에 따른 loss와 EL(Efficiency Leverage, 효율 배율)을 보여줍니다. EL은 같은 loss의 dense 대비 연산 효율을 표현하는 논문의 지표이며, 그대로 실측 속도 배율을 뜻하지 않습니다.

해당 $10^{18}$–$10^{20}$ 연산 예산 실험에서 최적 $G$는 약 12였고, Routing Balance(라우팅 균형)가 나쁘면 더 거친 세분도가 유리했습니다. [§4.1.2·부록 D](https://arxiv.org/pdf/2507.17702v4#page=10)

<strong>두 논문의 차이는 “8과 12 중 어느 것이 정답인가”가 아닙니다.</strong> 세분도 정의, 데이터, 구조, 학습·비용 측정 조건이 다릅니다. 공통적으로 얻을 수 있는 설계 원칙은 <strong>expert를 잘게 나누는 이득과 Router(라우터)·실행 비용을 함께 측정하라</strong>는 것입니다. $E,k$만 기록하지 말고 expert hidden dimension, shared 구성, 층 수를 함께 남겨야 합니다.

## 6. 사전학습 loss가 가장 낮은 모델이 금융 추론도 가장 잘할까?

언어의 다음 토큰을 잘 예측하는 것과 여러 수치를 연결해 답을 계산하는 것은 같은 평가가 아닙니다. Nakamura et al.은 전체 expert 수를 늘려 사전학습 loss가 낮아져도 GSM8K·GSM-Plus의 수학 추론이 계속 좋아지지는 않는다고 보고합니다. 반면 TriviaQA와 HellaSwag는 다른 추세를 보였습니다. [§3.2·Figure 1–4](https://arxiv.org/pdf/2508.18672v3#page=5)

이 논문의 주 실험은 <strong>125B 토큰 고정</strong>입니다. 모델 폭과 top-k가 다른 전체 실험을 모두 동일 학습 FLOPs라고 묶을 수 없습니다. §3.3에서는 활성 연산 예산을 맞춘 비교를 다루며, 전체 sweep에서는 활성 파라미터가 커지면 학습 FLOPs도 커진다고 명시합니다. 따라서 “큰 top-k가 좋았다”를 앞의 <strong>활성 파라미터까지 같은 3B 네 구성</strong>의 우열로 옮겨서는 안 됩니다.

논문은 다음 TPP(Tokens per Parameter, 파라미터당 학습 토큰 수)도 분석합니다.

$$
\mathrm{TPP}_{\mathrm{total}}=\frac{D}{P_{\mathrm{tot}}}.
$$

여기서는 분모가 <strong>전체 파라미터</strong>입니다. $D/P_{\mathrm{act}}$와 서로 바꿔 쓸 수 없습니다.

<figure>
  <a href="/images/papers/moe-expert-design/reasoning-figure-7.png" target="_blank" rel="noopener"><img src="/images/papers/moe-expert-design/reasoning-figure-7.png" width="1209" height="552" alt="Figure 7. 전체 파라미터당 학습 토큰 수와 과제별 정확도" loading="lazy" /></a>
  <figcaption>Nakamura et al., Figure 7. 전체 파라미터당 학습 토큰 수와 과제별 정확도 — v3, p. 8. <a href="https://arxiv.org/pdf/2508.18672v3#page=8">원문</a> · <a href="/images/papers/moe-expert-design/reasoning-figure-7.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

가로축은 TPP(파라미터당 학습 토큰 수), 세로축은 각 과제의 정확도입니다. 색과 기호는 폭 $d$와 top-k 조합을 나타냅니다. TriviaQA·HellaSwag 패널과 달리 GSM8K·GSM-Plus 패널에는 중간 TPP에서 좋은 성능을 보이는 경향이 있습니다. 저자는 이 실험의 수학 추론에서 약 20 부근의 최적점을 관측했다고 설명합니다. [§3.4](https://arxiv.org/pdf/2508.18672v3#page=8)

<strong>TPP≈20은 모든 MoE와 금융 QA(질의응답)의 보편 상수가 아닙니다.</strong> 이 값은 특정 데이터 혼합, 크기 범위와 평가에서 나온 결과입니다. 최신 판본은 GSM8K 및 관련 synthetic data를 제거한 125B 재학습 비교도 부록 C.3에 제공하며, 관련 추세가 유지되는지 점검합니다. 원 데이터 구성과 제거 실험을 구분해서 읽어야 합니다. [원문 Table 2·부록 C.3](https://arxiv.org/pdf/2508.18672v3)

<strong>금융 연구에 대한 작성자의 해석:</strong> 공시에서 특정 수치를 찾는 질문, 여러 기간의 수치로 비율을 계산하는 질문, 근거가 부족해 답을 유보해야 하는 질문을 하나의 평균 점수로 합치면 안 됩니다. 암기·근거 추출에 유리한 구조와 계산·일관성에 유리한 구조가 같다고 가정하지 않는 것이 이 논문을 적용하는 출발점입니다. 해당 금융 결론이 원문에서 직접 검증된 것은 아닙니다.

## 7. 구조 비교 전에 학습률과 배치도 공정하게 맞춰야 한다

전체·활성 파라미터를 맞추어도 학습 조건 하나를 복사하면 구조별로 불리함이 생길 수 있습니다. 2026년 *Hyperparameter Scaling Laws Across MoE Sparsity*는 이 문제를 직접 연구합니다.

<figure>
  <a href="/images/papers/moe-expert-design/hyperparameters-figure-2.png" target="_blank" rel="noopener"><img src="/images/papers/moe-expert-design/hyperparameters-figure-2.png" width="1434" height="564" alt="Figure 2. 활성 또는 전체 파라미터를 맞췄을 때 희소성별 학습률과 배치 크기" loading="lazy" /></a>
  <figcaption>Tian et al. (2026), Figure 2. 활성 또는 전체 파라미터를 맞췄을 때 희소성별 학습률과 배치 크기 — v1, p. 4. <a href="https://arxiv.org/pdf/2609.08690v1#page=4">원문</a> · <a href="/images/papers/moe-expert-design/hyperparameters-figure-2.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

(a)는 Learning Rate(학습률), (b)는 Batch Size(배치 크기)에 따른 validation loss입니다. 각 묶음의 왼쪽은 활성 파라미터를, 오른쪽은 전체 파라미터를 맞춥니다. 색은 expert 활성 비율 $A$이고 큰 점은 각 곡선의 최소입니다. <strong>어느 파라미터 수를 맞추어도 Sparsity(희소성)에 따라 좋은 학습률·배치가 움직인다</strong>는 증거입니다. [§2–3](https://arxiv.org/pdf/2609.08690v1#page=3)

논문이 검토한 관계를 구조만 요약하면 다음과 같습니다. $a_\eta,a_B$는 계수이며 앞 절의 활성 비율 $a$와 다른 기호입니다.

$$
\eta^*=a_\eta C^{b_\eta}A^{\delta_\eta},\qquad
B^*=a_B D^{b_B}A^{\delta_B}.
$$

해당 실험에서는 $\delta_\eta>0$, $\delta_B<0$여서, 같은 $C$에서 더 희소할수록 좋은 학습률이 낮아지고, 같은 $D$에서 좋은 global token batch가 커지는 방향을 보입니다. 균형 잡힌 routing을 가정하면 expert 하나가 step당 받는 토큰은 대략 $AB$이므로, 희소해질수록 expert별 학습 신호가 줄어드는 점과 연결됩니다. [§3.2–3.3·부록 C](https://arxiv.org/pdf/2609.08690v1#page=6)

이 방향과 계수는 Muon optimizer, hybrid linear-attention/MLA 구조, WSD(Warmup–Stable–Decay, 준비·유지·감쇠) 일정 등의 실험 조건을 갖습니다. <strong>작성자의 실험 제안은 원문의 학습률 숫자를 복사하는 것이 아니라, 각 구조에 동일한 작은 tuning 예산을 배정하는 것</strong>입니다. 계산 예시의 네 행은 활성 비율이 모두 같으므로, 이 sparsity 보정식만으로 네 행의 우열이나 서로 다른 최적 학습률을 예측할 수도 없습니다.

## 8. 활성 파라미터가 적어도 메모리와 지연이 작다는 보장은 없다

토큰 하나가 일부 expert만 사용해도, 다음 토큰이 다른 expert를 선택할 수 있습니다. 일반적인 resident-weight 실행에서는 <strong>전체 가중치를 메모리에 유지</strong>합니다. 모델 가중치·KV Cache(Key–Value Cache, 키·값 캐시)·작업용 버퍼를 나누어 보아야 합니다.

$$
M_{\mathrm{infer}}\approx b_wP_{\mathrm{tot}}
+M_{\mathrm{KV}}+M_{\mathrm{workspace}}.
$$

$b_w$는 가중치당 byte 수입니다. 3B 가중치를 BF16(bfloat16, 16비트 부동소수점)으로 저장하면 가중치만 약 6GB(십진 단위)이고, 이것이 곧 필요한 전체 GPU 메모리는 아닙니다. 학습에는 gradient, optimizer state, activation 등이 추가됩니다. Offloading(외부 메모리 이동)을 사용하면 상주 메모리를 줄일 수 있지만 데이터 이동 지연이 생깁니다.

Ludziejewski et al.의 *Joint MoE Scaling Laws*는 같은 학습 예산에서 $N_{\mathrm{act}},D,E$를 공동으로 최적화하고 전체 가중치 상한을 추가합니다.

$$
\min_{N_{\mathrm{act}},D,E}L(N_{\mathrm{act}},D,E)
\quad\text{subject to}\quad
6N_{\mathrm{act}}D=F,\quad P_{\mathrm{tot}}\le P_{\max}.
$$

<figure>
  <a href="/images/papers/moe-expert-design/joint-figure-1.png" target="_blank" rel="noopener"><img src="/images/papers/moe-expert-design/joint-figure-1.png" width="1485" height="786" alt="Figure 1. 메모리 제약의 예측과 1.1B 크기 일치 모델의 실험" loading="lazy" /></a>
  <figcaption>Ludziejewski et al., Figure 1. 메모리 제약의 예측과 1.1B 크기 일치 모델의 실험 — v2, p. 2. <a href="https://arxiv.org/pdf/2502.05172v2#page=2">원문</a> · <a href="/images/papers/moe-expert-design/joint-figure-1.png" target="_blank" rel="noopener">원본 크기로 보기</a></figcaption>
</figure>

(a)는 $10^{22}$ FLOPs의 학습 예산에서 전체 파라미터와 loss의 관계를 예측한 그림입니다. 색 곡선은 expert 수, 배경 영역은 메모리 상한에 따른 유리한 구성을 나타냅니다. (b)는 <strong>전체 1.1B를 맞춘 dense와 top-1 MoE($E=2,4$)</strong>를 학습 FLOPs에 대해 비교한 검증입니다. MoE(전문가 혼합)가 같은 총량과 연산 예산에서도 더 많은 토큰을 학습해 낮은 loss에 도달할 수 있음을 보여줍니다. [§4.2](https://arxiv.org/pdf/2502.05172v2#page=6)

논문은 KV Cache(키·값 캐시)와 lifetime inference(전체 운영 기간 추론)의 예산도 분석합니다. 다만 KV Cache(키·값 캐시)가 작아지는 것은 비교 구조의 폭·깊이 등도 달라지기 때문입니다. <strong>Attention(어텐션) 구조를 유지하고 $E,k$만 바꾼다고 KV Cache(키·값 캐시)가 자동으로 줄어들지는 않습니다.</strong>

3B 계산 예시의 64/top-8에는 더 작은 행렬, 더 많은 token-to-expert 할당, 분산 시 통신량·통신 패턴 변화가 생깁니다. 큰 batch의 Prefill(입력 문맥 처리)에서는 작은 expert에도 토큰이 모일 수 있지만, batch 1의 Decode(토큰별 생성)에서는 그렇지 않을 수 있습니다. 이것은 장비·커널에 따라 달라지므로 다음을 실측합니다.

| 측정 대상 | 함께 고정하거나 기록할 조건 |
| --- | --- |
| Prefill(입력 처리) 처리량 | 입력 길이, batch, tokenizer, dtype |
| Decode(토큰별 생성) tokens/s 및 p50/p95 지연 | 출력 길이, batch 1과 실제 서비스 batch, 동시 요청 수 |
| Peak Memory(최대 메모리) | KV 길이, batch, Quantization(양자화), 버퍼·통신 설정 |
| expert별 토큰 분포 | routing 빈도·불균형, dropped token, 층별 차이 |
| GPU 효율·통신 | 동일 GPU 수·종류, expert 배치, kernel 구현, interconnect |

<strong>FLOPs(부동소수점 연산 수)가 비슷해도 latency(지연 시간)는 같지 않습니다.</strong> 따라서 최종 선택은 loss 한 줄이 아니라 정확도·신뢰도·메모리·지연의 Pareto Frontier(어느 지표를 더 개선하려면 다른 지표를 양보해야 하는 후보 집합)에서 해야 합니다.

## 9. 제한된 자원의 1B–3B 금융 QA 실험은 어떻게 시작할까?

<strong>이 절 전체는 작성자의 제안입니다. 아래 구성의 금융 성능과 비용은 아직 측정하지 않았습니다.</strong> 논문 여섯 편이 제시한 최적 구성을 재현했다고 주장하지 않습니다. 특히 1B–3B는 여기서 <strong>전체 파라미터 규모</strong>입니다.

### 두 축을 분리한 작은 후보군

3B 계산 예시를 기준으로 두 실험군을 만듭니다. 초기 학습 탐색은 1B급 축소형에서 시작하고, 유망한 비교만 3B급으로 확장합니다. 크기 간 최적값이 같다고 가정하지 않습니다.

| 실험군 | 후보 | 고정 / 변화 | 핵심 질문 |
| --- | --- | --- | --- |
| A: Granularity(세분도) | 8/top-1, 16/top-2, 32/top-4, 64/top-8 | 전체 3B·공통 0.6B·활성 0.9B를 근사적으로 맞춤 | 같은 저장·활성 예산에서 어떻게 나누는가? |
| B: Sparsity(희소성) | 16/top-1, 16/top-2, 16/top-4 | 전체 3B·expert 합산 크기 150M 고정. 활성은 각각 0.75B/0.9B/1.2B | 같은 저장 용량에 얼마의 활성 계산을 쓸 것인가? |
| C: Dense(밀집) 기준선 | 전체 크기 일치 모델과 활성 규모 일치 모델을 구분 | 3B 기준선은 저장 용량 비교, 약 0.9B 기준선은 활성 계산 비교 | MoE(전문가 혼합)가 무엇 대비 이득인가? |

B군의 숫자 역시 Router(라우터) 등을 단순화한 설계 계산입니다. Dense(밀집) 기준선도 실제 FLOPs와 embedding 회계가 다르므로 0.9B라는 숫자만으로 compute-matched(연산량 일치)라고 부르지 않습니다. 두 dense 기준선을 모두 학습할 자원이 없다면 가능한 하나를 선택하고 비교의 의미를 제한합니다.

학습을 마친 top-2 checkpoint를 그대로 top-1 또는 top-4로 바꾸어 평가하는 것은 <strong>Inference-time Routing Change(추론 시 라우팅 변경)</strong> 실험입니다. 각 구조로 학습한 비교와 섞지 않습니다. Expert(전문가 모듈)를 분할·복제하는 Upcycling(기존 dense 가중치의 MoE 전환)을 쓰면 동일한 출발 checkpoint·전환 방식·추가 학습 예산을 맞추고, from-scratch pretraining(처음부터 사전학습)의 scaling law 검증이라고 표현하지 않습니다.

### 전체 격자를 돌리기 전에 단계별로 줄인다

| 단계 | 제안 실행 범위 | 통제와 기록 | 다음 단계 조건 |
| --- | --- | --- | --- |
| 0. 장비 사전 점검 | A군 4개와 B군의 추가 2개, 총 6구성을 짧게 실행 | 정확한 전체·활성 가중치, FLOPs/token, 실제 처리량·메모리, routing 통계 | 장비에 맞지 않거나 수치 불안정한 후보 제외. 이 단계로 품질 순위를 정하지 않음 |
| 1. 1B급 pilot(예비 실험) | 자원에 맞는 3개 후보, 같은 금융·일반 데이터 혼합의 동일 토큰 예산 | 후보마다 동일하게 작은 Learning Rate(학습률)·global token batch 탐색 예산. 총 tuning 비용 별도 기록 | 검증 loss뿐 아니라 계산 QA·신뢰도·속도로 2개 선정 |
| 2. 예산 조건 대조 | 선정 2개에 Fixed Tokens(토큰 고정)와 IsoFLOP(연산량 고정) 비교 | 종료점에 맞춘 schedule, 동일 데이터 순서 원칙, 반복 epoch·고유 데이터량 기록 | 두 조건의 순위가 달라지는지 확인 |
| 3. 3B급 확인 | 자원이 허용하면 최종 2개만 확장 | 가능한 범위에서 독립 seed 3회, 동일 SFT(Supervised Fine-Tuning, 지도 미세조정) 데이터·평가 절차 | 평균·분산·실측 운영 비용을 함께 보고. 1회면 그 한계를 표시 |
| 4. 금융 QA 최종 평가 | 잠근 test split에서 1회 최종 비교 | 아래 과제별 지표, 동일 decoding·도구·검색 조건 | 사전 정의한 정확도·신뢰도·지연 기준을 만족하는 후보 선택 |

pilot(예비 실험)의 토큰 예산은 임의로 “최적 20 TPP”에 맞추지 않습니다. 단계 0에서 측정한 처리량과 확보된 GPU 시간으로 정하고, 짧은 continued pretraining(지속 사전학습)이면 <strong>제한된 적응 학습에서의 결론</strong>으로 보고합니다. 예산이 2개 모델의 검증도 감당하지 못하면 기존 checkpoint의 후속 학습 비교로 범위를 줄이고, 최적 구조를 찾았다고 주장하지 않습니다.

### 금융 지식, 계산, 신뢰도를 따로 평가한다

금융 문서에 대한 QA(질의응답)를 다음처럼 나눕니다. 기업과 공시 시점·원문 문서가 train/validation/test 사이에 중복되지 않도록 그룹 단위로 분리하고, 같은 표를 바꿔 쓴 질문도 같은 split에 넣습니다. 정답과 근거는 모델 출력과 독립적으로 검증합니다.

| 평가 묶음 | 질문 예시 | 주 지표·오류 구분 |
| --- | --- | --- |
| 근거 추출 | 특정 공시의 매출·기간·단위를 찾아라 | 값·단위·기간의 정확도, 근거 위치의 일치 |
| 수치 추론 | 전년 대비 증감률, 여러 항목의 합·비율을 구하라 | 허용 오차를 미리 정한 수치 정답률, 계산식·중간값 오류 |
| 일관성 | 같은 사실을 다른 표현·표 순서로 물어라 | 동일 의미 질문의 답 일치율, 정답을 유지한 일관성 |
| 응답 유보 | 문서에 없는 기간·누락된 수치를 물어라 | 답변 가능한 문항의 불필요한 거절, 불가능 문항의 근거 없는 답변 |
| Calibration(확률 보정) | 정답에 대한 confidence가 실제 정확도와 맞는가? | Brier Score(확률 오차 점수), ECE(Expected Calibration Error, 기대 보정 오차), Risk–Coverage(위험–응답 비율) 곡선 |

Calibration(확률 보정)을 계산하려면 “confidence”의 정의가 먼저 필요합니다. 생성 문장 전체의 raw likelihood를 정답 확률로 그대로 간주하지 않습니다. 공통 후보 정답을 둔 확률 평가나, 동일 validation split에서 학습한 correctness calibrator(정답 여부 보정기) 등 하나의 절차를 미리 정합니다. 평가 방식·ECE bin 설정·신뢰도 추정 비용도 고정합니다.

정답 여부 $y_i\in\{0,1\}$에 대한 예측 확률을 $p_i$라 하면,

$$
\mathrm{Brier}=\frac1n\sum_{i=1}^n(p_i-y_i)^2.
$$

높은 확신으로 오답을 내면 큰 오차를 받습니다. 응답 유보에서는 confidence 임계값마다 답한 비율인 Coverage(응답 비율)와, 답한 문항 중 틀린 비율인 Risk(위험)를 함께 그립니다. 전부 거절해서 오답을 줄이는 모델을 좋은 모델로 선택하지 않도록, <strong>같은 Coverage(응답 비율)에서 Risk(위험)를 비교</strong>합니다. 가능하면 기업·문서 단위 bootstrap으로 불확실성을 보고합니다.

RAG(Retrieval-Augmented Generation, 검색 증강 생성)를 사용하면 먼저 모든 모델에 동일한 근거 문서를 주어 생성기를 비교합니다. 그다음 동일 retriever와 검색 예산을 적용한 전체 시스템 평가를 추가합니다. Calculator(계산기) 사용 여부와 Test-Time Compute(추론 시 연산량), 최대 출력 길이·샘플 수를 맞춰야 구조와 도구 효과가 섞이지 않습니다.

## 10. 선택할 것은 숫자 하나가 아니라 조건에 맞는 구성이다

총 파라미터가 정해졌을 때의 설계 순서는 다음과 같습니다.

1. <strong>회계를 고정합니다.</strong> 전체·공통·활성 파라미터, expert 크기, embedding·shared expert 포함 여부를 기록합니다.
2. <strong>Sparsity(희소성)와 Granularity(세분도)를 분리합니다.</strong> 같은 $k/E$의 세분화와, 같은 전체 크기에서 $k$를 바꾸는 실험을 따로 합니다.
3. <strong>예산의 단위를 정합니다.</strong> Fixed Tokens(토큰 고정), IsoFLOP(연산량 고정), GPU 시간을 구별합니다.
4. <strong>과제의 성공 기준을 정합니다.</strong> 사전학습 loss, 금융 계산 정답률, Calibration(확률 보정), 응답 유보를 별도로 평가합니다.
5. <strong>실제 장비에서 후보를 고릅니다.</strong> 메모리와 batch 1 지연까지 만족하는 구성 중에서 비교합니다.

3B·공통 0.6B·활성 0.9B라면 8/top-1부터 64/top-8까지 모두 같은 파라미터 예산의 후보가 될 수 있습니다. 그중 어느 것이 좋은지는 <strong>더 잘게 조합하는 이득이 학습·라우팅·하드웨어 비용을 넘어서는지, 그리고 목표 금융 과제에서 그 이득이 유지되는지</strong>로 결정해야 합니다. 여섯 논문이 제공하는 것은 한 쌍의 정답 $E,k$보다, 이 선택을 공정하게 검증하는 조건들입니다.
