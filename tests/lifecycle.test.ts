import {it,expect,vi,afterEach} from 'vitest';
import {TurnClock} from '../src/lifecycle';
afterEach(()=>vi.useRealTimers());
it('reset and rescheduling suppress stale delayed actions',()=>{vi.useFakeTimers();const clock=new TurnClock(),fn=vi.fn();clock.schedule(fn);clock.cancel();vi.runAllTimers();expect(fn).not.toHaveBeenCalled();clock.schedule(fn);clock.schedule(fn);vi.runAllTimers();expect(fn).toHaveBeenCalledTimes(1);});
