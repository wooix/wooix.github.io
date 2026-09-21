---
title: '4강 · 코드와 실행 기반 검증'
description: '문제·코드·테스트·판정기의 역할을 분리하고, 명세에서 만든 테스트로 생성 코드를 검증하는 절차와 한계를 학습합니다.'
publishedAt: 2026-09-21
topic: synthetic-data-study
category: code
tags: ['합성데이터스터디', '4강', 'Code Generation', 'Execution Feedback', 'EvalPlus']
kind: research-note
readingTime: 30
featured: false
draft: false
navLabel: '4강 · 코드와 실행 기반 검증'
sourceLinks:
  - title: 'Nadaș et al. (2025) — 코드 합성과 실행 검증'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/nadas-2025/'
    kind: '필수 서베이 B'
  - title: 'Liu et al. (2023) — EvalPlus'
    url: 'https://wooix.github.io/notes/synthetic-data-study/04-code-verification/papers/liu-2023/'
    kind: '필수 사례'
  - title: 'Zhang et al. (2026) — 기호·논리 데이터의 검증'
    url: 'https://wooix.github.io/notes/synthetic-data-study/01-foundations/papers/zhang-2026/'
    kind: '필수 서베이 C'
  - title: 'Wang et al. (2024) — 학습 단계와 코드 데이터'
    url: 'https://wooix.github.io/notes/synthetic-data-study/00-introduction/papers/wang-2024/'
    kind: '보충 서베이 D'
takeaway: '실행은 강한 검증 신호지만, 통과의 의미는 명세·입력 범위·기대값·테스트 버전에 묶여 있습니다. 코드와 테스트를 따로 검토하고, 발견한 반례를 데이터 선별과 수정 이력에 연결해야 합니다.'
---

[← 3강 · 큐레이션과 데이터 구성](/notes/synthetic-data-study/03-curation/) · [0강 · 전체 학습 계획](/notes/synthetic-data-study/00-introduction/)

## Required Reading(필수 읽기 자료)

<p class="heading-subtitle" data-heading-id="required-reading"><span aria-hidden="true">💡</span> 실행이 확인해 주는 범위를 읽기</p>

| 역할 | 자료와 읽을 범위 | 읽으며 답할 질문 |
| --- | --- | --- |
| 필수 · 생성 흐름 | [Nadaș et al. (2025)](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/) §VI.A–B, §VII.C·G | 코드 합성에서 문제·해답·실행 피드백은 어떻게 연결되는가? |
| 필수 · 테스트 충분성 | [EvalPlus — Liu et al. (2023)](/notes/synthetic-data-study/04-code-verification/papers/liu-2023/) §2–3, 부록 A; Figures 1–4, Tables 2–4 | 같은 코드도 테스트를 늘리면 왜 평가가 달라지는가? |
| 필수 · 신뢰성 | [Zhang et al. (2026)](/notes/synthetic-data-study/01-foundations/papers/zhang-2026/) §3.1–3.4, Table 3 | 실행 가능한 검증과 과정의 타당성은 같은가? |
| 보충 · 학습 위치 | [Wang et al. (2024)](/notes/synthetic-data-study/00-introduction/papers/wang-2024/) §3.6.3 Code | 검증한 코드는 어떤 학습 단계에 쓰이는가? |

<details class="paper-reading-list">
<summary>논문별 절별 해설 펼치기 · 4편</summary>
<ul>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/nadas-2025/">Nadaș et al. (2025)</a><span class="paper-one-line">필수 · 코드 합성·번역·문제 생성과 실행 검증의 역할을 비교합니다.</span></li>
<li><a href="/notes/synthetic-data-study/04-code-verification/papers/liu-2023/">Liu et al. (2023)</a><span class="paper-one-line">필수 · EvalPlus의 테스트 확장이 기존에 놓친 코드 오류를 찾는 과정을 설명합니다.</span></li>
<li><a href="/notes/synthetic-data-study/01-foundations/papers/zhang-2026/">Zhang et al. (2026)</a><span class="paper-one-line">필수 · 기호·추론 데이터의 검증 기준과 평가 공백을 살핍니다.</span></li>
<li><a href="/notes/synthetic-data-study/00-introduction/papers/wang-2024/">Wang et al. (2024)</a><span class="paper-one-line">보충 · 코드 합성 데이터를 학습 단계와 전문 영역의 지도에 배치합니다.</span></li>
</ul>
</details>

