# 글 연결 그래프

이 사이트는 [Quartz Graph View](https://quartz.jzhao.xyz/features/graph-view)의 실제 그래프 소스를 Astro에 맞게 포팅합니다. Obsidian의 Native Graph(내장 그래프) 모듈을 사용한다는 뜻은 아닙니다. 재사용한 원본은 `quartz-community/graph`의 MIT 소스이며, 정확한 버전과 포팅 구간은 [원본 기록](../vendor/quartz-graph/PROVENANCE.md)에 있습니다.

## 사용 방법

오른쪽 아래 **글 연결**을 누릅니다. 탭 순서는 **Backlinks(역방향 링크) → 전체 그래프**입니다. 개별 글에서는 Backlinks(역방향 링크)가 기본으로 열리고, 홈·분야·아카이브에서는 전체 그래프가 기본입니다. **크게 보기**를 누르면 선택한 탭을 유지하며 전체 화면을 엽니다.

그래프의 작은 노드는 글, 선은 본문 링크 관계입니다. 노드 크기는 들어오는 링크 수에 따라 커집니다. 같은 두 글이 서로 링크하면 기본 화면에서는 선 하나로 보이지만, 데이터에는 두 방향을 모두 보존합니다. 노드에 마우스를 올리면 그 글과 직접 연결된 이웃만 강조합니다. 전체 제목은 포인터를 올리거나 키보드로 선택할 때 나타납니다. 확대하면 제목이 서서히 보입니다.

처음 열거나 원위치를 누르면 배치가 안정될 때까지 전체 노드를 화면에 맞춥니다. 이 맞춤 상태가 100%이며 제목은 기본적으로 숨겨집니다. 사용자가 드래그·이동·확대를 시작하면 자동 맞춤이 중단되어 조작을 되돌리지 않습니다. 하단 본문링크 수는 방향을 구분한 원본 링크 수이므로 화면의 선 수와 다를 수 있습니다.

- 노드를 드래그하면 주변 노드가 힘에 따라 움직이고 놓으면 다시 안정됩니다. 빠른 드래그를 클릭으로 오인하지 않도록 실제 이동 거리를 구분합니다.
- 빈 공간을 드래그해 화면을 이동합니다. 휠 또는 두 손가락으로 확대·축소합니다. `+`·`−` 버튼도 사용할 수 있습니다. 원위치 버튼은 현재 글들을 화면 안에 맞춥니다.
- **설정**에는 방향 화살표, 제목 표시, 노드 크기, 선 굵기, Forces(힘 조절), 분야 범례, 전체 제목 목록이 있습니다. 기본 화면에서는 접혀 있습니다.
- 그래프에 Tab으로 초점을 놓고 방향키·Home·End로 글을 선택합니다. Enter로 글을 엽니다. 설정의 글 목록에도 일반 링크가 있습니다. 탭의 방향키·Home·End 전환과 Escape 닫기를 지원합니다.
- 분야 색상은 `src/data/graph-topics.ts`의 ID에 고정합니다. 현재 글은 별도 테두리와 제목의 **현재 글** 텍스트로 표시합니다. 색상만으로 의미를 전달하지 않습니다.

## 어떤 연결을 읽나요?

노드는 `getPosts()`가 반환하는 공개 글입니다. Draft(초안)와 미래 게시일 글은 노드와 연결 모두에 포함하지 않습니다. 공개 글의 Astro `rendered.html`, 즉 Markdown과 본문 HTML을 렌더링한 결과의 실제 내부 `<a href>`만 분석합니다. `parse5`로 HTML 구조를 읽으며 정규식으로 본문 링크를 추출하지 않습니다.

`A → B`는 A의 본문이 B를 링크한다는 뜻입니다. 반복된 A → B는 합칩니다. 자기 자신 또는 같은 글의 섹션 링크는 생략합니다. 본문의 `<details>` 읽기 목록은 포함하지만 코드 블록·인라인 코드·HTML 주석·`script`·`style`·`template`·`textarea` 안의 예시 링크는 제외합니다.

`parentPost`는 Breadcrumb(상위 경로)용입니다. 그래프 연결을 만들지 않습니다. 자동 관련 글, 이전·다음 글, 왼쪽 탐색, 목차, 메뉴도 포함하지 않습니다. 같은 분야라는 이유로 가상 연결을 만들지 않으며, 고립된 글도 전체 그래프에 남습니다.

**Backlinks(역방향 링크)는 현재 글과 현재 글을 본문에서 링크한 글, 그 방향의 연결만 표시합니다.** 현재 글에서 나가는 연결이나 유입 글끼리의 연결을 추가하지 않습니다. 이는 Quartz 원본의 일반적인 양방향 Local Graph(주변 그래프)와 구분되는 이 사이트의 계약입니다. 유입이 없으면 그 상태와 현재 글을 보여 줍니다.

## 원고에 링크 추가

공개 URL을 사용합니다. Frontmatter(머리말 메타데이터)에 새 필드는 필요하지 않습니다.

```md
[기초 개념 읽기](/notes/knowledge-distillation-foundations/)
[강의로 돌아가기](/notes/synthetic-data-study/01-foundations/#references)
```

`https://wooix.github.io/notes/.../`, `//wooix.github.io/notes/.../`도 지원합니다. 상대 링크는 **현재 게시 URL** 기준입니다. Query(질의 문자열)와 Hash(섹션 식별자)는 같은 글로 합칩니다. `.md` 원고 경로·이미지·PDF·비 HTTP 링크·다른 Origin(출처 사이트)·잘못된 인코딩은 제외합니다. 최종 ID가 실제 공개 글 목록에 있어야 연결이 생깁니다.

## 실행·라이선스·검증

그래프 데이터는 빌드 시 HTML 안의 JSON으로 넣습니다. 원본 Quartz의 CDN 로더는 사용하지 않습니다. D3와 Pixi는 고정된 npm 버전으로 번들되며 그래프를 처음 열 때 로컬 사이트에서 지연 로딩합니다. 제목은 `textContent` 또는 Pixi Text로 표시하고 JSON의 `<`를 이스케이프합니다. 공개 글의 렌더링 결과가 없으면 빌드 오류가 되며, 빈 본문은 허용합니다. 초기화·표시 오류는 역링크가 없는 상태와 구분합니다.

실제 D3 Force Simulation(힘 시뮬레이션)을 사용하고 드래그 뒤 다시 계산합니다. 안정화되면 계산을 멈추며, 패널·전체 화면·브라우저 탭이 숨겨지면 중단합니다. Pixi 기본 Ticker(반복 실행기)와 원본의 상시 애니메이션 루프는 사용하지 않습니다. Reduced Motion(동작 줄이기) 설정에서는 위치를 제한된 횟수로 계산하고 지속적인 움직임을 표시하지 않습니다.

원본: [Quartz Graph, commit 4119714](https://github.com/quartz-community/graph/tree/411971434ab698c495dfc42870eb02d3bc539b3a), ©2026 Quartz Community, MIT. 원본·저작권 전문은 `vendor/quartz-graph/`, 배포된 라이선스는 `/licenses/quartz-graph-MIT.txt`에 있습니다. D3의 ISC 및 Pixi의 MIT 전문도 `public/licenses/`에 동봉합니다. 설정 안의 Quartz Graph/MIT 링크로 출처와 허가문을 확인할 수 있습니다.

- 데이터: `src/lib/link-graph-source.ts`, `link-graph.ts`, `site-graph.ts`
- 실제 Quartz 포트: `src/scripts/quartz-graph-renderer.ts`
- 시각적 연결 병합·크기: `src/lib/quartz-graph-model.ts`
- UI: `src/components/LinkGraph.astro`, `GraphView.astro`, `src/scripts/link-graph.ts`, `src/styles/link-graph.css`
- 검증: `npm run check`, `npm run test:navigation`, `npm run test:graph`, `npm run build`

원고를 추가한 뒤 빌드하면 실제 공개 글과 링크로 갱신됩니다. 노드 크기와 연결은 사이트 내부 읽기 관계이며 논문의 인용 수나 중요도 평가가 아닙니다.
