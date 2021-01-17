import EntityGenerator from '../interfaces/EntityGenerator';
import SimulatorEvent from './Event';
import TemporaryEntity from './TemporaryEntity';


import { getRandomInt } from '../utils/utils';

class UniformGenerator implements EntityGenerator {
  
  minTime: number;
  maxTime: number;
  generatedEntities: number;

  generationAccumulatedTime: number = 0;


  constructor(private configuration: any) {
    this.minTime = this.configuration.minTime;
    this.maxTime = this.configuration.maxTime;
    this.generatedEntities = this.configuration.generatedEntities;
    this.generationAccumulatedTime = this.configuration.initialTime;
  }
    
  generate() {
    let events: SimulatorEvent[] = [];

    const { nextComponent } = this.configuration;
    
    for (let n = 0; n < this.generatedEntities; n++) {
      this.generationAccumulatedTime += getRandomInt(this.minTime, this.maxTime);
      events.push(new SimulatorEvent(nextComponent, this.generationAccumulatedTime, new TemporaryEntity(`${this.configuration.identifier}_${n}`)));
    }

    return events;
  }
  
}

export default UniformGenerator;