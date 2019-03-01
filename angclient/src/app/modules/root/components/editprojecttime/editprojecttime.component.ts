import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from '../../../../common/toastr.service';
import { ProjectsService } from '../../../../services/projects.service';

@Component({
  selector: 'app-editprojecttime',
  templateUrl: './editprojecttime.component.html',
  styleUrls: ['./editprojecttime.component.css']
})
export class EditprojecttimeComponent implements OnInit {
  objid;
  data;
  result;
  loading = false;
  constructor(
    private projectsService: ProjectsService,
    private toastr: ToastrService,
    public modalRef: BsModalRef) { }

  /* data: { projectid: projectid,
    startdate: startdate,
    duration: duration
  } */

  ngOnInit() {
  }

  confirm(): void {
    const enddate = addDays(this.data.startdate, (this.data.duration - 1));
    const strstdate = formatStrDate(this.data.startdate);
    const strendate = formatStrDate(enddate);
    const payload: any = {};
    payload.firstnightstr = strstdate;
    payload.lastnightstr = strendate;
    this.updateProject(payload);
    // alert(`Updated. Start date: ${strstdate} and End date: ${strendate}`);
  }

  decline(): void {
    this.modalRef.hide();
  }

  updateProject(formdata: any): void {

    this.loading = true;
    this.projectsService.updateProjecttime(this.objid, formdata)
      .subscribe(data => {
        this.loading = false;
        if (data.success === false) {
          this.toastr.error(data.message);
        } else {
          this.toastr.success(data.message);
        }
        this.modalRef.hide();
    },
    err => {
      this.loading = false;
      this.toastr.error(err);
    });

  }
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatStrDate(d) {
  const inputdt = new Date(d);
  const dt = (`0${inputdt.getDate()}`).slice(-2);
  const mo = (`0${inputdt.getMonth() + 1}`).slice(-2);
  const yr = inputdt.getFullYear();
  return `${yr}-${mo}-${dt}`;
}
