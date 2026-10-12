/** Each restart invalidates even an already queued callback. */
export class TurnClock {
 private generation=0;
 private timer:ReturnType<typeof setTimeout>|undefined;
 cancel(){this.generation++;if(this.timer!==undefined)clearTimeout(this.timer);this.timer=undefined;}
 schedule(callback:()=>void,delay=850){this.cancel();const ticket=this.generation;this.timer=setTimeout(()=>{if(ticket===this.generation){this.timer=undefined;callback();}},delay);}
}