3강의 문제집 편집자는 이제 **검사 가능한 프로그래밍 문제**를 다룹니다. 문장이 자연스러운지 읽는 데서 끝나지 않고, 입력을 넣어 실제 출력과 기대값을 비교합니다. 다만 검사하지 않은 조건과 잘못 작성된 기대값은 여전히 남습니다. 시험 문제와 채점표를 함께 틀리게 만들면 실행이 성공해도 잘못된 감독 신호를 수집할 수 있습니다.

> **읽기 기준** · 2026년 9월 21일 작성. 논문 결과는 각 요약의 판본·조건에 따라 읽습니다. 도서관 함수·네 후보·두 테스트 묶음은 사람이 직접 작성한 강의용 예제입니다. §6의 결과만 이 예제를 Python 3.14.7에서 실제 실행한 기록이며, LLM 생성 성능이나 EvalPlus 재현 실험이 아닙니다.

## 1. 명세와 데이터 단위

<p class="heading-subtitle" data-heading-id="specification"><span aria-hidden="true">💡</span> 무엇을 구현해야 정답인가?</p>

### 1.1 코드보다 먼저 정할 것

<strong>Specification(명세)</strong>은 허용되는 입력, 기대 행동, 출력 형식, 예외 조건을 정합니다. “도서 연장 함수를 만들어라”는 입력 표현이나 이미 연장한 책의 처리 방법이 빠져 있습니다. 이 상태에서 생성한 코드를 실행해도 어느 결과가 맞는지 결정하기 어렵습니다.

2–3강의 R2를 이어 사용합니다. **예약자가 없는 도서에 한해 1회, 7일 연장할 수 있다.** 이번 함수는 연장 기간을 계산하지 않고 **지금 연장이 허용되는지**만 반환합니다.

| 항목 | 이번 실습의 명세 |
| --- | --- |
| 입력 | `has_reservation`: 예약자 존재 여부인 bool, `extensions`: 지금까지 연장한 횟수인 0 이상의 int |
| 출력 | 예약자가 없고 연장 횟수가 0일 때만 `True`, 그 외에는 `False` |
| 범위 | 유효한 타입·범위의 입력만 검사 |
| 포함하지 않는 기능 | 대출 실행, 날짜 계산, 사용자 인증, 연체 정책, 잘못된 입력의 예외 처리 |

R3의 “연체 중 새 대출 금지”를 곧바로 연장 금지로 바꾸지 않습니다. 서로 다른 행위에 관한 정책을 임의로 합치면 코드가 아니라 명세가 바뀝니다. 잘못된 타입과 음수를 처리하려면 오류 반환·예외 규칙을 먼저 추가하고 별도 버전으로 검증해야 합니다.

### 1.2 학습 예제와 검증 묶음

코드 학습 자료에서는 문제 설명과 정답 후보 코드가 중심이 될 수 있지만, 큐레이션 기록에는 **명세 버전·테스트 입력·기대값·실행 환경·실행 로그**도 필요합니다. 한 코드에 “pass”만 붙이면 어떤 범위를 검사했는지 잃게 됩니다.

<strong>Test Oracle(정답 판정 기준)</strong>은 주어진 입력에 대한 올바른 결과를 결정하는 장치입니다. 수작업 기대값, 검토한 참조 구현, 수학적 성질 등이 될 수 있습니다. 판정 기준도 오류를 가질 수 있으므로 후보 코드의 출력을 그대로 기대값으로 복사하면 검증이 순환합니다.

## 2. 생성과 실행

<p class="heading-subtitle" data-heading-id="generation-and-execution"><span aria-hidden="true">💡</span> 문제·코드·테스트의 출처를 따로 남기기</p>

### 2.1 세 생성 대상을 분리한다

[Nadaș et al. §VI](/notes/synthetic-data-study/01-foundations/papers/nadas-2025/)는 지시 기반 코드 합성, 코드 변환, 문제와 해답의 합성을 구분합니다. 무엇을 새로 만들었는지에 따라 검증해야 할 대상도 달라집니다.

| 생성 대상 | 주된 검토 질문 | 가능한 실패 |
| --- | --- | --- |
| 문제 | 명세가 모순 없이 답을 결정하는가? | 조건 누락, 답이 여러 개인데 하나만 허용 |
| 코드 | 명세에 맞는 행동을 하는가? | 경계 조건 누락, 잘못된 연산·반환 타입 |
| 테스트 | 유효한 입력과 올바른 기대값인가? | 입력 범위 위반, 잘못된 기대값, 같은 사례 반복 |

