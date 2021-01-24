class TemporaryEntity {
  id: string;
  waitingTime: number = 0;
  timeInAttendance: number = 0;
  state: number = 0;

  constructor(id: string) {
    this.id = id;
  }
}

export default TemporaryEntity;