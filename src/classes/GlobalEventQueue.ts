import SimulatorEvent from './Event'

class GlobalEventQueue {

  private events: SimulatorEvent[] = [];

  constructor(private maxGlobalTime = 99999999999) {

  }

  put(event: SimulatorEvent) {
    
    if((event && event.time > this.maxGlobalTime) || !event) {
      console.log('problema ao adicionar o evento na fila: ', event);
      return;
    }

    this.events.push(event);
    this.sortEventByExecutionTime();    
  }

  private sortEventByExecutionTime() {
    this.events.sort((eventA, eventB) => eventA.time - eventB.time);
  }

  get() {
    return this.events.shift();
  }

  getQueue() {
    return this.events;
  }

  hasEvent() {
    return this.events.length;
  }

} 

export default GlobalEventQueue;