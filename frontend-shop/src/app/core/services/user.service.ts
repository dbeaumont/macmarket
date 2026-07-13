import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { type UserInfo, type ShippingProfile } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  getMe(): Observable<UserInfo> {
    return this.api.get<UserInfo>('/users/me');
  }

  getShippingProfile(): Observable<ShippingProfile | null> {
    return this.api.get<ShippingProfile | null>('/users/me/shipping-profile');
  }
}
