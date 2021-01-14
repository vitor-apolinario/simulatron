import SimulatorEvent from '../classes/Event';

interface Component {
  handleEvent(event: SimulatorEvent) : SimulatorEvent | undefined;
  generateMetrics(lastEventTime: number);
}

export default Component;