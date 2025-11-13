import { Component, OnInit } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
