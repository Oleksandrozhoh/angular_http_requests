import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';

import { Place } from '../place.model';
import { PlacesComponent } from '../places.component';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesService } from '../places.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-available-places',
  standalone: true,
  templateUrl: './available-places.component.html',
  styleUrl: './available-places.component.css',
  imports: [PlacesComponent, PlacesContainerComponent],
})
export class AvailablePlacesComponent implements OnInit{

  subscriptions: Subscription[] = [];

  private placesService = inject(PlacesService);
  private onDestroyRef = inject(DestroyRef);

  isFetcing = signal(false); // Signal to track if data is being fetched for fallback content display in the template
  requestError = signal(false); // Signal to track if there was an error during the request

  places = signal<Place[] | undefined>(undefined);

  ngOnInit() {
    this.isFetcing.set(true);
    const subscription = this.placesService.loadAvailablePlaces().subscribe({
      next: (places) => {
        //console.log('Available places:', places);
        this.places.set(places);
      },
      complete: () => {
        this.isFetcing.set(false); // Set fetching to false when the request completes to hide the fallback content
      },
      error: () => {
        this.isFetcing.set(false); 
        this.requestError.set(true); 
      }
    }); 

    this.onDestroyRef.onDestroy(() => {
      subscription.unsubscribe();
    })
  }

  onSelectPlace(place: Place) {
   this.subscriptions.push(this.placesService.addPlaceToUserPlaces(place).subscribe({}));
  }

  // pattern to unsubscribe from all subscriptions when the component is destroyed used in myCHS
  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

}
