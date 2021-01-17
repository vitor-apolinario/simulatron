import SimulatorEvent from './Event';

import { getRandomInt } from '../utils/utils';

class Worker {
  
  id: string;
  minTime: number;
  maxTime: number;

  localTime: number = 0;
  idleness: number = 0;
  attendanceTime: number = 0;
  averageAttendanceTime: number = 0;

  constructor(id: number, { identifier, minTime, maxTime }) {
    this.id = `worker_${identifier}_${id}`;
    this.minTime = minTime;
    this.maxTime = maxTime;
  }

  doWork(event: SimulatorEvent) {

    if(event.time > this.localTime) {
      this.localTime = event.time;
      this.idleness += event.time - this.localTime;
    }

    let workTime = getRandomInt(this.minTime, this.maxTime);

    event.temporaryEntity.timeInAttendance += workTime;

    this.averageAttendanceTime = this.averageAttendanceTime ? (this.averageAttendanceTime + workTime) / 2 : workTime;

    this.localTime += workTime;
    this.attendanceTime += workTime;

    return this.localTime;
  }

  generateMetrics(lastEventTime: number) {
    this.idleness += lastEventTime - this.attendanceTime;
  }
}

export default Worker;

