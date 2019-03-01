import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from '../../../../common/toastr.service';
import { ProjectsService } from '../../../../services/projects.service';
import { MsconfigService } from '../../../../services/msconfig.service';

@Component({
  selector: 'app-editprojectdata',
  templateUrl: './editprojectdata.component.html',
  styleUrls: ['./editprojectdata.component.css']
})
export class EditprojectdataComponent implements OnInit {
  pid;
  title;
  inputForm: FormGroup;
  userObj: any;
  loading = false;
  camplist: any[];
  project: any;

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private msconfigService: MsconfigService,
    private router: Router,
    private toastr: ToastrService,
    public modalRef: BsModalRef) { }

  campid = new FormControl('', [Validators.required]);
  projectid = new FormControl('', [Validators.required]);
  employerid = new FormControl('', [Validators.required]);
  noofpeople = new FormControl('', [Validators.required, Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')]);
  firstnight = new FormControl('', [Validators.required]);
  lastnight = new FormControl('', [Validators.required]);

  ngOnInit() {

    this.getCampInputList((errorc, resultc) => {
      if (errorc) { this.camplist = [{CampId: '', CampName: errorc}];
      } else { this.camplist = resultc; }
    });

    this.getProjectData(this.pid);

    this.inputForm = this.fb.group({
      campid: this.campid,
      projectid: this.projectid,
      employerid: this.employerid,
      noofpeople: this.noofpeople,
      firstnight: this.firstnight,
      lastnight: this.lastnight,
    });

  }

  getCampInputList(cb) {

    this.msconfigService.getCampList().subscribe(data => {
      if (data.success === true) {
        if (data.data[0]) {
          cb(null, data.data);
        } else {
          cb('No camp found', null);
        }
      } else {
        cb(data.message, null);
      }
    },
    err => {
      cb('Error getting camp list', null);
    });
  }

  getProjectData(id) {
    this.loading = true;
    this.projectsService.getProject(id).subscribe(data => {
      if (data.success === true) {
        if (data.data) {
          this.project = data.data;
          this.populateForm(data.data);
        } else {
          this.toastr.error('Project id is incorrect in the URL');
        }
      } else {
        this.toastr.error(data.message);
      }
      this.loading = false;
    },
    err => {
      this.loading = false;
      this.toastr.error(err);
    });
  }

  populateForm(data): void {
    const fdate = formatUTCStartDate(data.FirstNightDate);
    const ldate = formatUTCEndDate(data.LastNightDate);
    this.inputForm.patchValue({
      campid: data.Camp,
      projectid: data.Project,
      employerid: data.Employer,
      noofpeople: data.NumberOfPeople,
      firstnight: fdate,
      lastnight: ldate,
    });
  }

  updateProject(formdata: any): void {

    formdata.firstnightstr = formatStrDate(formdata.firstnight);
    formdata.lastnightstr = formatStrDate(formdata.lastnight);
    const startdateforsaving = formatUTCStartDate(formdata.firstnight);
    const enddateforsaving = formatUTCEndDate(formdata.lastnight);
    formdata.firstnight = startdateforsaving;
    formdata.lastnight = enddateforsaving;
    // console.log(formdata);
    this.loading = true;
    this.projectsService.updateProject(this.pid, formdata)
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

function formatUTCStartDate(d) {
  const inputdt = new Date(d);
  const dt = inputdt.getDate();
  const mo = inputdt.getMonth();
  const yr = inputdt.getFullYear();
  const dateUTC = new Date(Date.UTC(yr, mo, dt));
  dateUTC.setHours(0);
  return dateUTC;
}

function formatUTCEndDate(d) {
  const inputdt = new Date(d);
  const dt = inputdt.getUTCDate();
  const mo = inputdt.getUTCMonth();
  const yr = inputdt.getUTCFullYear();
  const dateUTC = new Date(Date.UTC(yr, mo, dt));
  dateUTC.setHours(23);
  dateUTC.setMinutes(59);
  dateUTC.setSeconds(59);
  return dateUTC;
}

function formatStrDate(d) {
  const inputdt = new Date(d);
  const dt = (`0${inputdt.getDate()}`).slice(-2);
  const mo = (`0${inputdt.getMonth() + 1}`).slice(-2);
  const yr = inputdt.getFullYear();
  return `${dt}/${mo}/${yr}`;
}
