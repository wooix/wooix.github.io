---
title: 'SMOTE: Synthetic Minority Over-sampling Technique'
description: '소수 클래스 표본 사이의 합성이 분류 경계에 미치는 효과와 실패 조건을 읽는다.'
publishedAt: 2026-09-14
topic: synthetic-data-study
category: synthetic-data
tags: ['합성데이터스터디', '1강', '논문 해설']
kind: research-review
readingTime: 12
featured: false
draft: false
parentPost: synthetic-data-study/01-foundations
navLabel: 'Chawla et al. (2002)'
sourceLinks:
  - title: 'JAIR 16 (2002), pp. 321–357; arXiv 사본 1106.1813'
    url: 'https://arxiv.org/pdf/1106.1813'
    kind: 원문
takeaway: 'SMOTE는 소수 클래스의 가까운 관측값 사이에서 새 특징값을 만든다. 효과는 분류기와 데이터 분포에 달리 나타나며 단순 복제나 모든 데이터 생성의 대체물이 아니다.'
---

[1강으로 돌아가기](/notes/synthetic-data-study/01-foundations/)

검토 원문: [JAIR 16 (2002), pp. 321–357; arXiv 사본 1106.1813](https://arxiv.org/pdf/1106.1813). 초록과 아래 본문 전체를 확인했으며 참고문헌 목록은 요약에서 제외했다.

## 초록

Synthetic Minority Over-sampling Technique(합성 소수 클래스 과표집 기법, SMOTE)은 적게 나타나는 클래스의 합성 예제를 만든다. 저자는 다수 클래스의 Under-sampling(과소표집)과 결합해 분류 성능을 비교한다. 평가는 전체 정확도만 보지 않고 양성 검출과 오탐의 절충을 살펴본다. 논문은 2002년 JAIR에 출판됐으며, 확인한 arXiv 사본의 등록 연도 2011을 연구 연도로 쓰지 않는다.

## 1. 서론

Class Imbalance(클래스 불균형)가 크면 모든 예제를 다수 클래스로 예측해도 전체 정확도가 높을 수 있다. 그러나 드문 이상 사례를 찾는 문제에서는 그 결과가 목적에 맞지 않는다. 저자는 오류 비용을 바꾸는 접근과 데이터 비율을 바꾸는 접근을 비교하고, 소수 예제를 새로 만드는 방법을 후자에 추가한다.

## 2. 성능 측정

Receiver Operating Characteristic(수신자 조작 특성, ROC)은 실제 양성을 얼마나 찾는지와 실제 음성을 얼마나 양성으로 오인하는지를 함께 표시한다. 세로축은 $\frac{\mathrm{TP}}{\mathrm{TP}+\mathrm{FN}}$, 가로축은 $\frac{\mathrm{FP}}{\mathrm{TN}+\mathrm{FP}}$다. 두 비율은 각각 실제 양성과 실제 음성을 분모로 삼으므로 전체 정확도가 감추는 오류를 분리한다.

Area Under the Curve(곡선 아래 면적, AUC)는 여러 판단 조건의 성능을 요약하지만, ROC가 교차하면 특정 비용 조건에서 최선인 모델과 최대 AUC 모델이 다를 수 있다. 따라서 저자는 ROC Convex Hull(ROC 볼록 껍질)도 사용해 잠재적으로 최적인 운영점을 찾는다. [원문 §2](https://arxiv.org/pdf/1106.1813)

<figure class="paper-figure" id="figure-1"><a href="/images/papers/chawla-2002/figure-1.png" target="_blank" rel="noopener"><img width="429" height="264" src="/images/papers/chawla-2002/figure-1.png" alt="실제 클래스와 예측 클래스의 혼동 행렬" loading="lazy" /></a><figcaption>Figure 1. 실제 클래스와 예측 클래스의 혼동 행렬. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

행은 실제 클래스, 열은 예측 클래스다. TP·TN은 맞힌 예제, FP·FN은 서로 다른 방향의 오류다. 전체 정확도 하나가 감추는 소수 클래스의 놓침을 분리하는 출발점이다.

<figure class="paper-figure" id="figure-2"><a href="/images/papers/chawla-2002/figure-2.png" target="_blank" rel="noopener"><img width="858" height="524" src="/images/papers/chawla-2002/figure-2.png" alt="표집 비율에 따라 이동하는 ROC 운영점" loading="lazy" /></a><figcaption>Figure 2. 표집 비율에 따라 이동하는 ROC 운영점. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축은 오탐 비율, 세로축은 양성 검출 비율이다. 다수 예제를 줄이면 소수 검출과 오탐이 함께 늘 수 있어 점이 오른쪽 위로 이동한다. 대각선은 무작위 판단의 기준이며 왼쪽 위가 이상적이다.


## 3. 이전 연구: 불균형 데이터셋

선택적 Under-sampling, 반복 복제, 오류 비용 변경, 다른 평가 기준을 사용하는 연구를 검토한다. 서로 다른 데이터와 분류기를 쓰거나 하나의 운영점만 비교하는 경우를 설명하면서, 여러 비용·검출 조건에 걸친 비교의 필요성을 연결한다. 본 논문의 차이는 소수 클래스의 개수만 복제로 늘리는 대신 특징 공간에 새로운 값을 놓는 데 있다.

## 4. SMOTE: 합성 소수 클래스 과표집 기법

이 절은 복제가 만드는 분류 경계의 문제에서 출발해 합성과 Under-sampling의 결합을 설명한다.

### 4.1 복원 추출을 이용한 소수 클래스 과표집

같은 소수 예제를 여러 번 복제하면 결정 트리가 그 점 주변을 더 세밀하게 나눌 수 있다. 저자는 유방촬영 데이터의 사례로 작은 특정 영역을 외우는 결과를 설명한다. 개수가 늘어도 관측값이 놓인 위치는 변하지 않으므로 소수 클래스의 더 넓은 영역을 학습하는 데 한계가 있다는 해석이다.

<figure class="paper-figure" id="figure-3"><a href="/images/papers/chawla-2002/figure-3.png" target="_blank" rel="noopener"><img width="979" height="880" src="/images/papers/chawla-2002/figure-3.png" alt="원본·복제·합성이 만드는 결정 영역의 차이" loading="lazy" /></a><figcaption>Figure 3. 원본·복제·합성이 만드는 결정 영역의 차이. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로·세로축은 두 특징이다. (a)는 다수 클래스 영역에 포함된 소수 예제, (b)는 복제 후의 좁은 결정 영역, (c)는 합성 후의 더 일반적인 영역을 보여준다. 세 패널은 논문의 기하학적 해석을 설명하는 예시이며 모든 분류기의 경계가 동일하게 바뀐다는 보장은 아니다.


### 4.2 SMOTE

소수 예제의 소수 클래스 이웃을 찾고, 두 특징 벡터의 차이에 0~1의 무작위 비율을 적용해 원래 예제에 더한다. 본문의 선분 보간을 기호로 쓰면 다음과 같다.

$$
x_{\mathrm{new}}=x+\lambda(x_{\mathrm{neighbor}}-x),\qquad 0\leq\lambda\leq1
$$

$x$는 원래 예제, $x_{\mathrm{neighbor}}$는 선택한 이웃이며 $\lambda$는 그 사이에서 이동하는 비율이다. 목적은 특정 점의 반복보다 넓고 덜 특수한 소수 클래스 영역을 학습하게 하는 것이다.

확인한 원문에는 표현상 주의점이 있다. 본문은 선분 위 보간으로 설명하지만 의사코드 21행의 무작위 비율 추출은 속성 반복문 안에 있다. 따라서 본문의 기하학적 설명과 의사코드의 추출 위치가 완전히 일치한다고 단정하지 않는다. 본 논문은 주로 연속 특징의 분류 문제를 다루며 자연어 문장을 직접 만드는 방법은 아니다. [원문 §4.2 및 의사코드](https://arxiv.org/pdf/1106.1813)

<figure class="paper-figure" id="figure-4"><a href="/images/papers/chawla-2002/figure-4.png" target="_blank" rel="noopener"><img width="660" height="539" src="/images/papers/chawla-2002/figure-4.png" alt="Mammography에서 과표집 정도와 결정 트리 크기" loading="lazy" /></a><figcaption>Figure 4. Mammography에서 과표집 정도와 결정 트리 크기. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축은 소수 클래스 과표집 정도, 세로축은 가지치기 후 트리의 노드 수다. 복제 자료는 합성 자료보다 큰 트리를 만드는 경향을 보인다. 같은 점을 반복해 더 세밀하게 분할한다는 앞 절의 설명과 연결된다.

<figure class="paper-figure" id="figure-5"><a href="/images/papers/chawla-2002/figure-5.png" target="_blank" rel="noopener"><img width="682" height="572" src="/images/papers/chawla-2002/figure-5.png" alt="Mammography에서 과표집 정도와 소수 클래스 검출" loading="lazy" /></a><figcaption>Figure 5. Mammography에서 과표집 정도와 소수 클래스 검출. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축은 과표집 정도, 세로축은 소수 예제 정답 비율이다. 높은 과표집 영역에서 합성 자료가 복제보다 나은 결과를 보이지만 증가량에 따라 곡선이 단조롭게 개선되는 것은 아니다. Figure 4의 트리 크기와 함께 읽어야 한다.


### 4.3 Under-sampling과 SMOTE의 결합

다수 예제를 무작위로 줄이고 소수 예제를 합성해 학습 비율을 바꾼다. 본문이 사용하는 Under-sampling 백분율은 일반적인 제거율과 다르므로 정의를 확인해야 한다. 서로 다른 합성량과 다수 표본량으로 여러 분류기를 만들고 ROC의 운영점을 구성한다.

## 5. 실험

C4.5와 Ripper에서 SMOTE 결합을 단순 Under-sampling과 비교하고, Ripper의 오류 비용 비율 변경 및 Naive Bayes(나이브 베이즈)의 클래스 사전확률 변경도 비교한다. 10-fold Cross-validation(10겹 교차 검증)의 양성 검출률과 오탐률을 평균한다. 합성 표본 수 증가 자체가 아닌 학습한 분류기의 결과를 평가한다.

<figure class="paper-figure" id="figure-6"><a href="/images/papers/chawla-2002/figure-6.png" target="_blank" rel="noopener"><img width="880" height="572" src="/images/papers/chawla-2002/figure-6.png" alt="표집·비용 변경·사전확률 변경의 실험 비교 흐름" loading="lazy" /></a><figcaption>Figure 6. 표집·비용 변경·사전확률 변경의 실험 비교 흐름. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

위쪽 상자는 데이터를 바꾸거나 비용을 조절하는 방법, 가운데는 C4.5·Ripper·Naive Bayes, 아래는 ROC와 AUC 평가다. 동일 분류기 안의 비교와 서로 다른 분류기를 포함한 비교를 구분하는 지도다.


### 5.1 데이터셋

당뇨, 음소, Adult, 화합물, 위성 영상, 산림, 기름 유출, 유방촬영, 시뮬레이션 관심 영역의 아홉 데이터를 사용한다. 데이터 크기와 불균형 비율을 다르게 구성하고 다중 클래스 자료 일부는 이진 문제로 변환한다. Adult의 기본 SMOTE 실험에는 연속 특징을 추출하며 혼합 특징은 뒤의 SMOTE-NC에서 따로 다룬다.

### 5.2 ROC 생성

소수 클래스의 합성 정도를 고정한 뒤 다수 클래스의 표본 수를 순차적으로 줄여 한 곡선을 만든다. 같은 운영점끼리는 다수 표본 수를 맞춘다. 다른 곡선은 다른 합성 정도를 사용한다. 따라서 여기의 ROC는 하나의 고정 모델에 임계값만 바꾼 곡선과 구별해야 한다.

<figure class="paper-figure" id="figure-7"><a href="/images/papers/chawla-2002/figure-7.png" target="_blank" rel="noopener"><img width="649" height="524" src="/images/papers/chawla-2002/figure-7.png" alt="Phoneme의 C4.5 ROC 비교" loading="lazy" /></a><figcaption>Figure 7. Phoneme의 C4.5 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. SMOTE-C4.5가 단순 Under-sampling과 Naive Bayes보다 우세한 운영점을 만든다.

<figure class="paper-figure" id="figure-8"><a href="/images/papers/chawla-2002/figure-8.png" target="_blank" rel="noopener"><img width="649" height="550" src="/images/papers/chawla-2002/figure-8.png" alt="Phoneme의 Ripper ROC 비교" loading="lazy" /></a><figcaption>Figure 8. Phoneme의 Ripper ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 합성 결합이 단순 Under-sampling과 오류 비용 비율 변경보다 우세하게 나타난다.

<figure class="paper-figure" id="figure-9"><a href="/images/papers/chawla-2002/figure-9.png" target="_blank" rel="noopener"><img width="671" height="564" src="/images/papers/chawla-2002/figure-9.png" alt="Pima의 C4.5 ROC 비교" loading="lazy" /></a><figcaption>Figure 9. Pima의 C4.5 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. Naive Bayes가 더 우세한 영역을 보여 SMOTE의 보편적 우월성에 대한 예외가 된다.

<figure class="paper-figure" id="figure-10"><a href="/images/papers/chawla-2002/figure-10.png" target="_blank" rel="noopener"><img width="660" height="524" src="/images/papers/chawla-2002/figure-10.png" alt="Pima의 Ripper ROC 비교" loading="lazy" /></a><figcaption>Figure 10. Pima의 Ripper ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 같은 데이터라도 Ripper에서는 합성 결합이 다른 Ripper 설정보다 우세하게 나타난다.

<figure class="paper-figure" id="figure-11"><a href="/images/papers/chawla-2002/figure-11.png" target="_blank" rel="noopener"><img width="660" height="539" src="/images/papers/chawla-2002/figure-11.png" alt="Satimage의 C4.5 ROC 비교" loading="lazy" /></a><figcaption>Figure 11. Satimage의 C4.5 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. Naive Bayes와 합성 결합의 곡선이 교차한다. 따라서 하나가 모든 운영점에서 최선이라는 의미는 아니다.

<figure class="paper-figure" id="figure-12"><a href="/images/papers/chawla-2002/figure-12.png" target="_blank" rel="noopener"><img width="660" height="549" src="/images/papers/chawla-2002/figure-12.png" alt="Satimage의 Ripper ROC 비교" loading="lazy" /></a><figcaption>Figure 12. Satimage의 Ripper ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 합성 결합이 더 높은 ROC 영역을 차지하며 단순 Under-sampling과 비용 변경을 앞선다.

<figure class="paper-figure" id="figure-13"><a href="/images/papers/chawla-2002/figure-13.png" target="_blank" rel="noopener"><img width="660" height="528" src="/images/papers/chawla-2002/figure-13.png" alt="Forest Cover의 C4.5 ROC 비교" loading="lazy" /></a><figcaption>Figure 13. Forest Cover의 C4.5 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 합성과 단순 Under-sampling의 곡선이 가깝지만 합성 쪽이 볼록 껍질에 더 많은 운영점을 제공한다.


### 5.3 AUC 계산

곡선 사이를 사다리꼴로 연결하고 비교 구간을 맞추기 위해 필요하면 끝점 (100%, 100%)를 추가한다. 여러 데이터에서 SMOTE 결합의 개선을 보고하지만 예외도 제시한다. Pima에서는 Naive Bayes가 SMOTE-C4.5를 앞서고, Oil에서는 Under-Ripper가 SMOTE-Ripper를 앞서며, Can에서는 곡선이 겹치는 부분이 있다. 방법이 모든 분류기·분포에서 우월하다는 결과가 아니다. [원문 §5.3](https://arxiv.org/pdf/1106.1813)

<figure class="paper-figure" id="figure-14"><a href="/images/papers/chawla-2002/figure-14.png" target="_blank" rel="noopener"><img width="660" height="548" src="/images/papers/chawla-2002/figure-14.png" alt="Forest Cover의 Ripper ROC 비교" loading="lazy" /></a><figcaption>Figure 14. Forest Cover의 Ripper ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 세로축이 높은 검출률 범위로 확대되어 있다. 그 범위에서 합성 결합의 우세를 읽을 수 있다.

<figure class="paper-figure" id="figure-15"><a href="/images/papers/chawla-2002/figure-15.png" target="_blank" rel="noopener"><img width="660" height="550" src="/images/papers/chawla-2002/figure-15.png" alt="Oil의 C4.5 ROC 비교" loading="lazy" /></a><figcaption>Figure 15. Oil의 C4.5 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 두 표집 곡선은 교차하지만 합성 방법은 볼록 껍질에 추가 운영점을 제공한다. 부록 A가 이 비교를 분리해 보여준다.

<figure class="paper-figure" id="figure-16"><a href="/images/papers/chawla-2002/figure-16.png" target="_blank" rel="noopener"><img width="660" height="539" src="/images/papers/chawla-2002/figure-16.png" alt="Oil의 Ripper ROC 비교" loading="lazy" /></a><figcaption>Figure 16. Oil의 Ripper ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 합성과 단순 Under-sampling이 교차하며 높은 오탐 구간에서는 단순 Under-sampling이 앞선다.

<figure class="paper-figure" id="figure-17"><a href="/images/papers/chawla-2002/figure-17.png" target="_blank" rel="noopener"><img width="660" height="529" src="/images/papers/chawla-2002/figure-17.png" alt="Mammography의 C4.5 ROC 비교" loading="lazy" /></a><figcaption>Figure 17. Mammography의 C4.5 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 곡선이 교차하므로 전체 우위보다는 볼록 껍질에 기여하는 운영점을 살펴야 한다.

<figure class="paper-figure" id="figure-18"><a href="/images/papers/chawla-2002/figure-18.png" target="_blank" rel="noopener"><img width="660" height="528" src="/images/papers/chawla-2002/figure-18.png" alt="Mammography의 Ripper ROC 비교" loading="lazy" /></a><figcaption>Figure 18. Mammography의 Ripper ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 합성 결합이 다른 Ripper 설정보다 우세한 결과를 보인다.

<figure class="paper-figure" id="figure-19"><a href="/images/papers/chawla-2002/figure-19.png" target="_blank" rel="noopener"><img width="803" height="623" src="/images/papers/chawla-2002/figure-19.png" alt="Mammography의 합성과 복제 ROC 비교" loading="lazy" /></a><figcaption>Figure 19. Mammography의 합성과 복제 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 같은 400% 소수 과표집에서 합성과 복제를 비교한다. 합성 곡선이 볼록 껍질에 더 많은 후보를 제공한다.

<figure class="paper-figure" id="figure-20"><a href="/images/papers/chawla-2002/figure-20.png" target="_blank" rel="noopener"><img width="660" height="539" src="/images/papers/chawla-2002/figure-20.png" alt="E-state의 C4.5 ROC 비교" loading="lazy" /></a><figcaption>Figure 20. E-state의 C4.5 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 합성과 단순 Under-sampling은 교차하지만 합성 방법에 잠재적으로 최적인 운영점이 더 많다.

<figure class="paper-figure" id="figure-21"><a href="/images/papers/chawla-2002/figure-21.png" target="_blank" rel="noopener"><img width="660" height="544" src="/images/papers/chawla-2002/figure-21.png" alt="E-state의 Ripper ROC 비교" loading="lazy" /></a><figcaption>Figure 21. E-state의 Ripper ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 합성 결합이 볼록 껍질에 더 많은 후보를 제공한다.

<figure class="paper-figure" id="figure-22"><a href="/images/papers/chawla-2002/figure-22.png" target="_blank" rel="noopener"><img width="660" height="555" src="/images/papers/chawla-2002/figure-22.png" alt="Can의 C4.5 ROC 비교" loading="lazy" /></a><figcaption>Figure 22. Can의 C4.5 ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 합성과 단순 Under-sampling이 대부분 겹쳐 큰 추가 이득이 나타나지 않는다.

<figure class="paper-figure" id="figure-23"><a href="/images/papers/chawla-2002/figure-23.png" target="_blank" rel="noopener"><img width="660" height="539" src="/images/papers/chawla-2002/figure-23.png" alt="Can의 Ripper ROC 비교" loading="lazy" /></a><figcaption>Figure 23. Can의 Ripper ROC 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축 %FP는 오탐 비율, 세로축 %TP는 양성 검출 비율이며 범례는 학습 방법과 볼록 껍질을 구분한다. 두 표집 곡선이 대부분 겹친다. 앞 데이터들의 개선을 모든 문제로 일반화할 수 없음을 보여준다.

**Table 3. C4.5 AUC 비교 — 원문에서 일부 데이터·열 발췌** ([원문](https://arxiv.org/pdf/1106.1813))

| 데이터 | Under | 100 SMOTE | 200 SMOTE | 400 SMOTE | 500 SMOTE |
| --- | --- | --- | --- | --- | --- |
| Pima | 7242 | 7307 | — | — | — |
| Phoneme | 8622 | 8644 | 8661 | — | — |
| Oil | 8524 | 8523 | 8368 | 8339 | 8537 |
| Mammography | 9260 | 9250 | 9265 | 9330 | 9304 |

원문은 축을 백분율로 두어 면적을 위 척도로 기록한다. 값이 클수록 해당 곡선의 면적이 크다. Oil처럼 합성량을 바꿨을 때 개선과 악화가 함께 나타나므로 합성량 증가를 성능 증가와 동일시하면 안 된다.


### 5.4 판단 임계값 변경과의 추가 비교

Phoneme 데이터에서 C4.5의 잎 노드가 소수 클래스로 판정하는 비율 기준을 바꾼다. 저자는 해당 실험에서 SMOTE 결합의 ROC가 더 좋다고 보고한다. 이 절은 간단한 임계값 조정도 비교해야 한다는 반론에 답하지만, 모든 데이터셋에서 이 비교를 반복한 것은 아니다.

<figure class="paper-figure" id="figure-24"><a href="/images/papers/chawla-2002/figure-24.png" target="_blank" rel="noopener"><img width="792" height="559" src="/images/papers/chawla-2002/figure-24.png" alt="Phoneme에서 SMOTE와 판단 임계값 변경 비교" loading="lazy" /></a><figcaption>Figure 24. Phoneme에서 SMOTE와 판단 임계값 변경 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축은 오탐 비율, 세로축은 양성 검출 비율이다. SMOTE 결합과 C4.5 잎 노드 임계값만 바꾸는 방법을 비교하며, 이 실험에서는 전자의 곡선이 위에 놓인다. 데이터 변경의 효과가 간단한 임계값 조정으로 대체되는지 확인하는 비교다.


### 5.5 One-sided Selection 및 SHRINK와의 추가 비교

Oil 데이터에서 이전 연구의 다수 예제 선택 방법과 SHRINK 결과에 맞춰 비교한다. Under-sampling 정도에 따라 소수 검출과 다수 정확도가 함께 바뀌며 일부 조건에서 비교 가능한 또는 더 좋은 결과를 얻는다. 특정 표집 설정의 성과와 방법 전체의 우열을 구분하는 것이 중요하다.

<figure class="paper-figure" id="figure-25"><a href="/images/papers/chawla-2002/figure-25.png" target="_blank" rel="noopener"><img width="737" height="544" src="/images/papers/chawla-2002/figure-25.png" alt="Oil에서 다수 표집량과 두 클래스 정확도" loading="lazy" /></a><figcaption>Figure 25. Oil에서 다수 표집량과 두 클래스 정확도. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축은 논문이 정의한 다수 클래스 Under-sampling 정도, 세로축은 클래스별 정확도다. 소수 정확도가 높아지는 동안 다수 정확도는 낮아지는 구간이 나타난다. 소수 검출 개선에 동반되는 비용을 숨기지 않고 보여준다.


## 6. 향후 연구

이웃 수의 자동 선택, 합성 위치를 정하는 다른 방식, 오분류된 예제에 집중하는 방법을 제안한다. 소수·다수 클래스가 가까운 영역에서 분류 경계를 어떻게 바꿀지도 추가 연구 문제다.

### 6.1 SMOTE-NC

연속·명목 특징이 섞인 자료로 확장한다. 연속 특징의 거리에는 수치 차이를 사용하고 명목 특징이 다르면 소수 클래스 연속 특징 표준편차의 중앙값에 기반한 벌점을 넣는다. 이는 범주 불일치를 연속 특징의 전형적인 차이와 연결하기 위한 설계다. 생성 시 연속값을 합성하고 명목값은 이웃의 다수결로 정한다.

Adult에서는 단순 Under-sampling보다 AUC가 나빴다. 연속 특징만 남겨도 뚜렷한 우위를 얻지 못했다. 저자는 큰 분산 때문에 합성 표본이 다수 클래스 영역과 겹쳐 오탐을 늘렸을 가능성을 제시한다. 이 설명은 확인된 결과에 대한 가설이며 원인 분리 실험으로 확정된 결론은 아니다. [원문 §6.1](https://arxiv.org/pdf/1106.1813)

<figure class="paper-figure" id="figure-26"><a href="/images/papers/chawla-2002/figure-26.png" target="_blank" rel="noopener"><img width="660" height="506" src="/images/papers/chawla-2002/figure-26.png" alt="Adult 혼합 특징에서 SMOTE-NC의 ROC" loading="lazy" /></a><figcaption>Figure 26. Adult 혼합 특징에서 SMOTE-NC의 ROC. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

오탐·검출 축에서 SMOTE-NC, Under-C4.5, Naive Bayes를 비교한다. 합성의 추가 이득이 나타나지 않는 사례이며, 합성점이 다수 클래스 영역과 겹칠 가능성이라는 본문의 가설과 연결된다.

<figure class="paper-figure" id="figure-27"><a href="/images/papers/chawla-2002/figure-27.png" target="_blank" rel="noopener"><img width="660" height="531" src="/images/papers/chawla-2002/figure-27.png" alt="Adult에서 Ripper 기반 방법 비교" loading="lazy" /></a><figcaption>Figure 27. Adult에서 Ripper 기반 방법 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

가로축은 오탐, 세로축은 양성 검출 비율이다. 합성과 단순 Under-sampling이 대부분 겹쳐, 특징 혼합 자료에서도 합성이 항상 도움이 되지는 않음을 보여준다.

<figure class="paper-figure" id="figure-28"><a href="/images/papers/chawla-2002/figure-28.png" target="_blank" rel="noopener"><img width="880" height="628" src="/images/papers/chawla-2002/figure-28.png" alt="Adult의 연속 특징만 사용한 비교" loading="lazy" /></a><figcaption>Figure 28. Adult의 연속 특징만 사용한 비교. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

명목 특징 처리가 실패의 유일한 이유인지 보기 위해 연속 특징만 남긴다. 오탐·검출 곡선이 여전히 겹치므로 저자는 단순히 명목 특징 처리만의 문제로 설명하지 않는다.


### 6.2 SMOTE-N

명목 특징만 있는 경우의 확장 가능성을 논의한다. Value Difference Metric(값 차이 척도)은 두 범주 값이 각 클래스와 함께 나타나는 비율의 차이로 거리를 정한다. 코드 번호의 숫자 차이 대신 예측상 의미가 비슷한 값을 가깝게 두려는 것이다. 여러 특징의 거리를 합쳐 이웃을 찾고 원본·이웃의 다수결로 새 값을 만드는 방식을 제안한다. 이 절은 확장 제안으로, 앞의 아홉 데이터 실험과 동등하게 검증된 성과가 아니다.

### 6.3 정보 검색에 SMOTE 적용

문서나 웹페이지를 Bag-of-Words(단어 집합) 특징으로 바꾸고 특징 선택과 함께 적용하는 방향을 논의한다. 목표 클래스의 예제를 늘리는 방법을 관련성에 따라 문서를 순위화하는 접근과 비교할 수 있다고 제안한다. 자연어 문장을 합성한 실험은 제시하지 않는다.

## 7. 요약

저자는 단순 복제보다 새 특징값이 더 일반적인 소수 클래스 영역을 학습하도록 돕는다고 해석한다. 다만 비용 변경·Under-sampling과의 비교에는 데이터별 예외가 존재한다. 합성의 가치는 표본이 새롭다는 사실보다 실제로 배운 분류 경계와 검출·오탐 절충을 얼마나 개선하는지에 의해 판단된다.

## 부록 A. Oil 데이터셋의 ROC 그래프

원문 부록은 본문 Oil 비교에서 곡선과 볼록 껍질의 역할을 따로 보여준다. SMOTE 포함 여부에 따라 잠재적으로 최적인 분류기 집합이 어떻게 달라지는지 확인하는 절이다.


<figure class="paper-figure" id="figure-29"><a href="/images/papers/chawla-2002/figure-29.png" target="_blank" rel="noopener"><img width="1045" height="869" src="/images/papers/chawla-2002/figure-29.png" alt="Oil 곡선과 SMOTE 포함 여부에 따른 볼록 껍질" loading="lazy" /></a><figcaption>Figure 29. Oil 곡선과 SMOTE 포함 여부에 따른 볼록 껍질. <a href="https://arxiv.org/pdf/1106.1813">원문</a></figcaption></figure>

모든 패널의 가로축은 오탐, 세로축은 양성 검출 비율이다. (a)는 곡선과 볼록 껍질, (b)는 같은 곡선만, (c)는 SMOTE를 포함한 볼록 껍질과 제외한 볼록 껍질이다. 개별 곡선이 교차해도 합성 방법이 새로운 최적 후보를 추가할 수 있다는 주장을 시각적으로 분리한다.
