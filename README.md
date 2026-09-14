# WOOIX · AI Notes

AI 연구 논문과 기술을 한국어로 읽고, 중요한 용어를 **English(한국어)**로 반복해 익히는 개인 연구 블로그입니다. 상단 검색·메뉴, 좌측 주제 탐색, 중앙 본문, 우측 TOC(Table of Contents, 목차)를 분리한 문서형 레이아웃을 사용합니다.

사이트 주소 설정은 `https://wooix.github.io`입니다. Astro 7.3.2로 정적 HTML을 만들고 Pagefind 1.5.2로 검색 색인을 생성합니다. RSS와 Sitemap(사이트맵)도 빌드에 포함합니다. 정확한 의존성은 `package.json`과 `package-lock.json`을 기준으로 확인합니다.

## 로컬 실행

Node.js **24 이상**과 npm이 필요합니다. GitHub Actions도 Node.js 24를 사용합니다. 프로젝트 루트에서 실행합니다.

```sh
npm ci
npm run dev
```

개발 서버 주소는 터미널 출력을 확인합니다. 검색은 생성된 정적 파일을 색인하므로, Pagefind의 실제 검색 결과를 확인할 때는 빌드한 뒤 미리보기를 실행합니다.

```sh
npm run check
npm run build
npm run preview
```

