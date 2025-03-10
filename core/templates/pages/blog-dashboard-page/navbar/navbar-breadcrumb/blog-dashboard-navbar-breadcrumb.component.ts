// Copyright 2021 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Component for the navbar breadcrumb of the blog dashboard.
 */

import { Component, OnDestroy, OnInit } from '@angular/core';
import { downgradeComponent } from '@angular/upgrade/static';
import { Subscription } from 'rxjs';
import { BlogDashboardPageService } from 'pages/blog-dashboard-page/services/blog-dashboard-page.service';

@Component({
  selector: 'oppia-blog-dashboard-navbar-breadcrumb',
  templateUrl: './blog-dashboard-navbar-breadcrumb.component.html'
})
export class BlogDashboardNavbarBreadcrumbComponent
implements OnInit, OnDestroy {
  activeTab: string;
  title: string;
  directiveSubscriptions = new Subscription();
  constructor(
    private blogDashboardPageService: BlogDashboardPageService,
  ) {}
  ngOnInit(): void {
    this.activeTab = this.blogDashboardPageService.activeTab;
    this.directiveSubscriptions.add(
      this.blogDashboardPageService.updateViewEventEmitter.subscribe(
        () => {
          this.activeTab = this.blogDashboardPageService.activeTab;
        }
      )
    );

    this.directiveSubscriptions.add(
      this.blogDashboardPageService.updateNavTitleEventEmitter.subscribe(
        (title) => {
          this.title = title;
        }
      )
    );
  }

  ngOnDestroy(): void {
    return this.directiveSubscriptions.unsubscribe();
  }
}

angular.module('oppia').directive('oppiaBlogDashboardNavbarBreadcrumb',
  downgradeComponent({
    component: BlogDashboardNavbarBreadcrumbComponent
  }));