세 대상을 같은 모델로 생성했다고 곧바로 틀린 것은 아닙니다. 하지만 서로 같은 오해를 공유할 수 있으므로 합의 자체를 독립 검증이라고 부르지 않습니다. 테스트 작성자에게 후보 코드를 보여 주지 않고 명세에서 사례를 만들게 하는 등의 절차로 의존성을 줄일 수 있어도, 독립성이 완전히 보장되는 것은 아닙니다.

### 2.2 실행 상태를 구분한다

<strong>Execution Feedback(실행 피드백)</strong>은 테스트에서 관찰한 결과입니다. 다음 상태를 하나의 “실패”로 합치면 다음 수정 방향을 고르기 어렵습니다.

| 상태 | 관찰 | 다음 확인 |
| --- | --- | --- |
| 구문·빌드 오류 | 프로그램을 준비하지 못함 | 문법·의존성·환경 |
| 실행 오류 | 예외·비정상 종료 | 유효 입력인지, 코드의 가정이 잘못됐는지 |
| 시간·자원 초과 | 제한 안에 종료하지 못함 | 한도·알고리즘·환경 변동 |
| 결과 불일치 | 출력이 기대값과 다름 | 코드·기대값·명세 중 어느 쪽의 문제인지 |
| 관찰 범위 통과 | 검사한 사례의 출력이 모두 맞음 | 빠진 입력 범위·성질 |
| 미실행 | 실행 기록이 없음 | 계획과 관찰을 구분하여 보류 |

코드를 실제로 실행할 때는 별도 환경에서 시간·메모리·파일·네트워크 권한을 제한합니다. 이번 첨부 예제는 직접 작성한 순수 함수만 호출하지만, 임의 생성 코드를 검증하는 도구로 그대로 사용해서는 안 됩니다. 예제 실행기는 격리 기능을 구현하지 않습니다.

## 3. 테스트 충분성

<p class="heading-subtitle" data-heading-id="test-adequacy"><span aria-hidden="true">💡</span> 테스트가 틀린 코드를 구별하는가?</p>

### 3.1 EvalPlus의 질문

[EvalPlus](/notes/synthetic-data-study/04-code-verification/papers/liu-2023/)는 코드 생성 벤치마크의 테스트가 충분하지 않으면 잘못된 코드도 정답으로 집계될 수 있다는 문제를 다룹니다. 새로운 입력을 만들고 확장해 기존 테스트로 발견되지 않았던 오류를 찾습니다. 따라서 생성 모델을 바꾸지 않아도 **검사 자료가 달라지면 측정 성능과 순위가 달라질 수 있습니다**.

HumanEval+를 구성할 때는 테스트 입력 추가뿐 아니라 참조 구현의 결함 수정과 유효 입력 계약의 보강도 이루어집니다. 따라서 평가 차이를 단순히 테스트 개수 하나만의 효과로 읽지 않습니다.

이 연구는 테스트 확장의 효과를 조사한 평가 연구입니다. 같은 방법으로 합성 학습 데이터를 선별하면 반드시 학생 모델 성능이 높아진다고 직접 증명한 것으로 읽지 않습니다. 여기서는 “통과 라벨을 만들기 전에 검증기의 검출 능력을 확인하자”는 설계 원칙으로 연결합니다.

### 3.2 수량보다 구별 능력

예약자가 없는 첫 연장 사례를 100번 검사해도 예약자가 있는 경우의 오류는 드러나지 않습니다. 조건의 조합, 경계값, 빈 입력, 반복·순서·자료형처럼 목표 기능의 실패를 유발할 수 있는 축을 명세에서 찾습니다. 모든 과제에 같은 체크리스트를 그대로 적용하지 않습니다.

이번 함수의 주요 분기는 예약 여부 두 가지와 연장 횟수 0·1·2입니다. 0은 첫 연장, 1은 횟수 제한의 경계, 2는 제한을 이미 넘은 상태를 확인합니다. 이 세 값이 모든 정수를 검사하는 것은 아닙니다. 예를 들어 100에서만 잘못 동작하는 코드는 이 테스트로 놓칠 수 있습니다.

