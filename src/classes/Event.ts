import TemporaryEntity from './TemporaryEntity';

class Event {
  
  component: string;
  time: number;
  temporaryEntity: TemporaryEntity;

  constructor(component: string, time: number, temporaryEntity: TemporaryEntity) {
    this.component = component;
    this.time = time;
    this.temporaryEntity = temporaryEntity;
  }
}

export default Event;