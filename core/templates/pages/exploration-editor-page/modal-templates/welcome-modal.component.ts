// Copyright 2020 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Component for welcome modal.
 */
import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmOrCancelModal } from 'components/common-layout-directives/common-elements/confirm-or-cancel-modal.component';
import { ContextService } from 'services/context.service';
import { SiteAnalyticsService } from 'services/site-analytics.service';
import { UrlInterpolationService } from 'domain/utilities/url-interpolation.service';

@Component({
  selector: 'oppia-welcome-modal',
  templateUrl: './welcome-modal.component.html'
})
export class WelcomeModalComponent
  extends ConfirmOrCancelModal implements OnInit {
  @Input() explorationId: string;
  @Input() editorWelcomeImgUrl: string;

  constructor(
    private ngbActiveModal: NgbActiveModal,
    private contextService: ContextService,
    private siteAnalyticsService: SiteAnalyticsService,
    private urlInterpolationService: UrlInterpolationService,
  ) {
    super(ngbActiveModal);
  }

  ngOnInit(): void {
    this.explorationId = this.contextService.getExplorationId();
    this.siteAnalyticsService.registerTutorialModalOpenEvent(
      this.explorationId);
    this.editorWelcomeImgUrl = this.urlInterpolationService.getStaticImageUrl(
      '/general/editor_welcome.svg');
  }

  cancel(): void {
    this.ngbActiveModal.dismiss();
  }
}
