import {it,expect} from 'vitest';
import {newMatch,act} from '../src/engine';
import {decode,encode} from '../src/save';
it('resumes a drawn choice and rejects corrupted pack identities',()=>{
 let s=newMatch(2);s=act(s,0,{type:'draw'});expect(decode(encode(s))).toEqual(s);
 const bad=structuredClone(s);bad.deck[0]=bad.deck[1];expect(decode(JSON.stringify(bad))).toBeNull();
 expect(decode('{')).toBeNull();expect(decode(JSON.stringify({...s,version:2}))).toBeNull();
});
