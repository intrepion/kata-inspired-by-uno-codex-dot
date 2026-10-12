import { describe, it, expect } from 'vitest';
import { newMatch, act, cardsIn, legalCards, aiView, chooseAI } from '../src/engine';
describe('a complete deal', () => {
 it('deals seven to every seat, opens on a number and conserves the 108-card pack', () => {
 const s = newMatch(12); expect(s.hands.map(h => h.length)).toEqual([7,7,7]);
 expect(s.discard.at(-1)?.kind).toBe('number'); expect(new Set(cardsIn(s).map(c=>c.id)).size).toBe(108);
 });
 it('rejects stale actors and illegal cards without changing state', () => {
 const s=newMatch(4); expect(act(s,1,{type:'draw'})).toBe(s);
 const c=s.hands[0].find(c=>!legalCards(s).includes(c.id));
 if(c) expect(act(s,0,{type:'play',id:c.id})).toBe(s);
 });
 it('AI view contains no opponent cards, deck or seed',()=>{
 const s=newMatch(1); const view=aiView(s); expect(Object.keys(view).sort()).toEqual(['active','counts','direction','hand','legal','phase','top']);
 const other=structuredClone(s); [other.hands[1],other.hands[2]]=[other.hands[2],other.hands[1]];
 other.deck.reverse(); other.seed=99; expect(chooseAI(aiView(other))).toEqual(chooseAI(view));
 });
});
