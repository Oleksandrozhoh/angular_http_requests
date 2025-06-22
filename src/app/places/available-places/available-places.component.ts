import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit{

  private onDestroyRef = inject(DestroyRef);
  isFetcing = signal(false); // Signal to track if data is being fetched for fallback content display in the template
  requestError = signal(false); // Signal to track if there was an error during the request

  places = signal<Place[] | undefined>(undefined);

  private httpClient = inject(HttpClient);

  ngOnInit() {
    this.isFetcing.set(true);
    const subscription = this.httpClient.get<{places: Place[]}>('http://localhost:3000/places',
      //{observe: 'response',} allows to access the full HTTP response, including headers and status code (other options are 'body' and 'events')
  ).pipe(
    map((res)=> res.places) // Extract the 'places' array from the response with operator
  ).subscribe({
      next: (places) => {
        //console.log('Available places:', places);
        this.places.set(places);
      },
      complete: () => {
        this.isFetcing.set(false); // Set fetching to false when the request completes to hide the fallback content
      },
      error: (error) => {
        console.error('Error fetching places:', error);
         this.isFetcing.set(false); 
        this.requestError.set(true); 
      }
    }); 

    this.onDestroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }
}
