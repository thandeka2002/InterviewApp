import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AllApplicantsPage } from './all-applicants.page';

describe('AllApplicantsPage', () => {
  let component: AllApplicantsPage;
  let fixture: ComponentFixture<AllApplicantsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AllApplicantsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
