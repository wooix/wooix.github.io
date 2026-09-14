# 좌측 탐색 구조 편집

`src/data/navigation.ts`가 Sidebar Navigation(좌측 탐색)의 단일 설정 파일입니다. 탐색 계층과 순서는 글의 `frontmatter`가 아닌 이 설정에서 관리합니다. 논문 해설의 `parentPost`와 `navLabel`은 본문 상단 경로 표시에 쓰는 메타데이터이며 탐색 구조를 자동으로 바꾸지 않습니다. `src/content/posts/`의 파일을 옮기지 않고 기존 ID를 연결합니다. 예를 들어 `knowledge-distillation-foundations.md`의 ID는 `knowledge-distillation-foundations`, URL은 `/notes/knowledge-distillation-foundations/`입니다.

## 폴더와 글을 연결하는 방식

최상위 키는 `src/data/topics.ts`의 주제 ID입니다. 주제 안의 배열 순서가 표시 순서이며, 각 항목은 다음 두 형태 중 하나입니다.

```ts
type NavigationNode =
  | { type: 'folder'; label: string; children: readonly NavigationNode[] }
  | { type: 'post'; postId: string; label?: string; children?: readonly NavigationNode[] };
```

- `folder`: 글 주소가 없는 묶음입니다. `label`과 `children`이 필요합니다.
- `post`: 이미 작성된 글의 ID를 `postId`로 참조합니다. `label`을 생략하면 원래 글 제목을 표시합니다. `children`에 폴더나 참조글을 넣을 수 있습니다.
- 두 형태를 여러 단계로 중첩할 수 있습니다. 글 아래 참조글, 폴더 안의 글, 폴더 안의 폴더를 모두 지원합니다.
- 같은 공개 글을 서로 다른 가지에서 참조할 수 있습니다. 글 자체가 복제되거나 URL이 바뀌지는 않습니다. 같은 조상 경로 안에서 자신이나 조상 글을 다시 참조하는 순환은 허용하지 않습니다.

현재 적용된 실제 예시는 다음과 같습니다. 이 코드는 그대로 사용할 수 있습니다.

```ts
import type { TopicId } from './topics';
import type { NavigationConfig } from '../lib/navigation';

export const navigation = {
  'slm-performance': [
    {
      type: 'folder',
      label: '기초 개념',
      children: [
        { type: 'post', postId: 'knowledge-distillation-foundations' },
      ],
    },
  ],
} satisfies NavigationConfig<TopicId>;
```

설정에 없는 공개 글은 원래 `topic`의 마지막에 자동으로 붙습니다. 이때 기존 공개 글 목록의 날짜 순서를 따릅니다. 같은 주제 안에 명시적으로 배치한 글은 그 주제의 자동 목록에서 중복되지 않습니다.

다른 주제에서 참조한 글은 원래 주제에서도 유지합니다. 예를 들어 SLM 성능의 강의 아래에 AWQ 글을 참조하더라도, AWQ는 원래 SLM 하드웨어 탐색에 남습니다. 이 설정은 글의 `topic`, URL, 주제 페이지와 검색의 분류를 바꾸지 않습니다. 주제 옆 숫자는 해당 탐색 가지에 보이는 고유 공개 글 수이며, 같은 가지 안의 반복 참조는 한 번만 셉니다.

## 1강~6강과 글 아래 참조글 예시

아래는 복사해 수정할 수 있는 구조 예시입니다. **`synthetic-data-01`~`synthetic-data-06`과 `synthetic-data-reference-01`은 아직 존재하지 않는 Placeholder(자리표시자) ID입니다.** 실제 원고 파일을 만들고 ID를 맞춘 뒤 적용해야 합니다. 그대로 현재 설정에 넣으면 잘못된 ID를 알려주는 빌드 오류가 발생합니다. 이 예시 때문에 공개 사이트에 가짜 강의 글을 만들지는 않습니다.

`1강`~`6강`은 배열에 적힌 순서대로 표시됩니다. 파일 이름이나 게시일로 명시 배열을 다시 정렬하지 않습니다.

```ts
import type { TopicId } from './topics';
import type { NavigationConfig } from '../lib/navigation';

export const navigation = {
  'llm-tech': [
    {
      type: 'folder',
      label: 'Synthetic Data(합성 데이터)',
      children: [
        {
          type: 'post',
          postId: 'synthetic-data-01', // 실제 1강 원고 ID로 교체
          label: '1강 · 출발점',
          children: [
            {
              type: 'post',
              postId: 'synthetic-data-reference-01', // 실제 참조글 ID로 교체
              label: '함께 읽을 참조글',
            },
          ],
        },
        { type: 'post', postId: 'synthetic-data-02', label: '2강 · 기본 원리' },
        { type: 'post', postId: 'synthetic-data-03', label: '3강 · 생성 과정' },
        { type: 'post', postId: 'synthetic-data-04', label: '4강 · 검증 과정' },
        { type: 'post', postId: 'synthetic-data-05', label: '5강 · 평가 읽기' },
        { type: 'post', postId: 'synthetic-data-06', label: '6강 · 다음 질문' },
      ],
    },
  ],
  'slm-performance': [
    {
      type: 'folder',
      label: '기초 개념',
      children: [{ type: 'post', postId: 'knowledge-distillation-foundations' }],
    },
  ],
} satisfies NavigationConfig<TopicId>;
```

강의 묶음을 만들지 않고 주제에서 바로 글을 펼치려면 주제의 배열에 `post` 항목들을 직접 넣으면 됩니다. 글 아래의 `children`도 같은 규칙을 사용합니다. 형제 항목의 수에 3개 제한은 없습니다.

