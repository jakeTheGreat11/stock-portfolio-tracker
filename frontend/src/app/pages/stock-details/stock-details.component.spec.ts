import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockDetailsComponent } from './stock-details.component';

describe('StockDetailsComponent', () => {
  let component: StockDetailsComponent;
  let fixture: ComponentFixture<StockDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StockDetailsComponent]
    });
    fixture = TestBed.createComponent(StockDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
