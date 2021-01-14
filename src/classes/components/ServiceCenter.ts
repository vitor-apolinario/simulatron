import Worker from '../Worker';
import SimulatorEvent from '../Event';

import Component from '../../interfaces/Component';

import { getRandomInt } from '../../utils/utils';

class ServiceCenter implements Component {

  identifier: string;
  entityCount: number = 0;
  averageIdleness: number;
  averageWaitTime: number;
  averageAttendanceTime: number;
  maxWaitTime: number = 0;  
  mediumEntitiesWaiting: number;
  workers: Worker[] = [];
  totalWaitingTime: number = 0;
  waiters: number = 0;

  constructor(private configuration: any) {
    this.identifier = configuration.identifier;

    for (let i = 0; i < configuration.workers; i++) {
      this.workers.push(new Worker(`worker_${this.identifier}_${i}`, configuration));
    }
  }
  generateMetrics(lastEventTime: number) {
    this.workers.forEach(worker => worker.generateMetrics(lastEventTime));

    const totalIdleness = this.workers.reduce((totalIdleness, worker: Worker) => (totalIdleness + worker.idleness), 0);
    const totalAttendanceTime = this.workers.reduce((totalAttendanceTime, worker: Worker) => (totalAttendanceTime + worker.averageAttendanceTime), 0);

    this.averageIdleness = totalIdleness / this.workers.length;

    this.averageWaitTime = this.totalWaitingTime / this.waiters;

    this.averageAttendanceTime = totalAttendanceTime / this.workers.length;

    this.sortWorkersById();
  }

  handleEvent(event: SimulatorEvent) : SimulatorEvent | undefined {

    this.entityCount += 1;

    let worker: Worker = this.workers[this.workers.length -1];

    if(worker.localTime > event.time) {
      const timeWaiting = worker.localTime - event.time;

      event.temporaryEntity.waitingTime += timeWaiting;

      if(timeWaiting > this.maxWaitTime)
        this.maxWaitTime = timeWaiting;

      this.totalWaitingTime += timeWaiting;
      this.waiters += 1;
    }

    const finalAttendanceTime = worker.doWork(event);

    this.sortWorkerByAttendanceTime();
    
    const nextComponentsList = this.configuration.nextComponent;
    const nextComponent = nextComponentsList[getRandomInt(0, nextComponentsList.length -1)];

    if(!nextComponent)
      return undefined;

    return new SimulatorEvent(nextComponent, finalAttendanceTime, event.temporaryEntity);
  }

  private sortWorkerByAttendanceTime() {
    this.workers.sort((w1, w2) => (w2.attendanceTime - w1.attendanceTime));
  }

  private sortWorkersById() {
    this.workers.sort((a, b) => {
      if (a.id < b.id) {
        return -1;
      }
      if (a.id > b.id) {
        return 1;
      }
      return 0;
    });
  }
}

export default ServiceCenter;