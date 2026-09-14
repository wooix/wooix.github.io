# 짧은 제목과 보조 문장

현재 1강(`synthetic-data-study/01-foundations`)의 콜론형 제목 25개에만 적용합니다. Markdown 제목은 짧게 쓰고 보조 문장은 바로 다음 문단에 둡니다. 다른 글의 콜론이나 논문 원문 절 제목은 자동으로 나누지 않습니다.

```md
## 1. 문제 정의

<p class="heading-subtitle" data-heading-id="1-문제-정의-어떤-학습-경험이-부족한가"><span aria-hidden="true">💡</span> 어떤 학습 경험이 부족한가?</p>
```

`data-heading-id`는 기존에 게시된 제목의 실제 HTML `id`입니다. 기존 빌드나 공개 페이지에서 확인한 값을 보존해야 합니다. 짧아진 제목에서 새로 추측해 만들면 기존 Hash Link(절 링크)가 깨질 수 있습니다. 질문형 보조 문장만 물음표를 붙이고 일반 설명을 억지로 질문으로 바꾸지 않습니다.

`remark-heading-subtitles.mjs`는 명시적으로 표시한 보조 문단 바로 앞의 Markdown 제목에 기존 ID를 지정합니다. Markdown 제목 구조를 유지하므로 Astro가 짧은 제목·원래 ID·원래 깊이를 함께 목차로 수집합니다. 전구는 장식으로 숨기고 보조 문장은 일반 본문 텍스트로 읽습니다. 스타일은 `.heading-subtitle`과 해당 제목에만 적용합니다.

ID가 없거나 비어 있는 표시, 제목과 떨어진 표시, 잘못되거나 반복된 ID는 빌드 오류입니다. 보조 문단의 위치·ID를 확인한 뒤 다시 빌드합니다.

변경 후 `node --test tests/toc.test.mjs`, `npm run check`, `npm run build`로 확인합니다. 기존 게시글을 정리할 때는 변경 전후 제목의 ID·깊이·순서를 비교하고, 데스크톱·모바일 목차의 짧은 제목과 실제 앵커 이동을 확인합니다.
