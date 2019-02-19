import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
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
export class HomeComponent implements OnInit {
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
  @ViewChild('inputdeptRef') inputdeptElementRef: ElementRef;

  constructor(private fb: FormBuilder,
    private projectService: ProjectsService,
    private msconfigService: MsconfigService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService ) { }

  deptid = new FormControl('', [Validators.nullValidator]);
  campid = new FormControl('', [Validators.nullValidator]);

  ngOnInit() {

    this.deptlist = [];
    this.camplist = [];

    this.searchForm = this.fb.group({
      deptid: this.deptid,
      campid: this.campid
    });

    this.route.queryParams.forEach((params: Params) => {
      this.qdeptid = params['deptid'] || '';
      this.qcampid = params['campid'] || '';
      this.qpage = params['page'] || '1';
      this.qsort = params['sortby'] || '';

      this.getDeptInputList((error, result) => {
        if (error) {
          this.deptlist = [{DeptId: '', DeptName: error}];
          this.camplist = [{CampId: '', CampName: error}];
        } else {
          this.deptlist = result;
          this.getCampInputList((errorc, resultc) => {
            if (errorc) { this.camplist = [{CampId: '', CampName: errorc}];
            } else { this.camplist = resultc; }
          });

          this.refreshTable();
        }
      });
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

  fetchReport(formval) {
    this.loading = true;
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
      }
    },
    err => {
      this.loading = false;
      this.toastr.error(err);
    });
  }

  refreshTable(): void {
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
    this.fetchReport(payload);
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
}
