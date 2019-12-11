import {AfterViewInit, Component, OnInit} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {LoadingService} from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  isLoading = false;

  constructor(private router: Router,
              private loadingService: LoadingService) {
  }

  ngOnInit() {
    this.loadingService.loadingStart.subscribe(() => this.isLoading = true);
    this.loadingService.loadingEnd.subscribe(() => this.isLoading = false);
  }
}
