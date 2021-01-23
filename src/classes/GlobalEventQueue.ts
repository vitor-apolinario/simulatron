import Event from './Event'
import ComponentHash from '../interfaces/ComponentHash';
import ServiceCenter from './components/ServiceCenter';

class GlobalEventQueue {
  
  private events: Event[] = [];

  constructor(private maxGlobalTime = 99999999999, private components: ComponentHash) {

  }

  put(event: Event) {
    if((event && event.time > this.maxGlobalTime) || !event) {
      throw new Error('problema ao adicionar o evento na fila: ');
    }

    this.events.push(event);
    this.sortEventByExecutionTime();

    this.handleQueueChange(event);    
  }

  get() {
    const currentEvent: Event = this.events.shift();
    this.handleQueueChange(currentEvent);

    return currentEvent;
  }

  private handleQueueChange(currentEvent: Event) {

    if(!(this.components[currentEvent.component] instanceof ServiceCenter))
      return;

    const currentComponent: ServiceCenter = this.components[currentEvent.component] as ServiceCenter;
    const currentComponentTime: number = currentComponent.getCurrentTime();

    const eventsOnCurrentComponentQueue: number = this.events.filter(event => (event.component === currentEvent.component && event.time <= currentComponentTime)).length

    if(!eventsOnCurrentComponentQueue)
      return;

    currentComponent.handleQueueChange(eventsOnCurrentComponentQueue);
  }

  private sortEventByExecutionTime() {
    this.events.sort((eventA, eventB) => eventA.time - eventB.time);
  }

  getQueue() {
    return this.events;
  }

  hasEvent() {
    return this.events.length;
  }

} 

export default GlobalEventQueue;