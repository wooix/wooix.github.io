type BlockAnchor = { text: string; section: string; index: number };
type Mark = { id: string; block: BlockAnchor; start: number; end: number; quote: string; kind: 'highlight' | 'underline'; color: number };
type Memo = { id: string; block: BlockAnchor; text: string; quote: string; collapsed: boolean };
type Data = { version: 2; marks: Mark[]; notes: Memo[] };
const prose = document.querySelector<HTMLElement>('article .prose');
const menuElement = document.querySelector<HTMLElement>('#annotation-menu');
if (prose && menuElement) {
  const root = prose, menu = menuElement;
  const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const status = get('annotation-status');
  const key = `wooix-reading-v2:${location.pathname.replace(/\/$/, '')}`;
  const blocks = [...root.children].filter((b): b is HTMLElement => b instanceof HTMLElement && !!b.textContent?.trim() && !['SCRIPT','STYLE'].includes(b.tagName));
  let section = '';
  const anchors = blocks.map((b, index) => {
    if (/^H[1-6]$/.test(b.tagName)) section = b.id;
    b.dataset.readerBlock = String(index);
    return { text: b.textContent || '', section, index };
  });
  let data: Data = { version: 2, marks: [], notes: [] };
  let pending: Omit<Mark, 'id'|'kind'|'color'>[] = [];
  let currentBlock = 0, activeMark = '', color = 0;
  let returnFocus: HTMLElement | null = null;
  const validAnchor = (a: BlockAnchor) => a && typeof a.text === 'string' && typeof a.section === 'string' && Number.isInteger(a.index);
  function valid(d: Data): boolean {
    return !!d && d.version === 2 && Array.isArray(d.notes) && Array.isArray(d.marks)
      && d.notes.every(n => n && typeof n.id === 'string' && validAnchor(n.block) && typeof n.text === 'string' && typeof n.quote === 'string' && typeof n.collapsed === 'boolean')
      && d.marks.every(m => m && typeof m.id === 'string' && validAnchor(m.block) && ['underline','highlight'].includes(m.kind) && Number.isInteger(m.color) && m.color >= 0 && m.color < 5 && Number.isInteger(m.start) && Number.isInteger(m.end) && m.start >= 0 && m.end > m.start && typeof m.quote === 'string' && m.quote === m.block.text.slice(m.start,m.end));
  }
  let writable = true;
  try { const raw = localStorage.getItem(key); if (raw) { const d = JSON.parse(raw); if (!valid(d)) throw Error(); data = d; } }
  catch { writable = false; status.textContent = '저장소를 읽지 못했습니다. 새 메모는 백업으로 보관하세요.'; }
  function save() {
    if (!writable) return false;
    try { localStorage.setItem(key, JSON.stringify(data)); status.textContent = '이 브라우저에 저장됨'; return true; }
    catch { status.textContent = '저장하지 못했습니다. 이 글 백업으로 기록을 보관하세요.'; return false; }
  }
  function locate(a: BlockAnchor) {
    // Exact content and section only: never silently attach notes to a different paragraph.
    const matches = anchors.map((b,i) => b.text === a.text && b.section === a.section ? i : -1).filter(i => i >= 0);
    return matches.length === 1 ? matches[0] : matches.includes(a.index) ? a.index : -1;
  }
  function textNodes(block: HTMLElement) {
    const w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT); const list: Text[] = [];
    let n: Node | null; while ((n = w.nextNode())) list.push(n as Text); return list;
  }
  function paint() {
    root.querySelectorAll('.reader-mark').forEach(m => m.replaceWith(...m.childNodes));
    blocks.forEach(b => b.normalize());
    for (const mark of data.marks) {
      const index = locate(mark.block); if (index < 0) continue;
      let offset = 0;
      for (const node of textNodes(blocks[index])) {
        const start = offset; offset += node.length;
        if (offset <= mark.start || start >= mark.end || !node.textContent?.trim() || node.parentElement?.closest('.katex,svg,script,style,mjx-container')) continue;
        const r = document.createRange(); r.setStart(node,Math.max(0,mark.start-start)); r.setEnd(node,Math.min(node.length,mark.end-start));
        const el = document.createElement('mark'); el.className = 'reader-mark'; el.dataset.kind = mark.kind; el.dataset.annotationId = mark.id; el.style.setProperty('--swatch',`var(--annotation-${mark.color})`); r.surroundContents(el);
      }
    }
  }
  function selection() {
    const s = window.getSelection(); if (!s?.rangeCount || s.isCollapsed) return [];
    const range = s.getRangeAt(0);
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return [];
    const result: typeof pending = [];
    blocks.forEach((block,i) => {
      if (!range.intersectsNode(block)) return;
      const r = document.createRange(); r.selectNodeContents(block);
      if (block.contains(range.startContainer)) r.setStart(range.startContainer, range.startOffset);
      if (block.contains(range.endContainer)) r.setEnd(range.endContainer, range.endOffset);
      const quote = r.toString(); if (!quote.trim()) return;
      const before = document.createRange(); before.selectNodeContents(block); before.setEnd(r.startContainer,r.startOffset);
      const start = before.toString().length;
      result.push({ block: anchors[i],start,end:start+quote.length,quote });
    }); return result;
  }
  const slots = blocks.map((b,i) => {
    const slot = document.createElement('div'); slot.className = 'note-insertion'; slot.dataset.pagefindIgnore = '';
    const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = '＋'; btn.setAttribute('aria-label',`문단 ${i+1} 아래 메모 추가`);
    btn.addEventListener('click',()=>addNote(i,'')); slot.append(btn); b.after(slot); return slot;
  });
  function button(text: string, action: () => void) { const b = document.createElement('button'); b.type = 'button'; b.textContent = text; b.addEventListener('click',action); return b; }
  function card(n: Memo) {
    const el = document.createElement('aside'); el.className = 'inline-note'; el.dataset.pagefindIgnore = ''; el.dataset.noteId = n.id; el.setAttribute('aria-label','내 메모');
    const header = document.createElement('header'); const label = document.createElement('strong'); label.textContent = '✎ 내 메모';
    const saved = document.createElement('span'); saved.textContent = '자동 저장';
    const body = document.createElement('div'); body.dataset.noteBody = ''; body.hidden = n.collapsed;
    const collapse = button(n.collapsed ? '펼치기' : '접기',()=>{ n.collapsed = !n.collapsed; body.hidden=n.collapsed; collapse.textContent=n.collapsed?'펼치기':'접기'; collapse.setAttribute('aria-expanded',String(!n.collapsed)); save(); }); collapse.setAttribute('aria-expanded',String(!n.collapsed));
    const del = button('삭제',()=>{ data.notes=data.notes.filter(x=>x.id!==n.id); save(); el.remove(); const i=locate(n.block); slots[i]?.querySelector('button')?.focus({preventScroll:true}); });
    header.append(label,saved,collapse,del); el.append(header,body);
    if (n.quote) { const q=document.createElement('blockquote'); q.textContent=n.quote; body.append(q); }
    const input=document.createElement('textarea'); input.value=n.text; input.placeholder='내 생각, 질문, 한 줄 요약…'; input.setAttribute('aria-label','메모 내용'); input.rows=3;
    const resize=()=>{ input.style.height='auto'; input.style.height=`${Math.max(90,input.scrollHeight)}px`; };
    input.addEventListener('input',()=>{ n.text=input.value; saved.textContent=save()?'저장됨':'저장 실패 · 백업 필요'; resize(); });
    input.addEventListener('keydown',e=>{ if (e.key==='Escape') { e.stopPropagation(); input.blur(); } });
    body.append(input); requestAnimationFrame(resize); return el;
  }
  function renderNotes() {
    root.querySelectorAll('.inline-note').forEach(n=>n.remove());
    const orphan=get('annotation-orphans'); orphan.replaceChildren();
    blocks.forEach((_,i)=>{ let tail: Element=slots[i]; data.notes.filter(n=>locate(n.block)===i).forEach(n=>{const el=card(n);tail.after(el);tail=el;}); });
    const lost=data.notes.filter(n=>locate(n.block)<0);
    if(lost.length || data.marks.some(m=>locate(m.block)<0)) {
      const p=document.createElement('p'); p.textContent='본문이 바뀌어 위치를 찾지 못한 기록입니다. 백업에 함께 보관됩니다.'; orphan.append(p);
      lost.forEach(n=>orphan.append(card(n)));
    }
  }
  function addNote(index: number, quote: string) {
    const n:Memo={id:crypto.randomUUID(),block:anchors[index],text:'',quote,collapsed:false}; data.notes.push(n); save(); renderNotes(); hideMenu(false);
    root.querySelector<HTMLTextAreaElement>(`[data-note-id="${n.id}"] textarea`)?.focus();
  }
  function hideMenu(restore = false) { menu.hidden=true; if (restore) returnFocus?.focus({preventScroll:true}); }
  function showMenu(x: number,y: number) {
    returnFocus=document.activeElement instanceof HTMLElement?document.activeElement:null;
    menu.querySelectorAll<HTMLButtonElement>('[data-mark]').forEach(b=>b.disabled=!pending.length);
    get<HTMLButtonElement>('annotation-remove-mark').disabled=!activeMark;
    menu.hidden=false; const rect=menu.getBoundingClientRect(); menu.style.left=`${Math.max(8,Math.min(x,innerWidth-rect.width-8))}px`; menu.style.top=`${Math.max(8,Math.min(y,innerHeight-rect.height-8))}px`;
    menu.querySelector<HTMLButtonElement>('button')?.focus({preventScroll:true});
  }
  root.addEventListener('contextmenu',e=>{
    const target=e.target instanceof Element?e.target:null;
    const block=target?.closest<HTMLElement>('[data-reader-block]');
    if(!block || target?.closest('a,input,textarea,button')) return;
    e.preventDefault(); pending=selection(); currentBlock=Number(block.dataset.readerBlock); activeMark=target?.closest<HTMLElement>('[data-annotation-id]')?.dataset.annotationId||'';
    if(!pending.length && activeMark) { const m=data.marks.find(m=>m.id===activeMark); if(m)pending=[m]; }
    const r=block.getBoundingClientRect(); showMenu(e.clientX||r.left,e.clientY||Math.max(8,r.top));
  });
  menu.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(b=>b.addEventListener('click',()=>{ color=Number(b.dataset.color); menu.querySelectorAll('[data-color]').forEach(el=>el.setAttribute('aria-pressed',String(el===b))); }));
  menu.querySelectorAll<HTMLButtonElement>('[data-mark]').forEach(b=>b.addEventListener('click',()=>{
    if(activeMark)data.marks=data.marks.filter(m=>m.id!==activeMark);
    pending.forEach(p=>data.marks.push({...p,id:crypto.randomUUID(),kind:b.dataset.mark as Mark['kind'],color}));save();paint();window.getSelection()?.removeAllRanges();hideMenu(true);
  }));
  get('annotation-remove-mark').addEventListener('click',()=>{data.marks=data.marks.filter(m=>m.id!==activeMark);save();paint();hideMenu(true);});
  get('annotation-insert').addEventListener('click',()=>addNote(currentBlock,pending.map(p=>p.quote).join('\n')));
  get('annotation-menu-close').addEventListener('click',()=>hideMenu(true));
  document.addEventListener('pointerdown',e=>{if(!menu.contains(e.target as Node))hideMenu();});
  document.addEventListener('keydown',e=>{if(!menu.hidden&&e.key==='Escape'){e.stopImmediatePropagation();hideMenu(true);} });
  window.addEventListener('scroll',()=>hideMenu(),{passive:true}); window.addEventListener('resize',()=>hideMenu());
  get('annotation-export').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify({path:location.pathname,data},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='reading-notes.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  get<HTMLInputElement>('annotation-import').addEventListener('change',async e=>{
    const input=e.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;
    try {const d=JSON.parse(await file.text());if(d.path!==location.pathname||!valid(d.data))throw Error();
      for(const n of d.data.notes as Memo[])if(!data.notes.some(x=>x.id===n.id))data.notes.push(n);
      for(const m of d.data.marks as Mark[])if(!data.marks.some(x=>x.id===m.id))data.marks.push(m);
      save();paint();renderNotes();
    }catch{status.textContent='이 글의 새 메모 백업 파일을 선택하세요.';} input.value='';
  });
  paint();renderNotes();
}