## 공개 여부와 잘못된 설정

`src/lib/navigation.ts`의 `resolveNavigation({ topics, configuration, allPosts, publicPosts })`가 설정을 검증하고 공개 탐색 구조를 만듭니다. `allPosts`는 비공개 글까지 포함한 전체 ID 목록, `publicPosts`는 기존 `getPosts()`가 판정한 공개 글 목록입니다. `draft`와 한국 시간 기준 미래 게시일을 탐색 설정에서 다시 판정하지 않습니다.

처리 순서는 전체 설정 검증 → 공개 가지 구성 → 주제별 미배치 공개 글 추가입니다.

- 비공개·미래 게시글을 명시하면 해당 위치의 글과 하위 가지 전체를 출력하지 않습니다. 숨겨진 부모의 제목, 폴더, 하위 관계와 별칭도 HTML에 남기지 않습니다.
- 숨겨진 부모 아래에 이미 공개된 글이 있어도 그 글 자체를 비공개로 바꾸지는 않습니다. 해당 글은 원래 주제의 자동 목록과 검색·URL에서 계속 읽을 수 있습니다. 숨겨진 관계는 노출하지 않고 공개 글의 원래 제목을 사용합니다.
- 같은 공개 글이 다른 공개 가지에도 배치되어 있다면 그 별도 참조는 표시합니다.
- 처음부터 빈 폴더와 공개 자식이 모두 사라진 폴더는 이름까지 생략합니다. 최상위 주제는 자식이 없어도 주제 페이지로 이동할 수 있습니다.
- 존재하지 않는 글 ID, 잘못된 주제 ID, 잘못된 필드, 자신·조상 글의 반복 참조와 JavaScript 객체의 순환은 설정 위치를 포함한 빌드 오류로 알립니다.
- **숨겨진 가지 안의 오류도 검증합니다.** 비공개 가지라고 잘못된 ID나 순환 참조를 건너뛰지 않습니다. 오류가 있으면 새 정적 사이트 빌드를 중단하며, 일부만 해석한 탐색을 공개하지 않습니다.

## 접기·펼치기와 키보드

아직 선택한 기록이 없는 가지는 기본적으로 접힙니다. 처음 방문한 현재 주제와 현재 글의 상위 경로는 드러나도록 펼치고 그 상태를 저장합니다. `+`로 연 가지는 다른 페이지로 이동하거나 새로고침·뒤로 가기를 해도 유지합니다. `−`로 직접 닫은 가지는 현재 글의 경로여도 자동으로 다시 열지 않습니다. 주제 제목 링크를 직접 선택하면 해당 주제와 필요한 상위 경로를 새롭게 펼칩니다. 다른 가지의 상태는 바뀌지 않습니다.

저장에는 `localStorage`의 `wooix-navigation:v1` 키를 사용합니다. 명시한 `true`/`false`와 아직 선택하지 않은 상태를 구분하며, 모든 기본 접힘을 `false`로 기록하지 않습니다. 데스크톱·모바일 탐색은 같은 가지 상태를 공유합니다. 모바일 메뉴 대화상자를 여닫는 상태는 저장하지 않습니다. 저장이 차단되었거나 값이 손상되어도 현재 페이지의 접기·펼치기는 작동하며, 저장할 수 없는 상태는 다음 방문에 유지되지 않을 수 있습니다.

저장키는 배열 순서와 분리한 주제 ID → 폴더 이름·글 ID의 조상 경로입니다. 새로운 글이나 다른 주제를 앞에 추가해도 기존 가지의 상태가 엉뚱한 위치에 적용되지 않습니다. 같은 형제 이름·참조가 반복되면 별칭·하위 구조와 동일 항목의 반복 순서로 구분합니다. 폴더 이름이나 모호한 중복 구조를 변경하면 그 가지는 새 항목으로 취급할 수 있습니다. 실제 자식이 있는 항목만 `+`/`−` 버튼을 표시하며, 글 제목 링크와 펼치기 버튼은 별도 조작 영역입니다.

기본 HTML 버튼을 사용하므로 `Tab`으로 이동하고 `Enter`나 `Space`로 펼칠 수 있습니다. 접힌 가지는 `hidden`으로 숨겨 그 안의 링크에 키보드 초점이 들어가지 않습니다. 버튼은 `aria-expanded`와 고유한 `aria-controls`를 갖습니다. 같은 글을 여러 위치에서 참조하거나 데스크톱·모바일 탐색을 함께 렌더링해도 각 표시 위치의 ID는 다릅니다. 모바일 메뉴에서 `Escape`는 기존처럼 메뉴 대화상자를 닫습니다.

들여쓰기는 깊이에 따라 늘어나되 최대 24px로 제한합니다. 4단계 이상에서도 본문 링크의 폭이 계속 줄어들지 않으며, 중첩 목록과 각 가지의 버튼은 그대로 유지합니다.

## 변경 뒤 확인

Node.js 24에서 실행합니다.

```sh
npm run test:navigation
npm run check
npm run build
npm run preview
```

전용 테스트는 깊은 혼합 구조, 6개 이상의 형제, 명시 순서와 자동 목록, 중복 참조, 다른 주제의 원래 목록 유지, 숨김 가지, 잘못된 ID·주제·순환과 저장 상태의 명시적 닫기·복원·안정적인 가지 식별을 확인합니다. 같은 테스트를 GitHub Pages 빌드에서도 실행합니다. 실제 화면에서는 제목 링크와 `+`/`−` 버튼을 각각 확인하고, 좁은 화면에서 여러 단계를 펼쳐 봅니다.
