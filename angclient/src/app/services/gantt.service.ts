import { Injectable } from '@angular/core';
import { Gantask } from '../interfaces/gantask';
import { Ganlink } from '../interfaces/ganlink';

@Injectable({
  providedIn: 'root'
})
export class GanttService {

  constructor() { }

  getTasks(projects: any, type: string): Promise<Gantask[]> {
    const result = [];
    let i = 1;
    let task: Gantask = <Gantask>{};
    projects.forEach( (element) => {
      task = <Gantask>{};
      task.id = i;
      task.text = element.Id;
      task.type = type;
      task.start_date = element.FirstNight;
      task.duration = element.NumberOfNights;
      task.progress = 0.1;
      task.parent = 0;
      task.open = true;
      task.department = element.Department;
      task.camp = element.Camp;
      task.project = element.Project;
      task.employer = element.Employer;
      task.numberofpeople = element.NumberOfPeople;
      task.firstnight = element.FirstNight;
      task.lastnight = element.LastNight;
      task.uid = element._id;
      result.push(task);
      i += 1;
    });
    return Promise.resolve(result);
  }
  getLinks(): Promise<Ganlink[]> {
    return Promise.resolve([
        {id: 1, source: 1, target: 2, type: '0'}
    ]);
  }
}
