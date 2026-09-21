import test from 'node:test';
import assert from 'node:assert/strict';
import { categoryGroups, categories, getCategory, categoryNavigation } from '../src/data/categories.ts';
import { withNavigationStateKeys, parseNavigationState } from '../src/lib/navigation-state.ts';
import { readFileSync } from 'node:fs';
test('reference IDs are unique across both levels and leaves cannot have children',()=>{
 const ids=[...categoryGroups,...categories].map(c=>c.id);
 // Root IDs and leaf IDs also must not collide in the shared category route space.
 assert.equal(new Set(ids).size,ids.length);
 categories.forEach(c=>{assert.ok(!('children' in c));assert.ok(c.scope&&c.keywords.length);});
 assert.throws(()=>getCategory('unregistered'));
});
test('new populated categories activate without a hand-edited sidebar and preserve URLs',()=>{
 const posts=[{id:'some/old/path',data:{title:'A',category:'hardware'}}];
 const nodes=categoryNavigation(posts);
 assert.equal(nodes.length,1);assert.equal(nodes[0].label,'효율·시스템');
 assert.equal(nodes[0].children[0].label,'하드웨어·온디바이스');
 assert.equal(nodes[0].children[0].children[0].href,'/notes/some/old/path/');
 assert.deepEqual(categoryNavigation([]),[]);
 const state=withNavigationStateKeys(nodes); const key=state[0].children[0].stateKey;
 assert.deepEqual(parseNavigationState(JSON.stringify({[key]:true})),{[key]:true});
});
test('editorial contract points writers at the same reference',()=>{
 const config=JSON.parse(readFileSync(new URL('../editorial.config.json',import.meta.url)));
 assert.equal(config.classification.maxLevels,2);
 assert.equal(config.classification.primaryField,'category');
 assert.ok(config.digest.requiredItemFields.includes('category'));
});
