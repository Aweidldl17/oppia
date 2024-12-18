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
 * @fileoverview Validator service for the interaction.
 */

import {downgradeInjectable} from '@angular/upgrade/static';
import {Injectable} from '@angular/core';

import {AnswerGroup} from 'domain/exploration/AnswerGroupObjectFactory';
import {
  Warning,
  baseInteractionValidationService,
} from 'interactions/base-interaction-validation.service';
import {MusicNotesInputCustomizationArgs} from 'extensions/interactions/customization-args-defs';
import {Outcome} from 'domain/exploration/OutcomeObjectFactory';
import {AppConstants} from 'app.constants';

@Injectable({
  providedIn: 'root',
})
export class MusicNotesInputValidationService {
  constructor(
    private baseInteractionValidationServiceInstance: baseInteractionValidationService
  ) {}

  getCustomizationArgsWarnings(
    customizationArgs: MusicNotesInputCustomizationArgs
  ): Warning[] {
    var warningsList: Warning[] = [];     

    this.baseInteractionValidationServiceInstance.requireCustomizationArguments(
      customizationArgs,
      ['sequenceToGuess']
    )

    // Check if no note is provided.
    if (!customizationArgs.sequenceToGuess || customizationArgs.sequenceToGuess.value.length === 0) {
      warningsList.push({
        type: 'ERROR',
        message: 'No notes provided. Please input at least one note.',
      });
    }
  
    // Checks note value.
    const validNotes = ['A4', 'B4', 'C4', 'D4', 'E4', 'F4', 'G4', 'A5', 'B5','C5', 'D5', 'E5', 'F5','G5'];
    if (customizationArgs.sequenceToGuess && customizationArgs.sequenceToGuess.value) {
      customizationArgs.sequenceToGuess.value.forEach(note => {

        console.log("Current note : " + note.readableNoteName);  
        console.log("Notes (shoudln't work): " + customizationArgs.sequenceToGuess );
        console.log("Current note (full content): " + JSON.stringify(note, null, 2));

        if (!validNotes.includes(note.readableNoteName)) {
          warningsList.push({
            type: 'ERROR',
            message: 'Invalid note value:'  +  note.readableNoteName + '.Notes must be within the allowed musical range.',
          });
        }
      });
    }

    // Checks if the total amount of notes exceed the maximum allowed.
    if ( customizationArgs.sequenceToGuess && customizationArgs.sequenceToGuess.value.length > 8 ) {
      warningsList.push({
        type: 'ERROR',
        message: 'Number of notes can not exceed the allowed limit of 8.',
      });
    }
  
    return warningsList;
  }

  getAllWarnings(
    stateName: string,
    customizationArgs: MusicNotesInputCustomizationArgs,
    answerGroups: AnswerGroup[],
    defaultOutcome: Outcome
  ): Warning[] {
    var partialWarningsList: Warning[] = [];

    for (
      var ansGroupIdx = 0;
      ansGroupIdx < answerGroups.length;
      ansGroupIdx++
    ) {
      const answerGroup = answerGroups[ansGroupIdx];
      const groupId = String(ansGroupIdx + 1);
      // Specific edge case for when HasLengthInclusivelyBetween is used.
      for (var ruleIdx = 0; ruleIdx < answerGroup.rules.length; ruleIdx++) {
        var rule = answerGroup.rules[ruleIdx];
        if (rule.type === 'HasLengthInclusivelyBetween') {
          if (rule.inputs.a > rule.inputs.b) {
            partialWarningsList.push({
              type: AppConstants.WARNING_TYPES.ERROR,
              message:
                `The rule in response group ${groupId} is invalid. ` +
                `${rule.inputs.a} is more than ${rule.inputs.b}`,
            });
          }
        }
      }
    }

    return partialWarningsList.concat(
      this.getCustomizationArgsWarnings(customizationArgs).concat(
        this.baseInteractionValidationServiceInstance.getAllOutcomeWarnings(
          answerGroups,
          defaultOutcome,
          stateName
        )
      )
    );
  }
}

angular
  .module('oppia')
  .factory(
    'MusicNotesInputValidationService',
    downgradeInjectable(MusicNotesInputValidationService)
  );
