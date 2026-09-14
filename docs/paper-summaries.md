# 강의 하위 논문 해설

합성데이터스터디는 강의와 논문별 해설을 함께 제공한다. 현재 게시 대상은 1강과 그 강의에서 언급한 12편이며, 아직 작성하지 않은 2~6강을 빈 글로 만들지 않는다.

## 경로와 탐색

- 강의: `src/content/posts/synthetic-data-study/01-foundations.md`
- 논문: `src/content/posts/synthetic-data-study/01-foundations/papers/<author-year>.md`
- 주소: `/notes/synthetic-data-study/01-foundations/papers/<author-year>/`
- `parentPost`는 부모의 공개 여부 확인과 breadcrumb에 사용한다. `navLabel`은 현재 위치의 짧은 이름이다.
- 좌측 탐색의 순서·계층은 계속 `src/data/navigation.ts`만 결정한다. 위 메타데이터로 자동 트리를 만들지 않는다.
- 탐색에서는 `Long et al. (2024)`, 두 저자는 `Wei & Zou (2019)`, 단체 저자는 `DeepSeek-AI (2025)`처럼 표시한다.
- 원문 최초 공개 연도와 학회/학술지 발표 연도가 다르면 본문에서 둘 다 밝힌다. 탐색은 강의에서 사용하는 대표 발표 연도로 고정한다.

## 읽기 목록

강의의 Required Reading 바로 아래에 `<details class="paper-reading-list">`를 둔다. `open` 속성을 넣지 않으므로 처음에는 접혀 있다. 각 항목에 해당 하위 URL, 논문 이름, 필수/보조 역할과 한 줄 요약을 제공한다. 키보드로도 열고 닫을 수 있는 기본 HTML 요소를 사용한다.

## 요약 규칙

- 각 요약은 한국어로 쓰고 전문 용어를 처음 한 번만 English(한국어), 이후 English로 표시한다. 다른 일반 글의 반복 병기 규칙과 구분한다.
- 원문 전체와 검토 판본을 먼저 확인하고 실제 절의 번호·순서·계층에 맞춰 요약한다. 별도 TOC가 주어지면 제목도 그대로 유지한다.
- 본문의 최상위 절은 H2, 하위 절은 H3 이하로 둔다. H1은 템플릿의 논문 제목이다. 사이트 목차는 H2~H6을 표시한다.
- 각 절의 목적, 앞 절과의 관계, 저자의 주장·근거·한계를 설명한다. 핵심 수식은 무엇을 측정하고 왜 그 구조를 쓰는지 평이하게 설명한다.
- 초록만으로 본문 내용을 추정하지 않는다. 추출 누락·본문 불일치는 그대로 표시한다. 참고문헌 목록과 저자 약력은 요약하지 않으며, 본문을 보완하는 부록은 포함한다.
- 본문에 없는 성능 수치, 비유 실험, 추가 연구 제안을 넣지 않는다. 전망은 저자의 전망으로 표시한다.
- 원문 파일·연구 작업 기록은 공개 사이트에 복사하지 않는다.

## 검증

`npm run check`, `npm run test:navigation`, `npm run build` 후 모든 하위 URL과 부모 링크를 확인한다. 강의의 접힌 목록·좌측 탐색·모바일 화면·Pagefind 검색을 확인하고 배포한다.

## 목차와 역할 계층

목차는 H2–H6의 실제 부모·자식 관계를 중첩 목록으로 표시하며 하위 절은 기본 접힘 상태다. 제목은 본문으로 이동하고 오른쪽 화살표는 하위 절을 펼친다. 현재 읽는 절과 그 상위 묶음을 강조한다. 논문 해설의 원문 절 순서와 계층은 유지한다. 강의는 문제 정의 → 역사 → 학습 신호 → 스터디 적용 → 정리로 구성하며, 각 묶음 아래 관련 절을 둔다.

## 논문 링크 경로

강의와 Introduction의 논문 제목·인용 링크는 개별 논문 요약 페이지로 연결한다. PDF·arXiv·출판사 실제 링크는 개별 요약의 상단과 `sourceLinks`에 제공한다. 새 논문을 공통 읽기에 추가하면 먼저 요약을 작성하고 연결한다.

## 수식 작성

본문 안에는 `$D_{\mathrm{gen}}$`처럼 `$...$`를 쓰고, 독립 수식은 아래처럼 빈 줄 사이의 `$$...$$`로 쓴다. 수식에 코드용 백틱을 씌우지 않는다.

```text
$$
D_{\mathrm{gen}} \leftarrow M_p(T,D_{\mathrm{sup}})
$$
```

Astro의 unified Markdown processor에서 remark-math와 rehype-katex가 빌드 시 HTML/MathML을 만든다. KaTeX CSS와 폰트는 사이트에 함께 포함한다. 긴 독립 수식만 가로 스크롤하며, 수식 기호와 의미를 한국어 문장으로 설명한다. 코드·파일명·일반 밑줄을 자동으로 수식으로 추측하지 않는다. 잘못된 수식의 `katex-error` 유무와 모바일 레이아웃을 검증한다.

설정 근거: [Astro Markdown processor](https://docs.astro.build/en/reference/configuration-reference/#markdownprocessor), [remark-math](https://github.com/remarkjs/remark-math).
