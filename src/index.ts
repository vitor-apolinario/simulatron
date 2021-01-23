import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

import UniformGenerator from "./classes/UniformGenerator";
import GlobalEventQueue from "./classes/GlobalEventQueue";
import Event from "./classes/Event";
import TemporaryEntity from "./classes/TemporaryEntity";

import Output from "./classes/components/Output";
import ServiceCenter from "./classes/components/ServiceCenter";
import UniformRouter from "./classes/components/UniformRouter";

import ComponentHash from "./interfaces/ComponentHash";

let data = readFileSync(join(__dirname, "config", "input2.json"));

const { modelName, maxGlobalTime, componentsConfig } = JSON.parse(data.toString());

const components: ComponentHash = {};
const globalEventQueue = new GlobalEventQueue(maxGlobalTime, components);
const outputEntities: TemporaryEntity[] = [];
let lastEventTime: number;

let {
  outputsConfig,
  serviceCentersConfig,
  routersConfig,
  inputsConfig,
} = filterComponentTypes();

configureComponents();
configureInitialEvents();
simulate();
generateMetrics();

function generateMetrics() {
  let metrics: any = {};

  metrics.serviceCenters = [];

  Object.keys(components).forEach((componentIdentifier) =>  {
    const component = components[componentIdentifier];

    if(!(component instanceof ServiceCenter))
      return;

    metrics.serviceCenters.push(component.generateMetrics(lastEventTime));    
  });

  const totalEntityTime = outputEntities.reduce((totalEntityTime, entity) =>entity.timeInAttendance + entity.waitingTime + totalEntityTime, 0)

  metrics.averageEntityLifeCycle = (totalEntityTime / outputEntities.length);

  // console.log(JSON.stringify(metrics , null, 2))

  writeFileSync(join(__dirname, "config", `output_${modelName}.json`), JSON.stringify(metrics , null, 2))
}

function filterComponentTypes() {
  let inputsConfig = componentsConfig.filter((component) => component.componentType === "input");
  let outputsConfig = componentsConfig.filter((component) => component.componentType === "output");
  let serviceCentersConfig = componentsConfig.filter((component) => component.componentType === "serviceCenter");
  let routersConfig = componentsConfig.filter((component) => component.componentType === "router");
  return { outputsConfig, serviceCentersConfig, routersConfig, inputsConfig };
}

function configureComponents() {
  outputsConfig.forEach((outputConfig) => (components[outputConfig.identifier] = new Output(outputEntities)));
  serviceCentersConfig.forEach((serviceCenterConfig) => (components[serviceCenterConfig.identifier] = new ServiceCenter(serviceCenterConfig)));
  routersConfig.forEach((routerConfig) =>(components[routerConfig.identifier] = new UniformRouter(routerConfig))
  );
}

function configureInitialEvents() {
  let inputsEntries: Event[][] = inputsConfig.map((inputConfig) => new UniformGenerator(inputConfig).generate());
  inputsEntries.forEach((eventList) => eventList.forEach((event) => globalEventQueue.put(event)));
}

function simulate() {
  while (globalEventQueue.hasEvent()) {
    const currentEvent: Event = globalEventQueue.get();
    lastEventTime = currentEvent.time;

    let generatedEvent: Event = components[currentEvent.component].handleEvent(currentEvent);

    if (generatedEvent) {
      if(components[generatedEvent.component] instanceof UniformRouter) {
        generatedEvent = (components[generatedEvent.component] as UniformRouter).handleEvent(generatedEvent);
      }
      
      globalEventQueue.put(generatedEvent);
    } 
  }
}
