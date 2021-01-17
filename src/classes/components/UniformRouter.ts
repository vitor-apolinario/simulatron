import Component from '../../interfaces/Component';
import Event from '../Event';
import { getRandomInt } from '../../utils/utils';

class UniformRouter implements Component {

  identifier: string;
  componentTicketRanges;
  accumulatedTickets: number = 0;
  entities: number = 0;

  constructor(private configuration: any) {
    this.identifier = this.configuration.identifier;
    this.componentTicketRanges = configuration.routingStats;

    this.generateRoutingRules();
  }

  handleEvent(event: Event): Event | undefined {
    this.entities += 1; 
    const randomTicket = getRandomInt(1, this.accumulatedTickets);
    const nextComponent = this.componentTicketRanges.find(ticket => (randomTicket <= ticket.ticketRange));

    return new Event(nextComponent.identifier, event.time, event.temporaryEntity);
  }

  generateMetrics(lastEventTime: number) {
    console.log('Method not implemented.');
  }

  private generateRoutingRules() {  
    this.componentTicketRanges.map(component => {
      this.accumulatedTickets += component.tickets;
      component.ticketRange = this.accumulatedTickets;
    });
  }
}

export default UniformRouter;