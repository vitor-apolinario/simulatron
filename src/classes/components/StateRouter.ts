import Component from '../../interfaces/Component';
import Event from '../Event';

class StateRouter implements Component {

  identifier: string;
  entities: number = 0;

  handleEvent(event: Event): Event | undefined {
    this.entities += 1;

    const nextComponent: string = event.temporaryEntity.state ? 'exit' : 'medicalAttendance';

    return new Event(nextComponent, event.time, event.temporaryEntity);
  }

  generateMetrics(lastEventTime: number) {
    console.log('Method not implemented.');
  }
}

export default StateRouter;