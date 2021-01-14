import { readFileSync } from 'fs';
import { join } from 'path'

import UniformGenerator from './classes/UniformGenerator';
import GlobalEventQueue from './classes/GlobalEventQueue';
import SimulatorEvent from './classes/Event';
import TemporaryEntity from './classes/TemporaryEntity';
import ServiceCenter from './classes/components/ServiceCenter';
import ComponentHash from './interfaces/ComponentHash';


let data = readFileSync(join(__dirname, 'config', 'input.json'));

const configs = JSON.parse(data.toString());

const  { maxGlobalTime , componentsConfig } = configs;

const components: ComponentHash = {};

const globalEventQueue = new GlobalEventQueue(maxGlobalTime);

let inputsConfig = componentsConfig.filter(component => component.componentType === 'input');
let serviceCentersConfig = componentsConfig.filter(component => component.componentType === 'serviceCenter');

serviceCentersConfig.forEach(serviceCenterConfig => components[serviceCenterConfig.identifier] = new ServiceCenter(serviceCenterConfig));

let inputsEntries: SimulatorEvent[][] = inputsConfig.map(inputConfig => new UniformGenerator(inputConfig).generate())

inputsEntries.forEach(eventList => eventList.forEach(event => globalEventQueue.put(event)));

let lastEventTime: number;
const outputEntities: TemporaryEntity[] = [];

while (globalEventQueue.hasEvent()) {

  const currentEvent: SimulatorEvent = globalEventQueue.get()

  lastEventTime = currentEvent.time;

  
  if(currentEvent.component === 'output') {
    outputEntities.push(currentEvent.temporaryEntity);
    continue;
  }
   
  const generatedEvent: SimulatorEvent = components[currentEvent.component].handleEvent(currentEvent);

  if(generatedEvent)
    globalEventQueue.put(generatedEvent)
}

Object.keys(components).forEach((componentIdentifier) => components[componentIdentifier].generateMetrics(lastEventTime))
Object.keys(components).forEach((componentIdentifier) => console.log(components[componentIdentifier]));

console.log('avg entity time in the simulation: ', outputEntities.reduce((totalEntityTime, entity) => (entity.timeInAttendance + entity.waitingTime + totalEntityTime), 0) / outputEntities.length);