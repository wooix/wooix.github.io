---
title: 'Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention — 절별 해설'
description: 'Attention의 계산 순서를 바꿔 선형 복잡도와 고정 크기 상태를 얻는 원리, 수식과 역전파, 4,462배 처리량의 비교 조건을 원문 그림·표와 함께 읽습니다.'
publishedAt: '2026-09-21'
topic: llm-tech
category: architecture
tags: ['Transformer', 'Linear Attention', 'RNN', 'Efficient Inference', 'ICML 2020', '논문 해설']
kind: research-review
readingTime: 30
featured: false
draft: false
sourceLinks:
  - title: 'Katharopoulos et al. · arXiv v3 · 2020-08-31'
    url: https://arxiv.org/abs/2006.16236v3
    kind: 원문
  - title: '검토 PDF · 본문 및 Supplementary Material'
    url: https://arxiv.org/pdf/2006.16236v3
    kind: PDF
  - title: '저자 프로젝트 · Linear Transformers'
    url: https://linear-transformers.com/
    kind: 코드
takeaway: '유한 차원 Feature Map으로 바꾼 Attention은 과거를 두 누적 상태로 요약할 수 있다. 속도 향상의 크기는 캐시·배치·처리량과 지연시간의 비교 조건에 달려 있다.'
---

검토 논문은 Angelos Katharopoulos, Apoorv Vyas, Nikolaos Pappas, François Fleuret의 ICML 2020 논문입니다. **최초 공개는 2020-06-29, 검토 판본은 arXiv v3(2020-08-31), 이 해설 게시일은 2026-09-21**입니다. [원문과 판본 기록](https://arxiv.org/abs/2006.16236v3) · [전체 PDF](https://arxiv.org/pdf/2006.16236v3)

다음 설명은 원문 절 순서를 따릅니다. Figure 1–9, Table 1–5의 모든 행·패널, Algorithm 1과 식 (1)–(27)을 포함합니다. 부록 A–D도 다루며 참고문헌 목록·감사의 글은 재수록하지 않습니다. 전문 용어는 일반 논문 리뷰의 English(한국어) 병기 규칙을 따릅니다.

## Abstract

<strong>Linear Attention(선형 어텐션)</strong>의 핵심은 과거의 모든 항목을 매번 서로 비교하는 대신, 재사용할 수 있는 요약을 먼저 계산하는 것입니다. 원문은 <strong>Feature Map(특징 사상)</strong>으로 유사도를 정의하고 행렬곱의 결합 순서를 바꿔, 길이 $N$에 대한 Attention(어텐션)의 계산량을 이차에서 선형으로 줄입니다.

이 구조에 <strong>Causal Masking(인과적 마스킹)</strong>을 적용하면 과거를 두 상태에 누적하는 <strong>RNN(Recurrent Neural Network, 순환 신경망)</strong> 형태가 됩니다. 논문의 속도 수치는 이미지 자기회귀 생성 실험에서 나온 결과입니다. 표준 Softmax(소프트맥스)와 완전히 같은 함수를 유한 메모리로 계산한다는 뜻도, 모든 작업에서 정확도가 같다는 뜻도 아닙니다. [원문 초록·§3–4](https://arxiv.org/pdf/2006.16236v3#page=1)

## 1. Introduction

회의 중 새 질문이 나올 때마다 모든 회의록을 다시 펼쳐 보는 대신, 항목별 누적 메모에서 답을 꺼내는 상황을 떠올릴 수 있습니다. 이는 이 해설의 이해용 비유입니다. 실제로 무엇을 요약하고 다시 꺼낼지는 아래의 $S_i$, $Z_i$, Query(질의)가 결정합니다.

표준 <strong>Self-Attention(자기 어텐션)</strong>은 각 위치가 모든 위치와 비교되므로 $N\times N$ 관계를 계산합니다. 원문이 다루는 문제는 긴 문맥의 학습 비용과, 하나를 생성한 뒤 다음 것을 생성해야 하는 <strong>Autoregressive Generation(자기회귀 생성)</strong>의 비용입니다.

저자들은 유사도 함수를 Kernel(커널) 관점으로 표현하고, 계산을 공유하며, 인과적인 경우에는 누적 상태를 재사용합니다. 이것이 학습에서의 병렬 계산과 생성에서의 순차 상태 갱신을 연결합니다. [원문 §1](https://arxiv.org/pdf/2006.16236v3#page=1)

## 2. Related Work

### 2.1. Efficient Transformers

Pruning(가지치기), Quantization(양자화), Knowledge Distillation(지식 증류)은 모델의 비용을 줄이지만, 전체 Attention(어텐션)을 유지하면 시퀀스 길이에 대한 이차 의존성은 남습니다. Transformer-XL과 Adaptive Attention Span(적응형 어텐션 범위)은 문맥을 다루는 다른 접근입니다.

Sparse Transformer(희소 트랜스포머)는 일부 관계만 계산하고, Reformer는 LSH(Locality-Sensitive Hashing, 지역 민감 해싱)로 유사한 항목을 모읍니다. 원문은 각각 $\mathcal O(N\sqrt N)$, $\mathcal O(N\log N)$의 복잡도를 비교합니다. Linear Attention(선형 어텐션)은 Query(질의)와 Key(키)를 같게 둘 필요 없이 집계 순서를 바꿉니다. 이는 논문 당시 비교 대상에 대한 설명입니다.

### 2.2. Understanding Self-Attention

기존 Kernel(커널) 관점에서는 Attention(어텐션)을 유사도에 따른 가중 평균으로 해석합니다. 이 논문은 그 관점을 계산 절감에 사용합니다. Convolution(합성곱)을 표현할 수 있는가를 묻는 연구와 달리, 인과적 Attention(어텐션)을 시간 방향의 상태 갱신으로 표현할 수 있는지에 집중합니다.

### 2.3. Linearized softmax

큰 분류 문제에서 Softmax(소프트맥스)를 Feature Map(특징 사상)의 내적으로 다루려는 연구가 배경입니다. 여기서는 Attention(어텐션)과 인과적 생성, 역전파까지 연결합니다. 다만 정확한 지수 커널의 특징 공간은 무한 차원이므로, 실험에서 쓰는 유한 차원 함수와 구분해야 합니다. [원문 §2](https://arxiv.org/pdf/2006.16236v3#page=2)

## 3. Linear Transformers

### 3.1. Transformers

입력 $x\in\mathbb R^{N\times F}$에서 $N$은 위치 수, $F$는 입력 특징 수입니다. 원문은 층을 다음처럼 단순화해 씁니다.

$$
T_l(x)=f_l(A_l(x)+x). \tag{1}
$$

$A_l$은 위치 사이를 섞는 Self-Attention(자기 어텐션), $f_l$은 각 위치에 독립적으로 적용하는 함수입니다. $+x$는 Residual Connection(잔차 연결)입니다. 아래의 초점은 전체 구조를 없애는 것이 아니라 $A_l$의 계산을 바꾸는 데 있습니다.

$$
\begin{aligned}
Q&=xW_Q,\quad K=xW_K,\quad V=xW_V,\\
A_l(x)=V'&=\operatorname{softmax}\!\left(\frac{QK^T}{\sqrt D}\right)V.
\end{aligned}\tag{2}
$$

Query(질의) $Q$와 Key(키) $K$의 차원은 $D$, Value(값) $V$의 차원은 $M$입니다. $QK^T$는 모든 위치 쌍의 점수이며, 행별 Softmax(소프트맥스)가 합이 1인 가중치로 바꿉니다. 일반적인 유사도 함수로 쓰면 다음과 같습니다.

$$
V'_i=\frac{\sum_{j=1}^{N}\operatorname{sim}(Q_i,K_j)V_j}
{\sum_{j=1}^{N}\operatorname{sim}(Q_i,K_j)}.\tag{3}
$$

분자는 유사도가 높은 Value(값)를 더 크게 섞고, 분모는 가중치의 전체 크기를 정규화합니다. $\operatorname{sim}(q,k)=\exp(q^Tk/\sqrt D)$이면 식 (2)와 같습니다. [원문 §3.1](https://arxiv.org/pdf/2006.16236v3#page=3)

### 3.2. Linearized Attention

유사도를 $\phi(q)^T\phi(k)$로 표현할 수 있고 음수가 아닌 점수를 얻는 경우를 생각합니다. 정규화 분모도 0이 아니어야 합니다.

$$
V'_i=\frac{\sum_{j=1}^{N}\phi(Q_i)^T\phi(K_j)V_j}
{\sum_{j=1}^{N}\phi(Q_i)^T\phi(K_j)}.\tag{4}
$$

$$
V'_i=\frac{\phi(Q_i)^T\left(\sum_{j=1}^{N}\phi(K_j)V_j^T\right)}
{\phi(Q_i)^T\left(\sum_{j=1}^{N}\phi(K_j)\right)}.\tag{5}
$$

식 (4)에서 (5)로 갈 때는 동일한 Feature Map(특징 사상) 아래에서 결합법칙만 사용합니다. 모든 Query(질의)가 공유하는 Key–Value(키–값) 집계를 먼저 만들면, 질의마다 과거 전체를 다시 펼칠 필요가 없습니다. 분자의 행렬 계산이 이를 가장 간결하게 보여줍니다.

$$
\bigl(\phi(Q)\phi(K)^T\bigr)V
=\phi(Q)\bigl(\phi(K)^TV\bigr).\tag{6}
$$

$\phi(Q),\phi(K)\in\mathbb R^{N\times C}$일 때 왼쪽 중간 행렬은 $N\times N$, 오른쪽은 $C\times M$입니다. 따라서 특징 차원 $C$와 값 차원 $M$을 고정하면 길이 $N$에 선형인 계산이 가능합니다. <strong>Softmax(소프트맥스) 바깥의 괄호를 마음대로 옮긴 것이 아니라, 먼저 유사도 함수의 표현을 선택한 뒤 그 내적을 재결합한 것</strong>입니다.

#### 3.2.1. Feature Maps and Computational Cost

원문은 표준 Attention(어텐션)의 비용을 $\mathcal O(N^2\max(D,M))$, 특징 계산 이후 Linear Attention(선형 어텐션)의 비용을 $\mathcal O(NCM)$으로 비교합니다. 차수 2의 Polynomial Kernel(다항 커널)은 $\mathcal O(ND^2M)$이며, 유리해지는 길이 조건도 특징 차원에 의존합니다.

실험에서 선택한 함수는 다음과 같습니다.

$$
\phi(x)=\operatorname{elu}(x)+1.\tag{7}
$$

ELU(Exponential Linear Unit, 지수 선형 유닛)를 원소별로 적용합니다. 양의 특징을 만들면서, 음수 입력에서 ReLU(정류 선형 유닛)처럼 기울기를 곧바로 0으로 만들지 않기 위한 선택입니다. 이때 $C=D$이므로 비용은 $\mathcal O(NDM)$입니다.

정확한 Softmax(소프트맥스)의 지수 커널은 무한 차원 Feature Map(특징 사상)을 필요로 합니다. 식 (7)은 동일한 Softmax(소프트맥스)를 계산하는 항등변환이 아니라 다른 Attention(어텐션) 함수를 만드는 설계입니다. [원문 §3.2](https://arxiv.org/pdf/2006.16236v3#page=3)

### 3.3. Causal Masking

미래 위치를 볼 수 없도록 합의 범위를 $j\le i$로 제한합니다.

$$
V'_i=\frac{\sum_{j=1}^{i}\operatorname{sim}(Q_i,K_j)V_j}
{\sum_{j=1}^{i}\operatorname{sim}(Q_i,K_j)}.\tag{8}
$$

$$
V'_i=\frac{\phi(Q_i)^T\sum_{j=1}^{i}\phi(K_j)V_j^T}
{\phi(Q_i)^T\sum_{j=1}^{i}\phi(K_j)}.\tag{9}
$$

$$
S_i=\sum_{j=1}^{i}\phi(K_j)V_j^T,\tag{10}
$$

$$
Z_i=\sum_{j=1}^{i}\phi(K_j),\tag{11}
$$

$$
V'_i=\frac{\phi(Q_i)^TS_i}{\phi(Q_i)^TZ_i}.\tag{12}
$$

$S_i\in\mathbb R^{C\times M}$는 Key–Value(키–값) 관계를 누적한 기억이고, $Z_i\in\mathbb R^C$는 정규화를 위한 Key(키)의 합입니다. 새 위치에서는 직전 상태에 새 항목 하나를 더합니다. 상태의 크기는 길이 $i$와 함께 커지지 않지만, 특징·값 차원과 층·헤드·배치 수에는 의존합니다.

#### 3.3.1. Gradient Computation

식 (12)를 그대로 자동 미분하면 모든 중간 $S_i$를 저장할 수 있습니다. 그러면 $N$개의 $C\times M$ 행렬 때문에 메모리 이점이 줄어듭니다. 저자는 분자의 Gradient(기울기)를 앞방향·뒷방향 누적합으로 계산합니다. $\bar V_i$는 식 (9)의 분자이고 $\mathcal L$은 스칼라 손실입니다.

$$
\nabla_{\phi(Q_i)}\mathcal L=
\nabla_{\bar V_i}\mathcal L\left(\sum_{j=1}^{i}\phi(K_j)V_j^T\right)^T.\tag{13}
$$

$$
\nabla_{\phi(K_i)}\mathcal L=
\left(\sum_{j=i}^{N}\phi(Q_j)(\nabla_{\bar V_j}\mathcal L)^T\right)V_i.\tag{14}
$$

$$
\nabla_{V_i}\mathcal L=
\left(\sum_{j=i}^{N}\phi(Q_j)(\nabla_{\bar V_j}\mathcal L)^T\right)^T\phi(K_i).\tag{15}
$$

Query(질의) $i$는 해당 출력에만 직접 쓰이므로 앞쪽 누적 기억으로 기울기를 계산합니다. Key(키)·Value(값) $i$는 이후 모든 출력에 영향을 주므로 $i$부터 끝까지의 기여를 역순으로 합산합니다. 식의 행·열 표기는 원문 관례를 따릅니다.

<strong>고정 메모리는 누적합에 쓰는 작업 상태에 대한 표현</strong>입니다. 입력·출력·기울기 등을 포함한 이 Attention(어텐션) 알고리즘의 메모리는 원문에서 $\mathcal O(N\max(C,M))$, 시간은 $\mathcal O(NCM)$으로 명시합니다. 학습 전체 메모리가 길이와 무관하다고 읽으면 안 됩니다.

<figure class="paper-figure" id="algorithm-1"><a href="/images/papers/katharopoulos-2020/algorithm-1.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/algorithm-1.png" width="717" height="999" alt="Algorithm 1: 인과적 Linear Attention 분자의 순전파와 두 방향 누적합 역전파" loading="lazy" /></a><figcaption>Algorithm 1. 인과적 Linear Attention의 분자 계산. <a href="/images/papers/katharopoulos-2020/algorithm-1.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=5">원문 v3 p.5</a>. Katharopoulos et al. (2020).</figcaption></figure>

Algorithm 1은 분자의 Forward Pass(순전파)에서 $S$를 갱신하고 출력을 계산합니다. Backward Pass(역전파)는 앞방향 순회로 Query(질의)의 기울기를, 뒷방향 순회로 Key(키)와 Value(값)의 기울기를 계산합니다. 매 위치의 큰 중간 행렬을 전부 저장하지 않는 것이 목적입니다. 분모와 나눗셈의 미분은 별도로 자동 미분이 처리하며, 이 알고리즘 그림만으로 정규화 전체가 구현된 것은 아닙니다.

#### 3.3.2. Training and Inference

학습할 때는 정답 시퀀스가 주어지므로 위치별 연산과 누적합을 병렬화할 수 있습니다. 생성할 때는 직전 출력이 다음 입력이 되므로 시간축 순차 의존성은 남습니다. Linear Attention(선형 어텐션)은 이 순차 과정을 없애지 않고, <strong>각 단계의 Attention(어텐션) 상태 갱신 비용을 과거 길이에 무관하게</strong> 만듭니다.

원문 본문의 느린 Softmax(소프트맥스) 기준은 이전 위치의 계산을 다시 수행합니다. Key–Value Cache(키–값 캐시)를 쓰면 이전 투영을 재사용할 수 있으며, 이 비교는 부록 C에서 따로 다룹니다. [원문 §3.3·Algorithm 1](https://arxiv.org/pdf/2006.16236v3#page=4)

### 3.4. Transformers are RNNs

Attention Memory(어텐션 기억) $s$와 Normalizer Memory(정규화 기억) $z$로 층을 다시 쓰면 다음과 같습니다.

$$
s_0=0,\tag{16}
$$

$$
z_0=0,\tag{17}
$$

$$
s_i=s_{i-1}+\phi(x_iW_K)(x_iW_V)^T,\tag{18}
$$

$$
z_i=z_{i-1}+\phi(x_iW_K),\tag{19}
$$

$$
y_i=f_l\!\left(\frac{\phi(x_iW_Q)^Ts_i}{\phi(x_iW_Q)^Tz_i}+x_i\right).\tag{20}
$$

식 (18)은 새 정보를 기억에 쓰고, 식 (20)은 현재 Query(질의)로 기억을 읽습니다. 여기서 Recurrence(순환)는 층의 깊이가 아닌 시간 방향입니다. 단순히 Transformer(트랜스포머)를 기존 LSTM(Long Short-Term Memory, 장단기 기억망)과 동일시하는 주장도 아닙니다.

이론적으로 다른 Kernel(커널)에도 상태 표현을 적용할 수 있지만, 유한 크기 상태로 실제 구현 가능한지는 Feature Map(특징 사상)의 차원에 달려 있습니다. 정확한 Softmax(소프트맥스)의 무한 차원 특징과 식 (7)의 실용적 유한 상태를 구분해야 제목의 의미가 정확해집니다. [원문 §3.4](https://arxiv.org/pdf/2006.16236v3#page=5)

## 4. Experiments

비교 표기의 `softmax`는 표준 PyTorch 구현, `linear`는 제안 모델, `lsh-X`는 해싱을 $X$회 수행한 Reformer입니다. Reformer는 PyTorch 재구현이며 Reversible Layer(가역 층)는 사용하지 않습니다. 메모리 벤치마크는 Self-Attention(자기 어텐션) 층을 대상으로 합니다. 저자들은 식 (13)–(15)의 계산을 CUDA로 구현했습니다. [원문 §4](https://arxiv.org/pdf/2006.16236v3#page=5) · [저자 프로젝트](https://linear-transformers.com/)

### 4.1. Synthetic Tasks

#### 4.1.1. Convergence Analysis

10종류 기호와 구분자를 쓰는 최대 길이 128의 복사 과제입니다. 4층·8헤드, 배치 64, RAdam을 사용하며 학습률은 $10^{-3}$에서 3,000회 갱신 후 $10^{-4}$로 낮춥니다.

<figure class="paper-figure" id="figure-2"><a href="/images/papers/katharopoulos-2020/figure-2.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-2.png" width="705" height="414" alt="Figure 2: 시퀀스 복사 과제의 학습 손실. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 2. 시퀀스 복사 과제의 학습 손실. <a href="/images/papers/katharopoulos-2020/figure-2.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=6">원문 v3 p.6</a>. Katharopoulos et al. (2020).</figcaption></figure>

가로축은 Gradient Steps(기울기 갱신 횟수), 세로축은 로그 척도의 Cross-Entropy Loss(교차 엔트로피 손실)입니다. 검정 실선은 Linear(선형), 빨강 파선은 Softmax(소프트맥스), 파랑 점선은 LSH-4입니다. Linear(선형)은 안정적으로 낮아지며 최종적으로 Softmax(소프트맥스)와 비슷한 손실에 도달합니다. 중간 단계에서는 Softmax(소프트맥스)가 더 낮은 손실을 보이므로 ‘전체 학습 과정이 동일하다’고 해석하지 않습니다.

#### 4.1.2. Memory and Computational Requirements

길이 $2^9$부터 $2^{16}$까지 합성 입력의 순전파·역전파 시간과 최대 GPU 메모리를 측정합니다. 배치 크기를 길이에 반비례하게 조정하고 샘플당 수치를 보고합니다. GPU는 **GTX 1080 Ti 11GB**입니다.

<figure class="paper-figure" id="figure-1"><a href="/images/papers/katharopoulos-2020/figure-1.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-1.png" width="1458" height="414" alt="Figure 1: 시퀀스 길이에 따른 순전파·역전파 시간과 GPU 메모리. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 1. 시퀀스 길이에 따른 순전파·역전파 시간과 GPU 메모리. <a href="/images/papers/katharopoulos-2020/figure-1.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=6">원문 v3 p.6</a>. Katharopoulos et al. (2020).</figcaption></figure>

두 패널의 가로축은 Sequence Length(시퀀스 길이), 왼쪽 세로축은 밀리초, 오른쪽은 MB이며 로그 척도를 사용합니다. 검정은 Linear(선형), 빨강은 Softmax(소프트맥스), 파랑 계열은 LSH-1/4/8입니다. 선이 끝나는 위치도 메모리 한계를 나타냅니다. Softmax(소프트맥스)는 4,096까지, LSH-4와 LSH-8은 16,384까지 들어갑니다.

이 측정 범위에서는 Reformer도 거의 선형처럼 보이지만 이론적 $\mathcal O(N\log N)$이 $\mathcal O(N)$으로 바뀐 것은 아닙니다. 이 실험은 Attention(어텐션) 연산의 비용 비교이며 오늘날 모든 구현·GPU의 성능표가 아닙니다. [원문 §4.1](https://arxiv.org/pdf/2006.16236v3#page=6)

### 4.2. Image Generation

픽셀을 순차적으로 예측합니다. Bits per Dimension(차원당 비트 수, bits/dim)은 낮을수록 좋고, Throughput(처리량)인 images/sec는 높을수록 좋습니다. 학습의 배치 설정, 여러 이미지를 동시에 생성하는 처리량, 한 장을 완성하는 Latency(지연시간)는 서로 구분해야 합니다.

#### 4.2.1. MNIST

784픽셀의 손글씨 이미지에 8층·8헤드·Embedding(임베딩) 256차원, 헤드당 32차원을 사용합니다. Feed-Forward Network(순방향 신경망)의 폭은 4배이며 출력은 10개 Logistic Distribution(로지스틱 분포)의 혼합으로 모델링합니다. RAdam, 학습률 $10^{-4}$, 250 Epoch(전체 데이터 반복), 모든 방법의 학습 배치는 10입니다. Reformer는 64버킷과 29항목짜리 27청크를 사용합니다.

**Table 1. MNIST 생성 결과 — 모든 행.** 괄호는 표의 Softmax 처리량 대비 배수입니다. [원문 Table 1](https://arxiv.org/pdf/2006.16236v3#page=7)

| Method | Bits/dim ↓ | Images/sec ↑ |
| --- | ---: | ---: |
| Softmax | 0.621 | 0.45 (1×) |
| LSH-1 | 0.745 | 0.68 (1.5×) |
| LSH-4 | 0.676 | 0.27 (0.6×) |
| Linear (ours) | 0.644 | 142.8 (317×) |

Linear(선형)의 품질 지표는 Softmax(소프트맥스)보다 약간 나쁘지만 처리량은 높습니다. 원문은 작은 상태 덕분에 GPU 한 대에서 MNIST 이미지 10,000장을 동시에 생성할 수 있다고 설명합니다. **학습 배치 10이라는 설정을 이 처리량 표의 동일 생성 배치 조건으로 읽으면 안 됩니다.** 배치를 1로 맞춘 지연시간은 Table 5에서 따로 확인합니다.

<figure class="paper-figure" id="figure-3"><a href="/images/papers/katharopoulos-2020/figure-3.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-3.png" width="705" height="597" alt="Figure 3: Linear 모델의 MNIST 무조건부 생성과 이미지 완성. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 3. Linear 모델의 MNIST 무조건부 생성과 이미지 완성. <a href="/images/papers/katharopoulos-2020/figure-3.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=8">원문 v3 p.8</a>. Katharopoulos et al. (2020).</figcaption></figure>

위쪽은 Unconditional Generation(무조건부 생성), 아래쪽은 Image Completion(이미지 완성)입니다. (a)는 가린 입력, (b)는 여러 생성 결과, (c)는 원본입니다. 같은 입력에서 다양한 하단 획을 생성하면서도 기존 획의 굵기와 모양을 이어 가는지 읽습니다. 몇 개의 선택된 그림만으로 전체 품질이나 우월성을 판정할 수는 없습니다.

#### 4.2.2. CIFAR-10

32×32 RGB 이미지는 3,072개의 채널 값을 순서대로 예측합니다. 16층이며 층 내부 설정은 MNIST와 같습니다. Reformer는 64버킷과 37항목짜리 83청크입니다. **P40 24GB GPU 한 대에서 7일간 학습**하며 Softmax(소프트맥스)의 학습 배치는 1, 나머지는 4입니다.

**Table 2. CIFAR-10 생성 결과 — 모든 행.** 같은 학습 시간 예산이며 같은 Epoch 수가 아닙니다. [원문 Table 2](https://arxiv.org/pdf/2006.16236v3#page=7)

| Method | Bits/dim ↓ | Images/sec ↑ |
| --- | ---: | ---: |
| Softmax | 3.47 | 0.004 (1×) |
| LSH-1 | 3.39 | 0.015 (3.75×) |
| LSH-4 | 3.51 | 0.005 (1.25×) |
| Linear (ours) | 3.40 | 17.85 (4,462×) |

빠른 모델은 같은 7일 동안 더 많이 학습합니다. 따라서 품질 차이를 Attention(어텐션) 함수만의 효과로 분리할 수 없습니다. LSH-1은 여기서 Linear(선형)보다 bits/dim이 조금 낮지만 처리량은 훨씬 작습니다. **4,462×는 캐시 없는 표준 구현에 대한 처리량 배수**이며, 캐시를 쓴 Softmax(소프트맥스)와의 비교는 부록 C.1에 있습니다.

<figure class="paper-figure" id="figure-4"><a href="/images/papers/katharopoulos-2020/figure-4.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-4.png" width="702" height="597" alt="Figure 4: Linear 모델의 CIFAR-10 무조건부 생성과 이미지 완성. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 4. Linear 모델의 CIFAR-10 무조건부 생성과 이미지 완성. <a href="/images/papers/katharopoulos-2020/figure-4.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=8">원문 v3 p.8</a>. Katharopoulos et al. (2020).</figcaption></figure>

위쪽은 무조건부 생성 샘플, 아래쪽 (a)–(c)는 가린 입력·완성 결과·원본입니다. 개의 코와 트럭 앞 유리처럼 주어진 상단과 하단의 구조가 연결되는지 볼 수 있습니다. 저자의 정성적 관찰이며 객체 인식 정확도를 별도로 측정한 표가 아닙니다. [원문 §4.2](https://arxiv.org/pdf/2006.16236v3#page=7)

### 4.3. Automatic Speech Recognition

WSJ 80시간 음성 데이터에 CTC(Connectionist Temporal Classification, 연결주의 시간 분류) 손실을 사용합니다. 입력은 시간 차분 없는 40차원 Mel Filterbank(멜 필터뱅크), 평균 길이 800프레임·최대 2,400프레임입니다. 각 프레임에서 음소 분포를 예측하는 **비자기회귀** 설정입니다.

비교 Bi-LSTM(양방향 장단기 기억망)은 3층·은닉 크기 320입니다. Transformer(트랜스포머)는 9층·6헤드입니다. 원문은 임베딩 차원을 이미지 실험과 같다고 적고 있으며, 별도의 헤드별 차원은 이 절에서 명시하지 않습니다. LSTM은 Adam $10^{-3}$, Transformer는 RAdam $10^{-4}$에서 시작하고 검증 개선이 멈추면 학습률을 줄입니다.

**Table 3. WSJ 음성 인식 — 모든 행.** PER(Phoneme Error Rate, 음소 오류율)과 Epoch당 초 모두 낮을수록 좋습니다. [원문 Table 3](https://arxiv.org/pdf/2006.16236v3#page=8)

| Method | Validation PER ↓ | Time/epoch (s) ↓ |
| --- | ---: | ---: |
| Bi-LSTM | 10.94 | 1047 |
| Softmax | 5.12 | 2711 |
| LSH-4 | 9.33 | 2250 |
| Linear (ours) | 8.08 | 824 |

Linear(선형)은 LSTM과 LSH-4보다 빠르고 오류율도 낮습니다. 그러나 **Softmax(소프트맥스)의 5.12가 Linear(선형)의 8.08보다 좋습니다.** Epoch당 약 3.3배 빠르다는 것과 같은 정확도라는 것은 다릅니다. 논문의 모든 과제에서 무손실 가속을 얻었다고 요약해서는 안 되는 이유입니다.

## 5. Conclusions

저자의 기여는 Feature Map(특징 사상) 기반 Attention(어텐션)의 재결합, 인과적 누적합과 효율적인 Gradient(기울기) 계산, 그리고 이를 시간 방향의 RNN(순환 신경망)으로 표현한 데 있습니다. 긴 시퀀스의 비용을 줄이면서 학습과 추론을 다른 실행 방식으로 다룰 수 있습니다.

저자들은 기억의 저장·검색 구조와 Feature Map(특징 사상) 선택을 후속 연구 방향으로 제시합니다. Random Fourier Features(무작위 푸리에 특징)로 커널을 근사해 사전학습 모델을 활용할 가능성도 언급하지만, 이 논문에서 검증한 결과는 아닙니다. [원문 §5](https://arxiv.org/pdf/2006.16236v3#page=8)

## A. Gradient Derivation

부록은 인과적 Attention(어텐션)의 분자 미분을 전개합니다. 식 (21)은 식 (9)을 다시 제시합니다.

$$
V'_i=\frac{\phi(Q_i)^T\sum_{j=1}^{i}\phi(K_j)V_j^T}
{\phi(Q_i)^T\sum_{j=1}^{i}\phi(K_j)}.\tag{21}
$$

이 부록에서 $Q,K$는 이미 $\phi$를 적용한 특징이라고 놓습니다. 따라서 아래의 $D$는 이 부록 표기의 특징 차원입니다. 분모와 나눗셈은 자동 미분에 맡기고 분자만 씁니다.

$$
\bar V_i=Q_i^T\sum_{j=1}^{i}K_jV_j^T.\tag{22}
$$

$$
\bar V_{ie}=\sum_{d=1}^{D}Q_{id}\sum_{j=1}^{i}K_{jd}V_{je}
=\sum_{d=1}^{D}\sum_{j=1}^{i}Q_{id}K_{jd}V_{je}.\tag{23}
$$

$e$는 출력 Value(값)의 성분, $d$는 특징 성분입니다. 행렬식을 성분별 합으로 풀면 어떤 입력이 어떤 출력에 영향을 주는지 드러납니다. $Q_{lt}$는 $l$번째 출력에만 직접 영향을 줍니다.

$$
\frac{\partial\mathcal L}{\partial Q_{lt}}
=\sum_{e=1}^{M}\frac{\partial\mathcal L}{\partial\bar V_{le}}
\frac{\partial\bar V_{le}}{\partial Q_{lt}}
=\sum_{e=1}^{M}\frac{\partial\mathcal L}{\partial\bar V_{le}}
\left(\sum_{j=1}^{l}K_{jt}V_{je}\right).\tag{24}
$$

$$
\nabla_{Q_i}\mathcal L=\nabla_{\bar V_i}\mathcal L
\left(\sum_{j=1}^{i}K_jV_j^T\right)^T.\tag{25}
$$

이것이 본문의 식 (13)입니다. 반면 $K_{lt}$는 $l$ 이후의 모든 출력에 쓰이므로 그 기여를 전부 합해야 합니다.

$$
\begin{aligned}
\frac{\partial\mathcal L}{\partial K_{lt}}
&=\sum_{e=1}^{M}\sum_{i=l}^{N}
\frac{\partial\mathcal L}{\partial\bar V_{ie}}
\frac{\partial\bar V_{ie}}{\partial K_{lt}}\\
&=\sum_{e=1}^{M}\sum_{i=l}^{N}
\frac{\partial\mathcal L}{\partial\bar V_{ie}}
\frac{\partial\bigl(\sum_{d=1}^{D}\sum_{j=1}^{i}Q_{id}K_{jd}V_{je}\bigr)}{\partial K_{lt}}\\
&=\sum_{e=1}^{M}\sum_{i=l}^{N}
\frac{\partial\mathcal L}{\partial\bar V_{ie}}Q_{it}V_{le}.
\end{aligned}\tag{26}
$$

$$
\nabla_{K_i}\mathcal L=
\left(\sum_{j=i}^{N}Q_j(\nabla_{\bar V_j}\mathcal L)^T\right)V_i.\tag{27}
$$

이는 식 (14)이고, 같은 논리로 $V$를 미분하면 식 (15)가 나옵니다. Query(질의)는 Prefix Sum(앞쪽 누적합), Key(키)·Value(값)는 Suffix Sum(뒤쪽 누적합)을 사용합니다. 큰 중간 상태를 모두 보관하지 않고 두 순회로 미분할 수 있는 설계 이유입니다. [원문 부록 A](https://arxiv.org/pdf/2006.16236v3#page=11)

## B. Training Evolution

<figure class="paper-figure" id="figure-5"><a href="/images/papers/katharopoulos-2020/figure-5.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-5.png" width="1458" height="447" alt="Figure 5: MNIST·CIFAR-10·음성 인식의 학습 곡선. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 5. MNIST·CIFAR-10·음성 인식의 학습 곡선. <a href="/images/papers/katharopoulos-2020/figure-5.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=12">원문 v3 p.12</a>. Katharopoulos et al. (2020).</figcaption></figure>

(a) MNIST와 (b) CIFAR-10의 세로축은 Test bpd(테스트 차원당 비트 수), 가로축은 Epoch(전체 데이터 반복)입니다. (c) 음성 인식은 가로축이 Wall-clock Time(실제 경과 시간, 시간 단위), 세로축이 Validation PER(검증 음소 오류율)입니다. 패널마다 가로축 의미가 다릅니다.

MNIST는 모두 250 Epoch를 학습합니다. CIFAR-10은 7일 제한이므로 곡선의 끝점이 서로 다른 Epoch에 있습니다. 음성 인식은 수렴까지 학습하며, 더 많은 Epoch를 처리한 Linear(선형)보다 Softmax(소프트맥스)의 오류율이 낮습니다. 속도와 품질을 함께 읽어야 합니다. [원문 부록 B](https://arxiv.org/pdf/2006.16236v3#page=12)

## C. Image Generation Throughput Discussion

### C.1. Stateful softmax attention

Stateful-softmax(상태를 보존하는 소프트맥스)는 이전 Key(키)와 Value(값)를 캐시에 보관합니다. 새 위치마다 이전 투영을 다시 하지 않지만 저장량은 길이에 비례하고, 새 Query(질의)가 과거 Key(키)들을 읽는 비용도 늘어납니다. Linear(선형)은 고정 크기 $s,z$를 갱신합니다.

**Table 4(a). MNIST — 캐시 사용 기준 추가, 모든 행.** [원문 Table 4](https://arxiv.org/pdf/2006.16236v3#page=13)

| Method | Bits/dim ↓ | Images/sec ↑ |
| --- | ---: | ---: |
| Softmax | 0.621 | 0.45 (1×) |
| Stateful-softmax | 0.621 | 7.56 (16.8×) |
| LSH-1 | 0.745 | 0.68 (1.5×) |
| LSH-4 | 0.676 | 0.27 (0.6×) |
| Linear (ours) | 0.644 | 142.8 (317×) |

**Table 4(b). CIFAR-10 — 모든 행.** 괄호는 두 패널 모두 캐시 없는 Softmax 대비 배수입니다.

| Method | Bits/dim ↓ | Images/sec ↑ |
| --- | ---: | ---: |
| Softmax | 3.47 | 0.004 (1×) |
| Stateful-softmax | 3.47 | 0.32 (80×) |
| LSH-1 | 3.39 | 0.015 (3.75×) |
| LSH-4 | 3.51 | 0.005 (1.25×) |
| Linear (ours) | 3.40 | 17.85 (4,462×) |

표의 반올림된 수치로 다시 계산하면 캐시 기준 대비 처리량은 MNIST에서 $142.8/7.56\approx18.9$배, CIFAR-10에서 $17.85/0.32\approx55.8$배입니다. 이는 이 해설의 단순 비율 계산이며 새로운 실험이 아닙니다. 캐시를 고려해도 차이는 있지만 4,462배와는 다른 비교입니다.

### C.2. Equalizing the batch size

한 장을 얼마나 빨리 완성하는지 확인하려고 **모든 생성 배치를 1**로 맞추고 CPU와 GPU를 각각 측정합니다.

**Table 5(a). MNIST 한 장 생성 시간 — 모든 행.** 괄호는 같은 열의 Linear 시간 대비 배수이며, 낮을수록 좋습니다. [원문 Table 5](https://arxiv.org/pdf/2006.16236v3#page=13)

| Method | Seconds (CPU) ↓ | Seconds (GPU) ↓ |
| --- | ---: | ---: |
| Softmax | 72.6 (13.2×) | 10.2 (1.4×) |
| Stateful-softmax | 7.4 (1.3×) | 10.4 (1.42×) |
| LSH-1 | 46.0 (8.3×) | 19.2 (2.6×) |
| LSH-4 | 112.0 (20×) | 55.8 (7.6×) |
| Linear (ours) | 5.5 (1×) | 7.3 (1×) |

**Table 5(b). CIFAR-10 한 장 생성 시간 — 모든 행.**

| Method | Seconds (CPU) ↓ | Seconds (GPU) ↓ |
| --- | ---: | ---: |
| Softmax | 8651.4 (191.8×) | 300.1 (4.9×) |
| Stateful-softmax | 71.9 (1.6×) | 70.4 (1.14×) |
| LSH-1 | 2318.9 (51.4×) | 221.6 (3.6×) |
| LSH-4 | 5263.7 (116.7×) | 683.9 (11.1×) |
| Linear (ours) | 45.1 (1×) | 61.3 (1×) |

CIFAR-10의 GPU 한 장 생성에서는 캐시 기준 70.4초 대 61.3초로 약 1.15배입니다. 작은 배치에서는 GPU를 충분히 활용하지 못하며, 저자는 순차 생성 루프가 병목이 된다고 설명합니다. Linear(선형)이 이 실험에서 CPU에서 더 빠르다는 결과를 모든 장비·배치로 일반화할 수 없습니다. Table 5는 CPU 모델을 직접 명시하지 않습니다.

원문 부록 문장의 ‘약 6.6배’는 같은 장치의 Softmax 대 Linear 비율인 CPU 약 191.8배 또는 GPU 약 4.9배와 일치하지 않습니다. $300.1/45.1\approx6.65$는 서로 다른 장치 열을 섞은 값입니다. **이 해설은 원문 표를 그대로 보존하되, 비교 해석에는 같은 장치 열을 사용합니다.** [원문 부록 C](https://arxiv.org/pdf/2006.16236v3#page=13)

## D. Qualitative Results on Image Generation

부록의 네 그림은 모든 모델의 생성·완성 결과를 나란히 보여줍니다. 저자들은 Reformer의 무조건부 샘플에서 다양성이 줄어드는 경향과, 무조건부 생성보다 주어진 이미지를 완성하는 과제가 쉽다는 점을 관찰합니다. 이는 선택된 샘플의 정성 비교이며 독립적인 다양성 지표 측정은 아닙니다.

<figure class="paper-figure" id="figure-6"><a href="/images/papers/katharopoulos-2020/figure-6.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-6.png" width="1272" height="1338" alt="Figure 6: 모든 모델의 MNIST 무조건부 생성 샘플. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 6. 모든 모델의 MNIST 무조건부 생성 샘플. <a href="/images/papers/katharopoulos-2020/figure-6.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=14">원문 v3 p.14</a>. Katharopoulos et al. (2020).</figcaption></figure>

MNIST 무조건부 생성입니다. (a) Softmax, (b) Linear, (c) LSH-1, (d) LSH-4 패널을 보존했습니다. 숫자의 종류·획 모양·반복 양상을 비교합니다. LSH 패널의 반복적 모양은 저자의 다양성 관찰과 연결되지만, 그림만으로 확률분포 전체를 추정하지는 않습니다.

<figure class="paper-figure" id="figure-7"><a href="/images/papers/katharopoulos-2020/figure-7.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-7.png" width="1278" height="1590" alt="Figure 7: 모든 모델의 MNIST 완성 결과와 원본. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 7. 모든 모델의 MNIST 완성 결과와 원본. <a href="/images/papers/katharopoulos-2020/figure-7.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=15">원문 v3 p.15</a>. Katharopoulos et al. (2020).</figcaption></figure>

MNIST 완성 결과입니다. 왼쪽부터 (a) 가린 입력, (b) Softmax, (c) Linear, (d) LSH-1, (e) LSH-4, (f) 원본입니다. 한 행이 같은 입력이므로 행 방향으로 비교해야 합니다. 입력의 위쪽 획과 새 아래쪽 획이 연결되는지 읽으며, 가능한 완성 결과가 원본 하나뿐이라고 가정하지 않습니다.

<figure class="paper-figure" id="figure-8"><a href="/images/papers/katharopoulos-2020/figure-8.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-8.png" width="1272" height="1338" alt="Figure 8: 모든 모델의 CIFAR-10 무조건부 생성 샘플. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 8. 모든 모델의 CIFAR-10 무조건부 생성 샘플. <a href="/images/papers/katharopoulos-2020/figure-8.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=16">원문 v3 p.16</a>. Katharopoulos et al. (2020).</figcaption></figure>

CIFAR-10 무조건부 생성입니다. Figure 6과 같은 (a)–(d) 모델 순서입니다. 물체 형태·색상 배치·반복되는 패턴을 비교할 수 있습니다. 낮은 해상도와 작은 샘플 격자 때문에 확대 링크로 보아야 하며, 이 그림은 사람이 판별한 정확도를 보고하는 자료가 아닙니다.

<figure class="paper-figure" id="figure-9"><a href="/images/papers/katharopoulos-2020/figure-9.png" target="_blank" rel="noopener"><img src="/images/papers/katharopoulos-2020/figure-9.png" width="1278" height="1590" alt="Figure 9: 모든 모델의 CIFAR-10 완성 결과와 원본. 패널과 범례 설명은 아래 본문 참조." loading="lazy" /></a><figcaption>Figure 9. 모든 모델의 CIFAR-10 완성 결과와 원본. <a href="/images/papers/katharopoulos-2020/figure-9.png" target="_blank" rel="noopener">원본 크기로 보기</a> · <a href="https://arxiv.org/pdf/2006.16236v3#page=17">원문 v3 p.17</a>. Katharopoulos et al. (2020).</figcaption></figure>

CIFAR-10 완성 결과입니다. Figure 7과 같은 여섯 열을 유지했습니다. 행별로 주어진 부분과 완성된 부분 사이의 공간적 일관성을 봅니다. 원본과 픽셀 단위로 같아야 성공인 복원 실험으로 해석하지 않습니다. [원문 부록 D](https://arxiv.org/pdf/2006.16236v3#page=13)
