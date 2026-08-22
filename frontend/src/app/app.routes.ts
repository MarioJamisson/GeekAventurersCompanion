import { Routes } from '@angular/router';
import { Schedule } from './schedule/schedule';
import { Admin } from './admin/admin';

export const routes: Routes = [
    { path: '', component: Schedule },
    { path: 'admin', component: Admin },
];
