import { cloneDeep } from 'lodash';
import {
  Component,
  EventEmitter,
  OnInit,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FilterService } from '../../services/filter.service';
import { Space, Spaces } from 'ngx-fabric8-wit';
import { User } from 'ngx-login-client';
import { LabelModel } from './../../models/label.model';

@Component({
  selector: 'f8-label',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.less']
})

export class LabelsComponent implements OnInit, OnChanges {

  @Input('labels') labelInput: LabelModel[] = [];
  @Input() truncateAfter: number;
  @Input() allowDelete: boolean;
  @Output() onLabelClick = new EventEmitter();
  @Output() onRemoveLabel = new EventEmitter();

  private labels: LabelModel[] = [];
  private showMore: boolean = false;
  private spaceSubscription: Subscription = null;
  private spaceId;

  constructor(
    private filterService: FilterService,
    private spaces: Spaces
  ) {}

  ngOnInit() {
    this.spaceSubscription = this.spaces.current.subscribe(space => {
      if (space) {
        this.spaceId = space.id;
      } else {
        console.log('[Guided Work Item Types] Space deselected.');
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.labels = changes.labels.currentValue;
    if (changes.labelInput) {
      this.labels = this.labelInput.filter(label => {
        return label.attributes &&
          label.attributes['background-color'] &&
          label.attributes['text-color']
      })
    }
  }

  moreClick(event) {
    event.stopPropagation();
  }

  clickLabel(label, event) {
    event.stopPropagation();
    this.onLabelClick.emit(label);
  }

  removeLabel(label, event) {
    event.stopPropagation();
    this.onRemoveLabel.emit(label);
  }

  buildQueryParam(label) {
    const label_key = 'label';
    const label_compare = this.filterService.equal_notation;
    const label_value = label.id;

    //Query for type
    const type_query = this.filterService.queryBuilder(label_key, label_compare, label_value);
    //Query for space
    const space_query = this.filterService.queryBuilder('space',this.filterService.equal_notation, this.spaceId);

    //Join type and space query
    const first_join = this.filterService.queryJoiner({}, this.filterService.and_notation, space_query);

    const second_join = this.filterService.queryJoiner(first_join, this.filterService.and_notation, type_query);

    //second_join gives json object
    return this.filterService.jsonToQuery(second_join);
  }
}
