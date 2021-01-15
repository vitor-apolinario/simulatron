import Component from '../../interfaces/Component';
import Event from '../Event';
import TemporaryEntity from '../TemporaryEntity';

class Output implements Component {

  constructor(private outputEntities: TemporaryEntity[]) { }

  handleEvent(event: Event): Event | undefined {  
    this.outputEntities.push(event.temporaryEntity);

    return undefined;
  }
  
  generateMetrics(lastEventTime: number) {
    console.log('Method not implemented.');
  }
}

export default Output;