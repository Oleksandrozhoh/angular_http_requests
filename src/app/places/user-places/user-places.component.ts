import { Component, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { PlacesContainerComponent } from '../places-container/places-container.component';
import { PlacesComponent } from '../places.component';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-user-places',
  standalone: true,
  templateUrl: './user-places.component.html',
  styleUrl: './user-places.component.css',
  imports: [PlacesContainerComponent, PlacesComponent],
})
export class UserPlacesComponent implements OnInit {

  isFetcing = signal(false); // Signal to track if data is being fetched for fallback content display in the template
  requestError = signal(false); // Signal to track if there was an error during the request
  
  private onDestroyRef = inject(DestroyRef);
  private placesService = inject(PlacesService);
  
  places = this.placesService.loadedUserPlaces; 

  ngOnInit() {
    this.isFetcing.set(true);
    // Fetch user places from the backend API
    const request = this.placesService.loadUserPlaces().subscribe({
      error: (error) => {
        console.error('Error fetching user places:', error);
        this.requestError.set(true); // Set request error signal to true
      },
      complete: () => {
        this.isFetcing.set(false); // Set fetching to false when the request completes to hide the fallback content
      }
    });

    this.onDestroyRef.onDestroy(() => {
      request.unsubscribe(); // Unsubscribe from the request when the component is destroyed
    });

  }
}
