import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from '../../../../common/toastr.service';
import { ProjectsService } from '../../../../services/projects.service';
import { MsconfigService } from '../../../../services/msconfig.service';
import { GanttService } from '../../../../services/gantt.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { Subscription } from 'rxjs';
import { EditprojectdataComponent } from '../editprojectdata/editprojectdata.component';
import { EditprojecttimeComponent } from '../editprojecttime/editprojecttime.component';
import 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/ext/dhtmlxgantt_tooltip';
import { setDate } from 'ngx-bootstrap/chronos/utils/date-setters';
import { getDate } from 'ngx-bootstrap/chronos/utils/date-getters';
declare let gantt: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  totalpage: number;
  qpage: string;
  qdeptid: string;
  qcampid: string;
  qsort: string;
  pgCounter: number;
  totalrows: number;
  projects: any;
  searchForm: FormGroup;
  loading = false;
  deptlist: any[];
  camplist: any[];
  datelist: any[];
  datetable: any[];
  currDate: string;
  scrolldate: string;
  timeout = null;
  isscrolling = false;
  scrollinfodate: string;
  isfirst = true;
  subscriptions: Subscription[] = [];
  modalRef: BsModalRef;
  events = [];
  eventid: any;
  @ViewChild('inputdeptRef') inputdeptElementRef: ElementRef;
  @ViewChild('gantt_here') ganttContainer: ElementRef;

  constructor(private fb: FormBuilder,
    private projectService: ProjectsService,
    private msconfigService: MsconfigService,
    private ganttService: GanttService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private modalService: BsModalService ) {
      this.currDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
    }

  deptid = new FormControl('', [Validators.nullValidator]);
  campid = new FormControl('', [Validators.nullValidator]);

  ngOnInit() {

    this.deptlist = [];
    this.camplist = [];

    this.searchForm = this.fb.group({
      deptid: this.deptid,
      campid: this.campid
    });

    this.getHzDateList((error, result) => {
      if (error) {
        this.datelist = [{date: '', dateStr: error}];
      } else {
        this.datelist = result;
      }
    });

    // Initialize gantt configurations
    this.ganttInitialization();

    this.route.queryParams.forEach((params: Params) => {
      this.qdeptid = params['deptid'] || '';
      this.qcampid = params['campid'] || '';
      this.qpage = params['page'] || '1';
      this.qsort = params['sortby'] || '';
      this.getDeptInputList((errord, resultd) => {
        if (errord) {
          this.deptlist = [{DeptId: '', DeptName: errord}];
          this.camplist = [{CampId: '', CampName: errord}];
        } else {
          this.deptlist = resultd;
          this.getCampInputList((errorc, resultc) => {
            if (errorc) { this.camplist = [{CampId: '', CampName: errorc}];
            } else { this.camplist = resultc; }
          });
          this.getHzDateTable(this.isfirst, (error, result) => {
            if (error) {
              this.datetable = [{date: '', dateStr: error}];
            } else {
              this.datetable = result;
              const len = this.datetable.length;
              this.setGanttDateInterval(this.datetable[0].date, this.datetable[len - 1].date);
              this.refreshTable(this.isfirst);
            }
          });
        }
      });
      this.searchForm.patchValue({
        deptid: this.qdeptid,
        campid: this.qcampid,
      });
    });

  }

  ngAfterViewInit() {
    this.inputdeptElementRef.nativeElement.focus();
  }

  ganttInitialization(): void {
    gantt.config.xml_date = '%d/%m/%Y';
    gantt.config.columns = [
      {name: 'id', align: 'left', label: '#', min_width: 20, width: 30, resize: true},
      {name: 'department', label: 'Department', align: 'center', min_width: 50, width: 100, resize: true},
      {name: 'camp', label: 'Camp', align: 'center', min_width: 50, width: 100, resize: true},
      {name: 'project', label: 'Project', align: 'center', min_width: 50, width: 100, resize: true},
      {name: 'numberofpeople', label: 'No. Of People', align: 'right', min_width: 50, width: 60, resize: true},
    ];

    gantt.config.scale_unit = 'day';
    gantt.config.step = 1;
    gantt.config.date_scale = '%D, %d';
    gantt.config.subscales = [{ unit: 'month', step: 1, date: '%M, %Y'	}];

    gantt.config.layout = {
      css: 'gantt_container',
      cols: [
        {
          width: 400,
          min_width: 300,
          rows: [
            {view: 'grid', scrollX: 'gridScroll', scrollable: true, scrollY: 'scrollVer'},
            {view: 'scrollbar', id: 'gridScroll', group: 'horizontal'}
          ]
        },
        {resizer: true, width: 1},
        {
          rows: [
            {view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer'},
            {view: 'scrollbar', id: 'scrollHor', group: 'horizontal'}
          ]
        },
        {view: 'scrollbar', id: 'scrollVer'}
      ]
    };
  }

  setGanttDateInterval(start, end): void {
    gantt.config.start_date = new Date(start);
    gantt.config.end_date = new Date(end);
    gantt.templates.scale_cell_class = function(date) {
      const pdate = new Date(date);
      if (pdate.getDay() === 0 || pdate.getDay() === 6) {
        return 'weekend';
      }
    };
    gantt.templates.task_cell_class = function(item, date) {
      const pdate = new Date(date);
      if (pdate.getDay() === 0 || pdate.getDay() === 6) {
        return 'weekend';
      }
    };
    gantt.config.tooltip_hide_timeout = 2000;
    // tslint:disable-next-line: no-shadowed-variable
    gantt.templates.tooltip_text = (start, end, task: { project: string; }) => {
      const result = new Date(end);
      result.setDate(result.getDate() - 1);
      // tslint:disable-next-line: max-line-length
      return '<b>Task:</b> ' + task.project + '<br/><b>Start:</b> ' + this.msconfigService.formatStrDate(start) + '<br/><b>End:</b> ' + this.msconfigService.formatStrDate(result);
    };
    gantt.init(this.ganttContainer.nativeElement);
      // defines the text inside the tak bars
    gantt.templates.task_text = (_start, _end, task) => {
        return `IN: ${task.firstnight} OUT: ${task.lastnight} --> ${task.duration} Nights`;
    };

    // detach all saved events
    while (this.events.length) {
      gantt.detachEvent(this.events.pop());
    }

    this.events.push(gantt.attachEvent('onTaskDblClick', (id, e) => {
      if (id !== null) {
        const dbid = gantt.getTask(id).uid;
        this.goToEdit(dbid);
      }
    }));

    this.events.push(gantt.attachEvent('onAfterTaskDrag', (id, mode, e) => {
      if (mode === 'move' || mode === 'resize') {
        const nwdate = gantt.getTask(id).start_date;
        const objid = gantt.getTask(id).uid;
        const projectid = gantt.getTask(id).project;
        const duration = gantt.getTask(id).duration;
        this.confirmUpdateTime(objid, projectid, nwdate, duration);
      }
    }));

  }

  refreshDateColumn() {
    this.getHzDateTable(this.isfirst, (error, result) => {
      if (error) {
        this.datetable = [{date: '', dateStr: error}];
      } else {
        this.datetable = result;
        const len = this.datetable.length;
        this.setGanttDateInterval(this.datetable[0].date, this.datetable[len - 1].date);
        this.refreshTable(this.isfirst);
      }
    });
  }

  getDeptInputList(cb) {

    this.msconfigService.getDeptList().subscribe(data => {
      if (data.success === true) {
        if (data.data[0]) {
          cb(null, data.data);
        } else {
          cb('No dept found', null);
        }
      } else {
        cb(data.message, null);
      }
    },
    err => {
      cb('Error getting dept list', null);
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

  getHzDateList(cb) {
    const payload: any = {};
    payload.startdate = '2019-01-01';
    payload.enddate = '2021-12-31';
    this.msconfigService.getDateList(payload).subscribe(data => {
      if (data.success === true) {
        if (data.data[0]) {
          cb(null, data.data);
        } else {
          cb('No date found', null);
        }
      } else {
        cb('Error date list', null);
      }
    },
    err => {
      cb('Error getting date list', null);
    });
  }

  getHzDateTable(isinit, cb) {
    const payload: any = {};
    if (isinit) {
      payload.startdate = this.currDate;
    } else {
      payload.startdate = this.scrolldate;
    }

    payload.days = 9;
    this.msconfigService.getDateTable(payload).subscribe(data => {
      if (data.success === true) {
        if (data.data[0]) {
          cb(null, data.data);
        } else {
          cb('No date found', null);
        }
      } else {
        cb('Error date table', null);
      }
    },
    err => {
      cb('Error getting date table', null);
    });
  }

  inputChangeEvent(): void {
    this.getReport(this.searchForm.value);
  }

  getReport(formdata: any): void {
    if (this.searchForm.valid) {
        this.router.navigate(['/home'],
        {
          queryParams: {
            deptid: formdata.deptid,
            campid: formdata.campid,
            page: 1,
            sortby: null }
        }
      );
    }
  }

  fetchReport(formval, isinit) {

    this.loading = true;
    if (isinit) {
      formval.startdate = this.currDate;
    } else {
      formval.startdate = this.scrolldate;
    }

    formval.days = 9;
    this.projectService.getProjectAggList(formval)
    .subscribe(data => {
      if (data.success === false) {
        this.loading = false;
        if (data.errcode) {
          this.router.navigate(['/errorpage']);
        }
        this.toastr.error(data.message);
      } else {
        this.loading = false;
        this.projects = data.data;
        this.totalrows = +data.totalcount;
        this.totalpage = data.npage;
        this.pgCounter = Math.floor((this.totalrows + 500 - 1) / 500);
        // set the Gantt chart data
        Promise.all([this.ganttService.getTasks(this.projects, gantt.config.types.project)])
        .then(([dataTask]) => {
          gantt.clearAll();
          gantt.parse({data: dataTask});
        });
      }
    },
    err => {
      this.loading = false;
      this.toastr.error(err);
    });
  }

  refreshTable(isinit): void {
    const payload: any = {};
    if (this.qdeptid === '') {
      this.searchForm.get('deptid').setValue(this.deptlist[0].DeptId);
      payload.deptid = this.deptlist[0].DeptId;
    } else {
      payload.deptid = this.qdeptid;
    }
    payload.campid = this.qcampid;
    payload.page = this.qpage;
    payload.sortby = this.qsort;
    this.fetchReport(payload, isinit);
  }

  setPage(page): void {

    this.router.navigate(['/home'],
      {
        queryParams: {
          deptid: this.qdeptid,
          campid: this.qcampid,
          page: page,
          sortby: this.qsort }
      }
    );
  }

  prevPage(): void {
    const currpage = parseInt(this.qpage, 10) - 1;
    this.setPage(currpage);
  }

  nextPage(): void {
    const currpage = parseInt(this.qpage, 10) + 1;
    this.setPage(currpage);
  }

  createPager(number) {
    const items: number[] = [];
    for (let i = 1; i <= number; i++) {
      items.push(i);
    }
    return items;
  }

  sortProjects(sortby): void {
    if (this.qsort === '') {
      this.qsort = sortby;
    } else if (this.qsort.indexOf('-') > -1 ) {
      this.qsort = sortby;
    } else {
      this.qsort = '-' + sortby;
    }

    this.setPage(this.qpage || '1');
  }

  onScroll(event: Event) {
    this.isscrolling = true;
    // total div width minus 700px to adjust with scroll left position px
    const swidth1 = (event.target as HTMLElement).scrollWidth - 900;
    // this is total item of dates list
    const totalItem = (event.target as HTMLElement).getElementsByClassName('content').item(0).getElementsByTagName('span').length;
    const offset = swidth1 / totalItem;
    const sleft = (event.target as HTMLElement).scrollLeft;
    const idx = Math.ceil(sleft / offset);
    let selDate: any; let scrDate: any;
    if (idx <= totalItem) {
      selDate = this.datelist[idx].dateStr;
      scrDate = this.datelist[idx].date;
    } else {
      selDate = this.datelist[totalItem - 1].dateStr;
      scrDate = this.datelist[totalItem - 1].date;
    }
    this.scrollinfodate = selDate;
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      // do something
      this.isscrolling = false;
      this.isfirst = false;
      this.scrolldate = scrDate;
      // console.log(`idx: ${idx} out of ${totalItem}. Selected date: ${selDate}`);
      this.refreshDateColumn();
    }, 1000);
  }

  checkDateCol(input, startdate, enddate) {
    const inputdate = new Date(input);
    const startdateRange = new Date(startdate);
    const enddateRange = new Date(enddate);
    const result = (inputdate.getTime() >= startdateRange.getTime()) && (inputdate.getTime() <= enddateRange.getTime()) ? true : false;
    return result;
  }

  goToEdit(id): void {
    // alert('edit this data: ' + id);
    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        // refresh table
        this.refreshTable(this.isfirst);
        this.unsubscribe();
      })
    );

    this.modalRef = this.modalService.show(EditprojectdataComponent, {
      // class: 'modal-dialog-centered',
      keyboard: false,
      backdrop: 'static',
      initialState: {
        title: 'Edit Project',
        pid: id,
        data: {}
      }
    });
  }

  confirmUpdateTime(objid, projectid, startdate, duration): void {
    this.subscriptions.push(
      this.modalService.onHide.subscribe((reason: string) => {
        // refresh table
        this.refreshTable(this.isfirst);
        this.unsubscribe();
      })
    );

    this.modalRef = this.modalService.show(EditprojecttimeComponent, {
      class: 'modal-dialog-centered',
      keyboard: false,
      backdrop: 'static',
      initialState: {
        objid: objid,
        data: { projectid: projectid,
          startdate: startdate,
          duration: duration
        }
      }
    });
  }

  unsubscribe() {
    this.subscriptions.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
  }
}
