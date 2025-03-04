// Copyright 2014 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Directive for the exploration settings tab.
 */

import { Subscription } from 'rxjs';

require(
  'components/common-layout-directives/common-elements/' +
  'confirm-or-cancel-modal.controller.ts');
require(
  'components/forms/custom-forms-directives/select2-dropdown.directive.ts');
require(
  'pages/exploration-editor-page/exploration-title-editor/' +
  'exploration-title-editor.component.ts');
require(
  'pages/exploration-editor-page/exploration-objective-editor/' +
  'exploration-objective-editor.component.ts');
require(
  'pages/exploration-editor-page/param-changes-editor/' +
  'param-changes-editor.component.ts');
require(
  'pages/exploration-editor-page/settings-tab/templates/' +
  'remove-role-confirmation-modal.controller.ts');
require(
  'pages/exploration-editor-page/settings-tab/templates/' +
  'reassign-role-confirmation-modal.controller.ts');
require(
  'pages/exploration-editor-page/settings-tab/templates/' +
  'moderator-unpublish-exploration-modal.controller.ts');
require(
  'pages/exploration-editor-page/settings-tab/templates/' +
  'preview-summary-tile-modal.controller.ts');

require('domain/exploration/editable-exploration-backend-api.service.ts');
require('domain/utilities/url-interpolation.service.ts');
require('pages/exploration-editor-page/services/change-list.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'exploration-automatic-text-to-speech.service.ts');
require(
  'pages/exploration-editor-page/services/exploration-category.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'exploration-correctness-feedback.service.ts');
require('pages/exploration-editor-page/services/exploration-data.service.ts');
require('pages/exploration-editor-page/exploration-editor-page.component.ts');
require(
  'pages/exploration-editor-page/services/' +
  'exploration-init-state-name.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'exploration-language-code.service.ts');
require(
  'pages/exploration-editor-page/services/exploration-objective.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'exploration-param-changes.service.ts');
require(
  'pages/exploration-editor-page/services/exploration-param-specs.service.ts');
require('pages/exploration-editor-page/services/exploration-rights.service.ts');
require('pages/exploration-editor-page/services/exploration-states.service.ts');
require('pages/exploration-editor-page/services/exploration-tags.service.ts');
require('pages/exploration-editor-page/services/exploration-title.service.ts');
require(
  'pages/exploration-editor-page/services/exploration-warnings.service.ts');
require(
  'pages/exploration-editor-page/services/user-email-preferences.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'user-exploration-permissions.service.ts');
require('services/alerts.service.ts');
require('services/editability.service.ts');
require('services/exploration-features.service.ts');
require('services/contextual/window-dimensions.service.ts');
require('services/context.service');
require('pages/exploration-editor-page/services/router.service.ts');
require(
  'pages/exploration-editor-page/services/' +
  'setting-tab-backend-api.service.ts'
);
require(
  'pages/exploration-editor-page/exploration-editor-page.constants.ajs.ts');

angular.module('oppia').component('settingsTab', {
  bindings: {
    currentUserIsCurriculumAdmin: '=',
    currentUserIsModerator: '='
  },
  template: require('./settings-tab.component.html'),
  controller: [
    '$rootScope', '$uibModal', 'AlertsService', 'ChangeListService',
    'ContextService', 'EditabilityService',
    'EditableExplorationBackendApiService',
    'ExplorationAutomaticTextToSpeechService',
    'ExplorationCategoryService', 'ExplorationCorrectnessFeedbackService',
    'ExplorationDataService', 'ExplorationFeaturesService',
    'ExplorationInitStateNameService', 'ExplorationLanguageCodeService',
    'ExplorationObjectiveService', 'ExplorationParamChangesService',
    'ExplorationParamSpecsService', 'ExplorationRightsService',
    'ExplorationStatesService', 'ExplorationTagsService',
    'ExplorationTitleService', 'ExplorationWarningsService',
    'RouterService', 'SettingTabBackendApiService',
    'UserEmailPreferencesService',
    'UserExplorationPermissionsService', 'UserService',
    'WindowDimensionsService', 'WindowRef',
    'ALL_CATEGORIES', 'EXPLORATION_TITLE_INPUT_FOCUS_LABEL', 'TAG_REGEX',
    function(
        $rootScope, $uibModal, AlertsService, ChangeListService,
        ContextService, EditabilityService,
        EditableExplorationBackendApiService,
        ExplorationAutomaticTextToSpeechService,
        ExplorationCategoryService, ExplorationCorrectnessFeedbackService,
        ExplorationDataService, ExplorationFeaturesService,
        ExplorationInitStateNameService, ExplorationLanguageCodeService,
        ExplorationObjectiveService, ExplorationParamChangesService,
        ExplorationParamSpecsService, ExplorationRightsService,
        ExplorationStatesService, ExplorationTagsService,
        ExplorationTitleService, ExplorationWarningsService,
        RouterService, SettingTabBackendApiService,
        UserEmailPreferencesService,
        UserExplorationPermissionsService, UserService,
        WindowDimensionsService, WindowRef,
        ALL_CATEGORIES, EXPLORATION_TITLE_INPUT_FOCUS_LABEL, TAG_REGEX) {
      var ctrl = this;
      var CREATOR_DASHBOARD_PAGE_URL = '/creator-dashboard';
      var EXPLORE_PAGE_PREFIX = '/explore/';

      ctrl.directiveSubscriptions = new Subscription();
      ctrl.explorationIsLinkedToStory = false;

      ctrl.getExplorePageUrl = function() {
        return (
          WindowRef.nativeWindow.location.protocol + '//' +
          WindowRef.nativeWindow.location.host +
          EXPLORE_PAGE_PREFIX + ctrl.explorationId);
      };

      var reassignRole = function(username, newRole, oldRole) {
        AlertsService.clearWarnings();

        $uibModal.open({
          template: require(
            'pages/exploration-editor-page/settings-tab/templates/' +
            'reassign-role-confirmation-modal.directive.html'),
          backdrop: true,
          resolve: {
            username: () => username,
            newRole: () => newRole,
            oldRole: () => oldRole
          },
          controller: 'ReassignRoleConfirmationModalController'
        }).result.then(function() {
          ExplorationRightsService.saveRoleChanges(
            username, newRole);
          ctrl.closeRolesForm();
        }, () => {
          // Note to developers:
          // This callback is triggered when the Cancel button is
          // clicked. No further action is needed.
        });
      };

      ctrl.refreshSettingsTab = function() {
        // Ensure that ExplorationStatesService has been initialized before
        // getting the state names from it. Otherwise, navigating to the
        // settings tab directly (by entering a URL that ends with
        // /settings) results in a console error.

        ctrl.hasPageLoaded = false;
        ExplorationDataService.getDataAsync().then(function() {
          if (ExplorationStatesService.isInitialized()) {
            var categoryIsInSelect2 = ctrl.CATEGORY_LIST_FOR_SELECT2.some(
              function(categoryItem) {
                return (
                  categoryItem.id ===
                      ExplorationCategoryService.savedMemento);
              }
            );
            // If the current category is not in the dropdown, add it
            // as the first option.
            if (!categoryIsInSelect2 &&
                ExplorationCategoryService.savedMemento) {
              ctrl.CATEGORY_LIST_FOR_SELECT2.unshift({
                id: ExplorationCategoryService.savedMemento,
                text: ExplorationCategoryService.savedMemento
              });
            }

            ctrl.stateNames = ExplorationStatesService.getStateNames();
            ctrl.explorationIsLinkedToStory = (
              ContextService.isExplorationLinkedToStory());
          }
          ctrl.hasPageLoaded = true;
          // TODO(#8521): Remove the use of $rootScope.$apply()
          // once the controller is migrated to angular.
          $rootScope.$applyAsync();
        });
        // TODO(#8521): Remove the use of $rootScope.$apply()
        // once the controller is migrated to angular.
        $rootScope.$applyAsync();
      };

      ctrl.saveExplorationTitle = function() {
        ExplorationTitleService.saveDisplayedValue();
        if (!ctrl.isTitlePresent()) {
          ctrl.rolesSaveButtonEnabled = false;
          ctrl.errorMessage = (
            'Please provide a title before inviting.');
          return;
        } else {
          ctrl.rolesSaveButtonEnabled = true;
          ctrl.errorMessage = ('');
          return;
        }
      };

      ctrl.saveExplorationCategory = function() {
        ExplorationCategoryService.saveDisplayedValue();
      };

      ctrl.saveExplorationObjective = function() {
        ExplorationObjectiveService.saveDisplayedValue();
      };

      ctrl.saveExplorationLanguageCode = function() {
        ExplorationLanguageCodeService.saveDisplayedValue();
      };

      ctrl.saveExplorationTags = function() {
        ExplorationTagsService.saveDisplayedValue();
      };

      ctrl.saveExplorationInitStateName = function() {
        var newInitStateName = ExplorationInitStateNameService.displayed;

        if (!ExplorationStatesService.getState(newInitStateName)) {
          AlertsService.addWarning(
            'Invalid initial state name: ' + newInitStateName);
          ExplorationInitStateNameService.restoreFromMemento();
          return;
        }

        ExplorationInitStateNameService.saveDisplayedValue();

        ExplorationStatesService.onRefreshGraph.emit();
      };

      ctrl.postSaveParamChangesHook = function() {
        ExplorationWarningsService.updateWarnings();
      };

      // Methods for enabling advanced features.
      ctrl.areParametersEnabled = function() {
        return ExplorationFeaturesService.areParametersEnabled();
      };

      ctrl.areParametersUsed = function() {
        if (ctrl.hasPageLoaded) {
          return (ExplorationDataService.data.param_changes.length > 0);
        }
      };

      ctrl.enableParameters = function() {
        ExplorationFeaturesService.enableParameters();
      };

      ctrl.isAutomaticTextToSpeechEnabled = function() {
        return ExplorationAutomaticTextToSpeechService
          .isAutomaticTextToSpeechEnabled();
      };
      ctrl.toggleAutomaticTextToSpeech = function() {
        return ExplorationAutomaticTextToSpeechService
          .toggleAutomaticTextToSpeech();
      };

      ctrl.isCorrectnessFeedbackEnabled = function() {
        return ExplorationCorrectnessFeedbackService.isEnabled();
      };
      ctrl.toggleCorrectnessFeedback = function() {
        ExplorationCorrectnessFeedbackService.toggleCorrectnessFeedback();
      };

      // Methods for rights management.
      ctrl.openEditRolesForm = function() {
        ctrl.isRolesFormOpen = true;
        ctrl.newMemberUsername = '';
        ctrl.newMemberRole = ctrl.ROLES[0];
      };

      ctrl.openVoiceoverRolesForm = () => {
        ctrl.isVoiceoverFormOpen = true;
        ctrl.newVoiceArtistUsername = '';
      };

      ctrl.closeEditRolesForm = function() {
        ctrl.newMemberUsername = '';
        ctrl.newMemberRole = ctrl.ROLES[0];
        ctrl.closeRolesForm();
      };

      ctrl.closeVoiceoverForm = () => {
        ctrl.newVoiceArtistUsername = '';
        ctrl.isVoiceoverFormOpen = false;
      };

      ctrl.editRole = function(newMemberUsername, newMemberRole) {
        if (!ExplorationRightsService.checkUserAlreadyHasRoles(
          newMemberUsername)) {
          ExplorationRightsService.saveRoleChanges(
            newMemberUsername, newMemberRole);
          ctrl.closeRolesForm();
          return;
        }
        let oldRole = ExplorationRightsService.getOldRole(
          newMemberUsername);
        reassignRole(newMemberUsername, newMemberRole, oldRole);
      };

      ctrl.removeRole = function(memberUsername, memberRole) {
        AlertsService.clearWarnings();

        $uibModal.open({
          template: require(
            'pages/exploration-editor-page/settings-tab/templates/' +
            'remove-role-confirmation-modal.directive.html'),
          backdrop: true,
          resolve: {
            username: () => memberUsername,
            role: () => memberRole
          },
          controller: 'RemoveRoleConfirmationModalController'
        }).result.then(function() {
          ExplorationRightsService.removeRoleAsync(
            memberUsername);
          ctrl.closeRolesForm();
        }, () => {
          // Note to developers:
          // This callback is triggered when the Cancel button is
          // clicked. No further action is needed.
        });
      };

      ctrl.editVoiseArtist = function(newVoiceArtistUsername) {
        ExplorationRightsService.assignVoiceArtistRoleAsync(
          newVoiceArtistUsername);
        ctrl.closeVoiceoverForm();
        return;
      };

      ctrl.removeVoiceArtist = function(voiceArtistUsername) {
        AlertsService.clearWarnings();

        $uibModal.open({
          template: require(
            'pages/exploration-editor-page/settings-tab/templates/' +
            'remove-role-confirmation-modal.directive.html'),
          backdrop: true,
          resolve: {
            username: () => voiceArtistUsername,
            role: () => 'voice artist'
          },
          controller: 'RemoveRoleConfirmationModalController'
        }).result.then(function() {
          ExplorationRightsService.removeVoiceArtistRoleAsync(
            voiceArtistUsername);
          ctrl.closeVoiceoverForm();
        }, () => {
          // Note to developers:
          // This callback is triggered when the Cancel button is
          // clicked. No further action is needed.
        });
      };

      ctrl.toggleViewabilityIfPrivate = function() {
        ExplorationRightsService.setViewability(
          !ExplorationRightsService.viewableIfPrivate());
      };

      ctrl._successCallback = () => {
        // TODO(#8521): Remove the use of $rootScope.$apply()
        // once the controller is migrated to angular.
        $rootScope.$applyAsync();
      };

      // Methods for muting notifications.
      ctrl.muteFeedbackNotifications = function() {
        UserEmailPreferencesService.setFeedbackNotificationPreferences(
          true, ctrl._successCallback);
      };
      ctrl.muteSuggestionNotifications = function() {
        UserEmailPreferencesService.setSuggestionNotificationPreferences(
          true,
          ctrl._successCallback
        );
      };

      ctrl.unmuteFeedbackNotifications = function() {
        UserEmailPreferencesService.setFeedbackNotificationPreferences(
          false,
          ctrl._successCallback
        );
      };
      ctrl.unmuteSuggestionNotifications = function() {
        UserEmailPreferencesService.setSuggestionNotificationPreferences(
          false, ctrl._successCallback);
      };

      // Methods relating to control buttons.
      ctrl.previewSummaryTile = function() {
        AlertsService.clearWarnings();
        $uibModal.open({
          template: require(
            'pages/exploration-editor-page/settings-tab/templates/' +
            'preview-summary-tile-modal.template.html'),
          backdrop: true,
          controller: 'PreviewSummaryTileModalController'
        }).result.then(function() {}, function() {
          AlertsService.clearWarnings();
        });
      };

      ctrl.showTransferExplorationOwnershipModal = function() {
        AlertsService.clearWarnings();
        $uibModal.open({
          template: require(
            'pages/exploration-editor-page/settings-tab/templates/' +
            'transfer-exploration-ownership-modal.template.html'),
          backdrop: true,
          controller: 'ConfirmOrCancelModalController'
        }).result.then(function() {
          ExplorationRightsService.makeCommunityOwned();
        }, function() {
          AlertsService.clearWarnings();
        });
      };

      ctrl.deleteExploration = function() {
        AlertsService.clearWarnings();

        $uibModal.open({
          template: require(
            'pages/exploration-editor-page/settings-tab/templates/' +
            'delete-exploration-modal.template.html'),
          backdrop: true,
          controller: 'ConfirmOrCancelModalController'
        }).result.then(function() {
          EditableExplorationBackendApiService.deleteExplorationAsync(
            ctrl.explorationId).then(function() {
            WindowRef.nativeWindow.location = CREATOR_DASHBOARD_PAGE_URL;
          });
        }, function() {
          AlertsService.clearWarnings();
        });
      };

      ctrl.unpublishExplorationAsModerator = function() {
        AlertsService.clearWarnings();

        var moderatorEmailDraftUrl = '/moderatorhandler/email_draft';

        SettingTabBackendApiService
          .getData(moderatorEmailDraftUrl).then(function(response) {
            // If the draft email body is empty, email functionality will not
            // be exposed to the mdoerator.
            var draftEmailBody = response.draft_email_body;

            $uibModal.open({
              template: require(
                'pages/exploration-editor-page/settings-tab/templates/' +
                'moderator-unpublish-exploration-modal.template.html'),
              backdrop: true,
              resolve: {
                draftEmailBody: () => draftEmailBody
              },
              controller: 'ModeratorUnpublishExplorationModalController'
            }).result.then(function(emailBody) {
              ExplorationRightsService.saveModeratorChangeToBackendAsync(
                emailBody).then(function() {
                UserExplorationPermissionsService.fetchPermissionsAsync()
                  .then(function(permissions) {
                    ctrl.canUnpublish = permissions.canUnpublish;
                    ctrl.canReleaseOwnership = permissions.canReleaseOwnership;
                    // TODO(#8521): Remove the use of $rootScope.$apply()
                    // once the controller is migrated to angular.
                    $rootScope.$applyAsync();
                  });
              });
            }, function() {
              AlertsService.clearWarnings();
            });
          });
      };

      ctrl.isExplorationLockedForEditing = function() {
        return ChangeListService.isExplorationLockedForEditing();
      };

      ctrl.closeRolesForm = function() {
        ctrl.errorMessage = '';
        ctrl.rolesSaveButtonEnabled = true;
        ctrl.isRolesFormOpen = false;
      };

      ctrl.isTitlePresent = function() {
        return ExplorationTitleService.savedMemento.length > 0;
      };

      ctrl.onRolesFormUsernameBlur = function() {
        ctrl.rolesSaveButtonEnabled = true;
        ctrl.errorMessage = '';

        if (ctrl.newMemberUsername === ctrl.loggedInUser) {
          ctrl.rolesSaveButtonEnabled = false;
          ctrl.errorMessage = (
            'Users are not allowed to assign other roles to themselves.');
          return;
        }
        if (ExplorationRightsService.checkUserAlreadyHasRoles(
          ctrl.newMemberUsername)) {
          var oldRole = ExplorationRightsService.getOldRole(
            ctrl.newMemberUsername);
          if (oldRole === ctrl.newMemberRole.value) {
            ctrl.rolesSaveButtonEnabled = false;
            ctrl.errorMessage = `User is already ${oldRole}.`;
            return;
          }
        }
      };

      ctrl.toggleCards = function(card) {
        if (!WindowDimensionsService.isWindowNarrow()) {
          return;
        }
        if (card === 'settings') {
          ctrl.basicSettingIsShown = !ctrl.basicSettingIsShown;
        } else if (card === 'advanced_features') {
          ctrl.advancedFeaturesIsShown = !ctrl.advancedFeaturesIsShown;
        } else if (card === 'roles') {
          ctrl.rolesCardIsShown = !ctrl.rolesCardIsShown;
        } else if (card === 'permissions') {
          ctrl.permissionsCardIsShown = !ctrl.permissionsCardIsShown;
        } else if (card === 'feedback') {
          ctrl.feedbackCardIsShown = !ctrl.feedbackCardIsShown;
        } else if (card === 'controls') {
          ctrl.controlsCardIsShown = !ctrl.controlsCardIsShown;
        }
      };

      ctrl.$onInit = function() {
        ctrl.directiveSubscriptions.add(
          RouterService.onRefreshSettingsTab.subscribe(
            () => {
              ctrl.refreshSettingsTab();
            }
          )
        );
        ctrl.directiveSubscriptions.add(
          UserExplorationPermissionsService.onUserExplorationPermissionsFetched
            .subscribe(
              () => {
                UserExplorationPermissionsService.getPermissionsAsync()
                  .then(function(permissions) {
                    ctrl.canUnpublish = permissions.canUnpublish;
                    ctrl.canReleaseOwnership = permissions.canReleaseOwnership;
                    // TODO(#8521): Remove the use of $rootScope.$apply()
                    // once the controller is migrated to angular.
                    $rootScope.$applyAsync();
                  });
              }
            )
        );
        ctrl.EXPLORATION_TITLE_INPUT_FOCUS_LABEL = (
          EXPLORATION_TITLE_INPUT_FOCUS_LABEL);
        ctrl.EditabilityService = EditabilityService;
        ctrl.CATEGORY_LIST_FOR_SELECT2 = [];
        for (var i = 0; i < ALL_CATEGORIES.length; i++) {
          ctrl.CATEGORY_LIST_FOR_SELECT2.push({
            id: ALL_CATEGORIES[i],
            text: ALL_CATEGORIES[i]
          });
        }
        ctrl.isRolesFormOpen = false;
        ctrl.isVoiceoverFormOpen = false;
        ctrl.rolesSaveButtonEnabled = false;
        ctrl.errorMessage = '';
        ctrl.basicSettingIsShown = !WindowDimensionsService.isWindowNarrow();
        ctrl.advancedFeaturesIsShown = (
          !WindowDimensionsService.isWindowNarrow());
        ctrl.rolesCardIsShown = !WindowDimensionsService.isWindowNarrow();
        ctrl.permissionsCardIsShown = !WindowDimensionsService.isWindowNarrow();
        ctrl.feedbackCardIsShown = !WindowDimensionsService.isWindowNarrow();
        ctrl.controlsCardIsShown = !WindowDimensionsService.isWindowNarrow();

        ctrl.TAG_REGEX = TAG_REGEX;
        ctrl.canDelete = false;
        ctrl.canModifyRoles = false;
        ctrl.canReleaseOwnership = false;
        ctrl.canUnpublish = false;
        ctrl.canManageVoiceArtist = false;
        ctrl.explorationId = ExplorationDataService.explorationId;
        ctrl.loggedInUser = null;
        UserService.getUserInfoAsync().then(function(userInfo) {
          ctrl.loggedInUser = userInfo.getUsername();
        });

        UserExplorationPermissionsService.getPermissionsAsync()
          .then(function(permissions) {
            ctrl.canDelete = permissions.canDelete;
            ctrl.canModifyRoles = permissions.canModifyRoles;
            ctrl.canReleaseOwnership = permissions.canReleaseOwnership;
            ctrl.canUnpublish = permissions.canUnpublish;
            ctrl.canManageVoiceArtist = permissions.canManageVoiceArtist;
          });

        ctrl.explorationTitleService = ExplorationTitleService;
        ctrl.explorationCategoryService = ExplorationCategoryService;
        ctrl.explorationObjectiveService = ExplorationObjectiveService;
        ctrl.explorationLanguageCodeService = (
          ExplorationLanguageCodeService);
        ctrl.explorationTagsService = ExplorationTagsService;
        ctrl.ExplorationRightsService = ExplorationRightsService;
        ctrl.explorationInitStateNameService = (
          ExplorationInitStateNameService);
        ctrl.explorationParamSpecsService = ExplorationParamSpecsService;
        ctrl.explorationParamChangesService = (
          ExplorationParamChangesService);
        ctrl.UserEmailPreferencesService = UserEmailPreferencesService;

        ctrl.refreshSettingsTab();

        ctrl.ROLES = [{
          name: 'Manager (can edit permissions)',
          value: 'owner'
        }, {
          name: 'Collaborator (can make changes)',
          value: 'editor'
        }, {
          name: 'Playtester (can give feedback)',
          value: 'viewer'
        }];

        ctrl.formStyle = JSON.stringify({
          display: 'table-cell',
          width: '16.66666667%',
          'vertical-align': 'top'
        });
      };
      ctrl.$onDestroy = function() {
        ctrl.directiveSubscriptions.unsubscribe();
      };
    }
  ]
});
