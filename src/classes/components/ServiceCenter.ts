import Worker from '../Worker';
import SimulatorEvent from '../Event';

import Component from '../../interfaces/Component';
import WorkerQueue from '../WorkerQueue';

class ServiceCenter implements Component {

  identifier: string;
  entityCount: number = 0;
  averageIdleness: number;
  averageWaitTime: number;
  averageAttendanceTime: number;
  maxWaitTime: number = 0;  
  mediumEntitiesWaiting: number;
  workerQueue: WorkerQueue;
  totalWaitingTime: number = 0;
  waiters: number = 0;
  nextComponent: string  = '' ;

  constructor(private configuration: any) {
    this.identifier = configuration.identifier;
    this.nextComponent = this.configuration.nextComponent;

    this.workerQueue = new WorkerQueue(configuration);
  }

  generateMetrics(lastEventTime: number) {
    this.workerQueue.generateMetrics(lastEventTime);

    const totalIdleness = this.workerQueue.workers.reduce((totalIdleness, worker: Worker) => (totalIdleness + worker.idleness), 0);
    const totalAttendanceTime = this.workerQueue.workers.reduce((totalAttendanceTime, worker: Worker) => (totalAttendanceTime + worker.averageAttendanceTime), 0);

    this.averageIdleness = totalIdleness / this.workerQueue.workers.length;
    this.averageWaitTime = this.totalWaitingTime / this.waiters;
    this.averageAttendanceTime = totalAttendanceTime / this.workerQueue.workers.length;
  }

  handleEvent(event: SimulatorEvent) : SimulatorEvent | undefined {
    this.entityCount += 1;

    let worker: Worker = this.workerQueue.get()

    if(worker.localTime > event.time) {
      const timeWaiting = worker.localTime - event.time;
      event.temporaryEntity.waitingTime += timeWaiting;

      if(timeWaiting > this.maxWaitTime)
        this.maxWaitTime = timeWaiting;
        
      this.totalWaitingTime += timeWaiting;
      this.waiters += 1;
    }

    const finalAttendanceTime = worker.doWork(event);

    this.workerQueue.put(worker)
    
    return new SimulatorEvent(this.nextComponent, finalAttendanceTime, event.temporaryEntity);
  }
}

export default ServiceCenter;