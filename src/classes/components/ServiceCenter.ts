import Worker from '../Worker';
import SimulatorEvent from '../Event';

import Component from '../../interfaces/Component';
import WorkerQueue from '../WorkerQueue';
import { worker } from 'cluster';

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

  queueChangesCount: number = 0;
  queueChangesSum: number = 0;
  averageQueueSize: number = 0;

  constructor(private configuration: any) {
    this.identifier = configuration.identifier;
    this.nextComponent = this.configuration.nextComponent;

    this.workerQueue = new WorkerQueue(configuration);
  }

  generateMetrics(lastEventTime: number) {

    const workers = this.workerQueue.generateMetrics(lastEventTime);
    
    const totalIdleness = this.workerQueue.workers.reduce((totalIdleness, worker: Worker) => (totalIdleness + worker.idleness), 0);
    const totalAttendanceTime = this.workerQueue.workers.reduce((totalAttendanceTime, worker: Worker) => (totalAttendanceTime + worker.averageAttendanceTime), 0);

    this.averageIdleness = totalIdleness / this.workerQueue.workers.length;
    this.averageWaitTime = this.totalWaitingTime / this.waiters;
    this.averageAttendanceTime = totalAttendanceTime / this.workerQueue.workers.length;
    this.averageQueueSize = this.queueChangesSum / this.queueChangesCount;

    return { 
      identifier: this.identifier,
      averageIdleness: this.averageIdleness, 
      averageWaitTime: this.averageWaitTime, 
      maxWaitTime: this.maxWaitTime, 
      averageAttendanceTime: this.averageAttendanceTime, 
      averageQueueSize: this.averageQueueSize, 
      attendEntities: this.entityCount,
      workers
    }
  }

  handleEvent(event: SimulatorEvent) : SimulatorEvent | undefined {
    this.entityCount += 1;

    let worker: Worker = this.workerQueue.get()

    // verifica espera
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

    if(this.identifier === 'medicalAttendance') event.temporaryEntity.state = 1;
    
    return new SimulatorEvent(this.nextComponent, finalAttendanceTime, event.temporaryEntity);
  }

  handleQueueChange(eventsOnCurrentComponentQueue: number) {
    if(!eventsOnCurrentComponentQueue || eventsOnCurrentComponentQueue < 0)
      throw new Error(`Erro ${this.identifier}.handleQueueChange`);

    this.queueChangesCount += 1;
    this.queueChangesSum += eventsOnCurrentComponentQueue;
  }

  getCurrentTime() {     
    const worker: Worker = this.workerQueue.get();

    this.workerQueue.put(worker);

    return worker.localTime;
  }

}

export default ServiceCenter;