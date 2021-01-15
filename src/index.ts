import { readFileSync } from "fs";
import { join } from "path";

import UniformGenerator from "./classes/UniformGenerator";
import GlobalEventQueue from "./classes/GlobalEventQueue";
import Event from "./classes/Event";
import TemporaryEntity from "./classes/TemporaryEntity";

import Output from "./classes/components/Output";
import ServiceCenter from "./classes/components/ServiceCenter";
import UniformRouter from "./classes/components/UniformRouter";

import ComponentHash from "./interfaces/ComponentHash";

let data = readFileSync(join(__dirname, "config", "input.json"));

const { maxGlobalTime, componentsConfig } = JSON.parse(data.toString());

const components: ComponentHash = {};
const globalEventQueue = new GlobalEventQueue(maxGlobalTime);
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
showMetrics();

function showMetrics() {
  Object.keys(components).forEach((componentIdentifier) => components[componentIdentifier].generateMetrics(lastEventTime));
  Object.keys(components).forEach((componentIdentifier) =>console.log(components[componentIdentifier]));

  const totalEntityTime = outputEntities.reduce((totalEntityTime, entity) =>entity.timeInAttendance + entity.waitingTime + totalEntityTime, 0)

  console.log("avg entity time in the simulation: ", totalEntityTime / outputEntities.length);
}

function filterComponentTypes() {
  let inputsConfig = componentsConfig.filter((component) => component.componentType === "input");
  let outputsConfig = componentsConfig.filter((component) => component.componentType === "output");
  let serviceCentersConfig = componentsConfig.filter((component) => component.componentType === "serviceCenter");
  let routersConfig = componentsConfig.filter((component) => component.componentType === "router");
  return { outputsConfig, serviceCentersConfig, routersConfig, inputsConfig };
}

function configureComponents() {
  outputsConfig.forEach((outputConfig) =>(components[outputConfig.identifier] = new Output(outputEntities)));
  serviceCentersConfig.forEach((serviceCenterConfig) =>(components[serviceCenterConfig.identifier] = new ServiceCenter(serviceCenterConfig)));
  routersConfig.forEach((routerConfig) =>(components[routerConfig.identifier] = new UniformRouter(routerConfig))
  );
}

function configureInitialEvents() {
  let inputsEntries: Event[][] = inputsConfig.map((inputConfig) =>new UniformGenerator(inputConfig).generate());
  inputsEntries.forEach((eventList) =>eventList.forEach((event) => globalEventQueue.put(event)));
}

function simulate() {
  while (globalEventQueue.hasEvent()) {
    const currentEvent: Event = globalEventQueue.get();
    lastEventTime = currentEvent.time;

    const generatedEvent: Event = components[currentEvent.component].handleEvent(currentEvent);

    if (generatedEvent) 
      globalEventQueue.put(generatedEvent);
  }
}
