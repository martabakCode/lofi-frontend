import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityTimelineComponent } from './activity-timeline.component';

describe('ActivityTimelineComponent', () => {
    let component: ActivityTimelineComponent;
    let fixture: ComponentFixture<ActivityTimelineComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ActivityTimelineComponent]
        });
        fixture = TestBed.createComponent(ActivityTimelineComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