### 3.3 기대값을 검증하는 방법

문서 기반 규칙이라면 기대값이 어떤 조항에서 나왔는지 사람이 설명합니다. 참조 구현을 사용할 때는 후보와 다른 구현 방식·독립 검토·손계산을 함께 고려합니다. 둘이 일치하지 않으면 다수결로 해결하기보다 명세로 돌아갑니다.

<strong>Property-based Testing(성질 기반 테스트)</strong>은 개별 정답을 많이 적는 대신 만족해야 할 성질을 검사합니다. 이 예에서는 “예약자가 있으면 연장 불가”, “한 번 이상 연장했으면 추가 연장 불가”가 성질입니다. 성질 자체가 명세를 충분히 표현하는지도 확인해야 합니다. 항상 `False`를 내는 코드도 두 성질을 만족하므로, 허용되어야 하는 `(False, 0)`을 함께 확인해야 합니다.

## 4. 선별과 수정

<p class="heading-subtitle" data-heading-id="curation-feedback"><span aria-hidden="true">💡</span> 통과 코드만이 아니라 반례와 버전도 남기기</p>

### 4.1 통과 라벨의 유효 범위

학습 후보의 상태는 `tests-v1에서 통과`처럼 표현합니다. 명세나 테스트를 바꾸면 기존 코드를 다시 평가합니다. 처음 통과했지만 새 반례에서 실패한 코드는 과거 기록을 덮어쓰지 말고 새 판정을 연결합니다.

[Zhang et al. §3](/notes/synthetic-data-study/01-foundations/papers/zhang-2026/)의 구분처럼 최종 답·실행 결과가 맞는 것과 설명 과정이 충실한 것은 다릅니다. 코드가 올바른 결과를 냈어도 함께 붙인 자연어 설명에 틀린 추론이 있으면, 그 설명까지 검증됐다고 취급하지 않습니다.

### 4.2 수정 루프와 최종 평가

오류 로그를 생성기에 돌려주어 코드를 수정하는 것은 새로운 후보를 만드는 절차입니다. 수정 횟수와 노출한 테스트를 기록해야 합니다. 특정 테스트에 맞춰 반복 수정한 뒤 같은 테스트 점수만 보고 일반화가 좋아졌다고 주장하면 안 됩니다.

큐레이션용 테스트는 학습 자료를 고르는 도구입니다. 개발용 검사는 방법을 조정하는 데 쓰고, 최종 평가는 그 결정에 사용하지 않은 문제 계통과 테스트로 수행합니다. 코드·문제·변형 계통이 학습과 평가에 섞이지 않게 기록합니다. 작은 실습의 확장 테스트도 후보를 보고 만든 교육 도구이므로 독립 벤치마크가 아닙니다.

### 4.3 평가 지표를 과장하지 않는다

<strong>pass@k(k개 후보 중 성공할 확률의 평가 지표)</strong>를 읽을 때는 문제별 후보 표집 방식·후보 수·검사 기준을 확인합니다. 테스트 사례의 통과 비율과 같은 개념이 아닙니다. 또한 여러 후보 중 하나만 맞으면 되는 지표를 단일 응답의 정확성으로 소개하면 안 됩니다.

이 강의는 네 개의 수작업 코드를 비교하므로 이를 pass@4나 모델 정확도로 보고하지 않습니다. §6에서는 **이 네 후보 중 해당 테스트 묶음을 모두 통과한 코드 수**만 기록합니다. 모델·표집·문제집 전체에 대한 통계적 성능을 추정한 결과가 아닙니다.

## 5. 검증 절차

<p class="heading-subtitle" data-heading-id="verification-workflow"><span aria-hidden="true">💡</span> 명세부터 학습본까지 증거를 연결하기</p>

<figure class="paper-figure" id="verification-flow"><a href="/images/synthetic-data-study/04-code-verification/workflow.svg" target="_blank" rel="noopener"><img src="/images/synthetic-data-study/04-code-verification/workflow.svg" width="960" height="550" alt="명세와 입력 범위 고정, 후보와 테스트 분리, 기대값 검토, 실행, 반례 분석, 버전별 선별의 순서" loading="lazy" /></a><figcaption>학습 도식 1. 코드 데이터의 검증 흐름. 강의용 개념도입니다.</figcaption></figure>

### 5.1 후보 기록

