import Worker from './Worker';

class WorkerQueue {
  workers: Worker[] = [];

  constructor(configuration) {

    for (let i = 0; i < configuration.workers ; i++) {
      this.workers.push(new Worker(i + 1, configuration))      
    }
  }

  get() : Worker {
    return this.workers.pop();
  }

  put(worker: Worker) {
    this.workers.push(worker)

    this.sortWorkerByAttendanceTime();
  }

  generateMetrics(lastEventTime: number) {
    this.workers.forEach(worker => worker.generateMetrics(lastEventTime));

    this.sortWorkersById();
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

export default WorkerQueue;
