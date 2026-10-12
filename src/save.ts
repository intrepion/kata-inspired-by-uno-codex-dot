import {makeDeck, cardsIn, spectra, type State, legalCards} from './engine';
export const saveKey='prism-relay-v1';
export function encode(s:State){return JSON.stringify(s);}
export function decode(raw:string):State|null {
 try{
 const s=JSON.parse(raw) as State;
 if(!s||s.version!==1||!Array.isArray(s.hands)||s.hands.length!==3||!s.hands.every(Array.isArray)||!Array.isArray(s.deck)||!Array.isArray(s.discard)||!s.discard.length)return null;
 const canonical=makeDeck(),all=cardsIn(s);if(all.length!==108||new Set(all.map(c=>c.id)).size!==108)return null;
 for(const c of all){const expected=canonical[c.id];if(!expected||c.kind!==expected.kind||c.spectrum!==expected.spectrum||c.value!==expected.value)return null;}
 if(!spectra.includes(s.active)||![0,1,2].includes(s.current)||![1,-1].includes(s.direction)||!['turn','drawn','round','match'].includes(s.phase))return null;
 const integer=(n:unknown)=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
 if(!integer(s.seed)||s.seed>4294967295||!integer(s.round)||s.round<1||!integer(s.revision)||!integer(s.award)||!integer(s.blocked)||s.blocked>3||typeof s.declared!=='boolean')return null;
 if(!Array.isArray(s.scores)||s.scores.length!==3||!s.scores.every(integer)||!Array.isArray(s.log)||s.log.length>8||!s.log.every(x=>typeof x==='string'&&x.length<=200))return null;
 if(s.winner!==null&&![0,1,2].includes(s.winner))return null;
 if(s.phase==='drawn'){if(!integer(s.drawn)||!s.hands[s.current].some(c=>c.id===s.drawn)||!legalCards(s).length)return null;}else if(s.drawn!==null)return null;
 if(s.declared&&s.hands[s.current].length!==2)return null;
 if(s.phase==='turn'||s.phase==='drawn'){if(s.winner!==null||s.hands.some(h=>!h.length)||s.scores.some(x=>x>=250)||s.blocked===3)return null;}
 else if(s.winner===null){if(s.phase!=='round'||s.blocked!==3||s.award!==0)return null;}
 else {if(s.hands[s.winner].length!==0||s.phase==='match'!== (s.scores[s.winner]>=250))return null;}
 return s;
 }catch{return null;}
}