| 기록 묶음 | 최소 항목 |
| --- | --- |
| 출처 | 문제·명세 ID, 원천 자료, 문제 변형의 부모 ID |
| 생성 | 모델·프롬프트·표집 설정, 후보 코드 버전, 수정 횟수 |
| 테스트 | 입력·기대값·근거, 테스트 버전, 공개/개발/최종 평가의 역할 |
| 실행 | 런타임·의존성·자원 제한, 실제 상태·출력·오류 |
| 선별 | 채택/수정/보류/제외, 근거, 학습본의 버전 |

직접 작성한 예제의 생성기 필드는 `human_authored`처럼 표시합니다. 실행하지 않은 후보에는 빈 로그와 `not_run`을 남깁니다. “검증 예정”을 통과로 바꾸지 않습니다.

### 5.2 학습에 전달할 자료

정답 코드로 지도 미세조정할지, 실패와 수정의 쌍을 학습할지, 실행 결과를 보상으로 쓸지에 따라 자료 형식이 달라집니다. 실패 코드도 수정 과정을 학습하는 데 사용할 수 있지만, 정답 시범으로 잘못 섞으면 감독 신호를 오염시킵니다. [Wang et al. §3.6.3](/notes/synthetic-data-study/00-introduction/papers/wang-2024/)를 읽으며 데이터의 생성 방법과 사용 단계를 구분합니다.

## 6. 실행 실습

<p class="heading-subtitle" data-heading-id="study-exercise"><span aria-hidden="true">💡</span> 약한 테스트를 통과한 네 후보를 다시 검사하기</p>

### 6.1 네 후보와 검사 입력

[실습 코드 다운로드](/downloads/synthetic-data-study/04-code-verification/verify_extension.py). Python 표준 라이브러리만 사용하며 다음 명령으로 실행합니다.

```bash
python3 verify_extension.py
```

핵심 후보는 다음과 같습니다. 함수 인자의 타입·범위는 §1의 유효 입력으로 한정합니다.

```python
def correct(has_reservation, extensions):
    return (not has_reservation) and extensions == 0


def ignores_reservation(has_reservation, extensions):
    return extensions == 0


def allows_second_extension(has_reservation, extensions):
    return (not has_reservation) and extensions <= 1


def uses_or(has_reservation, extensions):
    return (not has_reservation) or extensions == 0
```

약한 테스트는 `(False, 0) → True`, `(True, 1) → False` 두 개입니다. 확장 테스트에는 아래 여섯 입력을 넣습니다. 기대값은 후보의 출력을 복사하지 않고 R2에서 작성했습니다.

| 예약자 있음 | 기존 연장 횟수 | 기대값 | 검사 이유 |
| --- | ---: | --- | --- |
| False | 0 | True | 첫 연장을 허용해야 함 |
| False | 1 | False | 두 번째 연장은 허용되지 않음 |
| False | 2 | False | 이미 제한을 넘은 상태 |
| True | 0 | False | 예약자가 있으면 첫 연장도 금지 |
| True | 1 | False | 예약 조건·횟수 조건 모두 불충족 |
| True | 2 | False | 예약 조건·횟수 조건 모두 불충족 |

### 6.2 실행한 결과

**2026-09-21, Python 3.14.7, 예제 버전 `extension-v1`에서 실제 실행한 결과**입니다. 네 후보는 사람이 의도적으로 구성한 예제이며 모델의 샘플이 아닙니다.

| 후보 | 약한 테스트 2개 | 확장 테스트 6개 | 발견된 불일치 입력 |
| --- | --- | --- | --- |
| `correct` | 모두 통과 | 모두 통과 | 관찰된 불일치 없음 |
| `ignores_reservation` | 모두 통과 | 실패 | `(True, 0)` |
| `allows_second_extension` | 모두 통과 | 실패 | `(False, 1)` |
| `uses_or` | 모두 통과 | 실패 | `(False, 1)`, `(False, 2)`, `(True, 0)` |

약한 검사에서는 4/4 후보가 통과했고, 확장 검사에서는 1/4 후보가 통과했습니다. 이는 이미 존재하던 세 후보의 결함이 추가 검사에서 드러났다는 의미입니다. 모델 성능이 75% 하락했다는 주장도, 여섯 입력만으로 모든 버그를 발견했다는 주장도 아닙니다.

### 6.3 조별 활동과 제출물