`build`는 `astro build && pagefind --site dist`를 실행하며, 결과는 `dist/`에 생성됩니다. 처음부터 개발 서버만 실행하면 Pagefind 색인이 아직 없을 수 있습니다. [Pagefind 실행 문서](https://pagefind.app/docs/running-pagefind/)

## 글 작성

`src/content/posts/`에 Markdown 파일을 추가합니다. `dpo-preference-alignment.md`의 URL은 `/notes/dpo-preference-alignment/`입니다. 제목과 별개로 파일 이름을 주소에 사용하므로 공개 후 이름을 바꿀 때는 기존 링크를 고려합니다.

```yaml
---
title: 'DPO 읽기 노트 초안'
description: '핵심 아이디어와 검증할 질문을 정리합니다.'
publishedAt: 2026-09-13
topic: alignment
tags: ['DPO', 'Preference Optimization']
kind: research-note
readingTime: 5
featured: false
draft: true
sourceLinks:
  - title: 'Direct Preference Optimization'
    url: 'https://arxiv.org/abs/2305.18290'
    kind: '논문'
takeaway: '독자가 기억할 핵심을 한두 문장으로 작성합니다.'
---
```

`publishedAt`은 `YYYY-MM-DD` 형식의 날짜이며, 빌드 시 한국 시간(KST)의 오늘 날짜까지 공개 대상에 포함합니다. 시각 단위 예약은 하지 않으므로 당일 07:00 빌드에서도 그날의 글이 표시됩니다. `updatedAt`은 수정 날짜가 필요할 때 추가합니다. `draft: true`인 글은 공개 목록·글 경로·검색·RSS 대상에서 제외합니다. `kind`는 `milestone`, `research-note`, `research-review` 중 하나입니다. `readingTime`은 분 단위 예상 읽기 시간이며, 전문 용어와 표의 밀도를 고려해 작성자가 지정합니다. 나머지 필드의 정확한 정의는 `src/content.config.ts`에 있습니다.

본문은 `##`와 `###`로 구성하면 목차에 연결됩니다. 출처는 `sourceLinks`에 넣고, 사실을 설명하는 문장 가까이에도 Markdown 링크로 표시합니다. 글 게시일과 원 논문 최초 공개일·검토 버전을 구분합니다.

영어(한글) 용어를 강조할 때는 `<strong>Alignment(정렬)</strong>는`처럼 HTML 태그를 사용합니다. 괄호로 끝나는 Markdown 굵은 표시 바로 뒤에 한국어 조사가 붙으면 CommonMark 규칙에 따라 별표가 그대로 보일 수 있으므로 미리보기에서 확인합니다.

## 관심 분야

| topic ID | 탐색 메뉴 |
| --- | --- |
| `llm-trends` | LLM 동향 |
| `llm-tech` | LLM 기술 |
| `finject` | FInject 후속 |
| `alignment` | Alignment |
| `steering` | Steering |
| `slm-hardware` | SLM 하드웨어 |
| `slm-performance` | SLM 성능 |

사이트 분류는 `src/data/topics.ts`, 조사 계획은 `editorial.config.json`에서 관리합니다. 관심 분야를 늘릴 때 ID·표시 이름·설명을 추가하고 두 파일을 맞춥니다. 글이 아직 없는 분야는 연구 범위 안내를 먼저 제공합니다.

좌측 탐색의 폴더·글·참조글 구조와 읽기 순서는 `src/data/navigation.ts` 한 곳에서 관리합니다. 자식이 있는 항목만 `+`/`−` 버튼을 가지며 처음에는 모두 접혀 있습니다. 기존 글 ID를 참조하므로 글 파일과 URL을 옮길 필요가 없습니다. 설정 방법과 1강~6강 순서 예시는 [탐색 구조 편집 안내](docs/navigation.md)를 참고하세요. 구조를 바꾼 뒤 `npm run test:navigation`, `npm run check`, `npm run build`를 실행합니다.

초기 콘텐츠는 DPO(2023), CAA(2023), AWQ(2023), Knowledge Distillation(지식 증류, 2015)의 기초 노트와 FInject 관련 읽기 가이드입니다. 오래된 논문을 최신 뉴스처럼 표시하지 않습니다. 주요 영어 용어를 처음에만 번역하는 정책 대신 **중요한 재등장에서도 영어(한글)를 반복**합니다. 자세한 집필 규칙은 `AGENTS.md`에 있습니다.

## GitHub Pages 배포

이 저장소는 사용자 사이트 `wooix.github.io`를 대상으로 구성했습니다. `astro.config.mjs`의 `site`는 `https://wooix.github.io`이며 프로젝트 하위 경로용 `base`는 사용하지 않습니다.

GitHub 저장소의 **Settings → Pages → Build and deployment → Source**에서 **GitHub Actions**를 선택합니다. `.github/workflows/deploy.yml`은 `main` 푸시 또는 수동 실행 시 검사·빌드하고 `dist/`를 Pages에 배포하도록 구성합니다. 실제 공개 상태는 GitHub Actions의 실행 결과와 배포된 URL에서 확인합니다. [Astro의 GitHub Pages 문서](https://docs.astro.build/en/guides/deploy/github/)

배포 워크플로가 있다는 사실만으로 사이트가 이미 공개되었다고 판단하지 않습니다. 사이트 주소를 바꾸면 Canonical URL(대표 주소), RSS, Sitemap(사이트맵), 자산 경로도 함께 확인합니다.

## Daily(일일) 요약과 발행

현재 자동 편집 상태는 **planned(계획됨)**입니다. 07:00 요약, 사용자 선택 후 집필, 12:00 무응답 시 한 건 발행이라는 정책을 `editorial.config.json`에 기록했습니다. 이 파일 자체는 예약 작업을 실행하지 않습니다.

요약 수신 채널, 실행 환경, 응답 조회와 영속 상태를 연결하는 작업이 남아 있습니다. **선택이 없다는 것과 응답이 전혀 없다는 것은 다릅니다.** 질문이나 보류 응답이 있으면 12:00 자동 선택을 수행하지 않습니다. 응답 조회 실패도 무응답으로 취급하지 않습니다.

운영 절차·순위 기준·중복 방지 설계는 `docs/editorial-workflow.md`, 비어 있는 상태 예시는 `docs/editorial-state.example.json`에 있습니다. 실제 응답·인증 정보·내부 검증 산출물은 공개 저장소에 넣지 않습니다.
