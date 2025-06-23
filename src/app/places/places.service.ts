import { inject, Injectable, signal } from '@angular/core';

import { Place } from './place.model';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { ErrorService } from '../shared/error.service';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private httpClient = inject(HttpClient);
  private errorService = inject(ErrorService);
  private userPlaces = signal<Place[]>([]);

  loadedUserPlaces = this.userPlaces.asReadonly();

  loadAvailablePlaces(): Observable<Place[]> {
    return this.fetchPlaces('/places', "Failed to fetch avaliable places");
  }

  loadUserPlaces(): Observable<Place[]> {
        return this.fetchPlaces('/user-places', "Failed to fetch user places").pipe(tap({next: (places) => { this.userPlaces.set(places); }}));
  }

  addPlaceToUserPlaces(place: Place) {
    console.log('Adding place to user places. PlaceId: ', place);
    const prevPlaces = this.userPlaces();
    if (!prevPlaces.some((p) => p.id === place.id)) {
      this.userPlaces.update((places) => [...places, place]);
    }

    return this.httpClient.put('http://localhost:3000/user-places', {placeId: place.id}, {observe: 'response'}).pipe(tap({
      error: (error) => {
        console.error('Error adding place to user places:', error);
        this.errorService.showError('Failed to add place to user place');
        this.userPlaces.set(prevPlaces); // Revert to previous state on error
      }
    }));
  }

  removeUserPlace(place: Place) {
    const prevPlaces = this.userPlaces();
    console.log('Removing place from user places. PlaceId: ', place);
    this.userPlaces.set(prevPlaces.filter((each)=> each.id !== place.id));

    return this.httpClient.delete(`http://localhost:3000/user-places/${place.id}`, {observe: 'response'}).pipe(tap({
      error: (error) => {
        console.error('Error removing place from user places:', error);
        this.errorService.showError('Failed to remove place from user place');
        this.userPlaces.set(prevPlaces); // Revert to previous state on error
      }
    }));
  }

  private fetchPlaces(endpoint: string, errorMessage: string) : Observable<Place[]> {
    return this.httpClient.get<{places: Place[]}>(`http://localhost:3000${endpoint}` 
      //{observe: 'response',} allows to access the full HTTP response, including headers and status code (other options are 'body' and 'events')
  ).pipe(
    map((res)=> res.places), // Extract the 'places' array from the response with operator
    catchError((error) => {
      console.log('Error fetching places: ' + error); // Log the error to the console
      this.errorService.showError(errorMessage); // Show the error message using the ErrorService
      return throwError(() => new Error(errorMessage));
     } 
    )
  )
  }
}