실행 전에 각 후보가 어떤 입력에서 틀릴지 예상합니다. 실행 후 실제 실패 입력과 비교하고, 코드보다 기대값이 틀린 사례도 하나 만들어 서로 찾아봅니다. 일부러 틀리게 만든 테스트는 교육용임을 표시하고 실제 검증 묶음과 분리합니다.

제출물은 **명세 1쪽 + 입력·기대값 근거표 + 실행 기록 + 수정 이력**입니다. 도구를 실행할 수 없다면 예상 결과만 작성하고 `미실행`으로 표시합니다. 추가로 100에서만 실패하는 후보를 작성하면 확장 검사도 놓치는 오류가 있음을 확인할 수 있습니다. 이 추가 활동은 위 실행 결과에 포함되지 않았습니다.

## 7. 토론과 정리

<p class="heading-subtitle" data-heading-id="discussion"><span aria-hidden="true">💡</span> 무엇을 실행했고 무엇을 아직 모르는가?</p>

### 7.1 120분 운영안

| 활동 | 시간 | 산출물 |
| --- | ---: | --- |
| 명세 합의 | 15분 | 유효 입력·기대 행동 |
| 서베이와 EvalPlus 읽기 | 25분 | 테스트 충분성과 판정 기준의 차이 |
| 후보·테스트 검토 | 20분 | 예상 반례와 기대값 근거 |
| 실행·오류 분석 | 25분 | 관찰 결과 또는 미실행 표시 |
| 수정·교차 검토 | 20분 | 코드 오류와 테스트 오류의 구분 |
| 정리·다음 강의 연결 | 15분 | 검증 범위와 미확인 영역 |

### 7.2 Discussion(토론)

1. 코드와 테스트가 같은 오해를 공유하면 어떻게 발견할까요?
2. 테스트 수는 늘었지만 같은 조건만 반복한다면 무엇이 개선되지 않을까요?
3. 테스트에 맞춰 여러 번 수정한 코드를 같은 테스트로 평가할 때 어떤 주장을 할 수 있을까요?
4. 실행은 성공했지만 자연어 설명이 틀렸다면 어떤 부분을 학습에 사용할까요?

<details class="paper-reading-list">
<summary>토론 해설 펼치기 · 4개 질문</summary>

1. 명세와 기대값을 독립적으로 검토하고 반례·다른 구현·성질을 대조합니다. 생성기와 평가기의 합의만으로 정답을 확정하지 않습니다.
2. 새 입력 범위나 실패 조건을 검사하지 않았다면 검출 능력이 늘었다고 결론 내리기 어렵습니다. 수량과 구별 능력을 함께 봅니다.
3. 노출된 검사에서의 수정 성공은 말할 수 있습니다. 독립 과제에 대한 일반화는 별도 평가가 필요합니다.
4. 코드와 설명의 검증 상태를 분리합니다. 실행 성공을 설명 전체의 정답 라벨로 확장하지 않습니다.

</details>

### 7.3 한눈 정리와 5강 연결

**명세 → 기대값 → 실행 → 반례 → 재검토**를 연결하면 통과 라벨의 근거가 남습니다. 반대로 “코드가 실행됐다”는 한 줄만으로는 검사 범위도 오류 원인도 알 수 없습니다.

<figure class="paper-figure" id="study-map"><a href="/images/synthetic-data-study/04-code-verification/reading-map.svg" target="_blank" rel="noopener"><img src="/images/synthetic-data-study/04-code-verification/reading-map.svg" width="960" height="570" alt="4강의 일곱 단계와 산출물: 명세, 생성, 테스트, 선별, 절차, 실행, 검증 범위" loading="lazy" /></a><figcaption>학습 도식 2. 4강 질문과 산출물 지도. 강의용 개념도입니다.</figcaption></figure>

5강에서는 정적인 코드 답안에서 **추론 과정과 에이전트의 행동·관측 기록**으로 확장합니다. 한 번의 출력뿐 아니라 여러 단계의 선택이 얽힐 때 무엇을 정답·보상·검증 근거로 삼을지 살펴봅니다.

[← 3강 · 큐레이션과 데이터 구성](/notes/synthetic-data-study/03-curation/) · [전체 학습 계획](/notes/synthetic-data-study/00-introduction/)

[다음 강의 → 5강 · 추론·에이전트 데이터와 최신 흐름](/notes/synthetic-data-study/05-reasoning-agents/)
