import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoldingsComponent } from './holdings.component';

describe('HoldingsComponent', () => {
  let component: HoldingsComponent;
  let fixture: ComponentFixture<HoldingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HoldingsComponent]
    });
    fixture = TestBed.createComponent(HoldingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
