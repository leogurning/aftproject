import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from '../../../../common/toastr.service';
import { ProjectsService } from '../../../../services/projects.service';
import { MsconfigService } from '../../../../services/msconfig.service';

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

  @ViewChild('inputdeptRef') inputdeptElementRef: ElementRef;

  constructor(private fb: FormBuilder,
    private projectService: ProjectsService,
    private msconfigService: MsconfigService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private datePipe: DatePipe ) {
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

  }

  ngAfterViewInit() {
    this.refreshDateColumn();
  }

  refreshDateColumn() {
    this.getHzDateTable(this.isfirst, (error, result) => {
      if (error) {
        this.datetable = [{date: '', dateStr: error}];
      } else {
        this.datetable = result;

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
              this.refreshTable(this.isfirst);
            }
          });
        });
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
    let fcastarray = [];
    let message;

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

        this.projects.forEach( (element) => {
          message = `IN: ${element.FirstNight} OUT: ${element.LastNight} -> ${element.NumberOfNights} Nights`;
          fcastarray = this.constructProjectionDate(element.FirstNightDate, element.LastNightDate, message);
          // add new object property in element obj
          element['fcastarray'] = fcastarray;
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
    }, 250);
  }

  checkDateCol(input, startdate, enddate) {
    const inputdate = new Date(input);
    const startdateRange = new Date(startdate);
    const enddateRange = new Date(enddate);
    const result = (inputdate.getTime() >= startdateRange.getTime()) && (inputdate.getTime() <= enddateRange.getTime()) ? true : false;
    return result;
  }

  constructProjectionDate(startdate, enddate, message): any[] {
    let inputdate; let isForecastdate; let lastForecastel;
    const result = []; let resultObjElement;
    let cspan = 0;
    const startdateRange = new Date(startdate);
    const enddateRange = new Date(enddate);

    this.datetable.forEach( (element, idx, arr) => {
      isForecastdate = false;
      inputdate = new Date(element.datetime);
      isForecastdate = (inputdate.getTime() >= startdateRange.getTime()) && (inputdate.getTime() <= enddateRange.getTime()) ? true : false;
      resultObjElement = null;
      if (isForecastdate) {
        cspan += 1;
        lastForecastel = element;
        if (idx === arr.length - 1) {
          if (lastForecastel) {
            resultObjElement = {
              isfcast: true,
              cspan: cspan,
              message: message,
            };
            result.push(resultObjElement);
            lastForecastel = null;
          }
        }
      } else {
        if (lastForecastel) {
          resultObjElement = {
            isfcast: true,
            cspan: cspan,
            message: message,
          };
          result.push(resultObjElement);
          lastForecastel = null;
        }
        resultObjElement = {
          isfcast: false,
          cspan: 0,
          message: '',
        };
        result.push(resultObjElement);
      }
    });
    return result;
  }
}
