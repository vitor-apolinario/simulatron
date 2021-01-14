import Component from '../../interfaces/Component';
import Event from '../Event';

class Output implements Component {
  handleEvent(event: Event): Event | undefined {
    console.log('Method not implemented.');

    return undefined;
  }
  generateMetrics(lastEventTime: number) {
    console.log('Method not implemented.');
  }
}

export default Output;