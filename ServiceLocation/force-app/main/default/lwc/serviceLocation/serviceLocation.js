import { LightningElement, wire, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateLocation from '@salesforce/apex/CaseLocationUpdateController.updateLocation';
import { NavigationMixin } from 'lightning/navigation';
import fetchDetails from '@salesforce/apex/ServiceLocation.fetchDetails';
export default class ServiceLocation extends NavigationMixin(LightningElement) {
    @track startLatitude = '';
    @track startLongitude = '';
    @api recordId; // This will automatically receive the current record's Id
    error;
    mapMarkers;
    serviceResourceLatitude;
    serviceResourceLongitude;
    Street;
    City;
    State;
    PostalCode;
    Country;
    CustomerAddress;

    connectedCallback() {
        // Start location updates only if the "End" button is not clicked
        // if (!this.endButtonClicked) {
        //     this.startLocationUpdates();
        // }
    }
    // disconnectedCallback() {
    //     // Clear the interval when the component is removed
    //     clearInterval(this.locationUpdateInterval);
    // }
    startLocationUpdates() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.startLatitude = position.coords.latitude;
                    this.startLongitude = position.coords.longitude;
                    this.updateGeolocationField();
                },
                (error) => {
                    console.error('Error getting location:', error);
                    this.showToast('Error', 'Error getting location.', 'error');
                }
            );
            // Set up an interval to call handleStart every 2 minutes (120,000 milliseconds)
            this.locationUpdateInterval = setInterval(() => {
                this.startLocationUpdates();
            }, 120000);
        }
    }
    handleStart() {
        // Start location updates if the "End" button is not clicked
        if (!this.endButtonClicked) {
            this.startLocationUpdates();
        }
    }
    handleEnd() {
        this.endButtonClicked = true; // Set a flag to stop automatic updates
        clearInterval(this.locationUpdateInterval); // Clear the interval to stop automatic updates
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.startLatitude = position.coords.latitude;
                    this.startLongitude = position.coords.longitude;
                    this.updateGeolocationField();
                    console.error('End button clicked:');
                },
                (error) => {
                    console.error('Error getting location:', error);
                    this.showToast('Error', 'Error getting location.', 'error');
                }
            );
        } else {
            console.error('Geolocation not supported');
            this.showToast('Error', 'Geolocation is not supported.', 'error');
        }
    }
    // handleEnd() {
    //     this.endButtonClicked = true; // Set a flag to stop automatic updates
    //     if ("geolocation" in navigator) {
    //         navigator.geolocation.getCurrentPosition(
    //             (position) => {
    //                 this.startLatitude = position.coords.latitude;
    //                 this.startLongitude = position.coords.longitude;
    //                 this.updateGeolocationField();
    //                 console.error('Start button clicked:');
    //             },
    //             (error) => {
    //                 console.error('Error getting location:', error);
    //                 this.showToast('Error', 'Error getting location.', 'error');
    //             }
    //         );
    //     } else {
    //         console.error('Geolocation not supported');
    //         this.showToast('Error', 'Geolocation is not supported.', 'error');
    //     }
    // }
    updateGeolocationField() {
        updateLocation({
            recordId: this.recordId, // Use the current record's Id
            latitude: this.startLatitude,
            longitude: this.startLongitude
        })
        .then(() => {
            this.showToast('Success', 'Location updated successfully.', 'success');
        })
        .catch(error => {
            console.error('Error updating location:', error);
            this.showToast('Error', 'Error updating location.', 'error');
        });
    }
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            })
        );
    }

    @wire(fetchDetails, {recordId: '$recordId'})
    userLocation({ error, data }) {
        if (data) {
            this.CustomerAddress = data.Account.BillingAddress.street + ' ' + data.Account.BillingAddress.city +' ' +data.Account.BillingAddress.state +' ' +data.Account.BillingAddress.postalCode +' '+ data.Account.BillingAddress.country
            console.log('data'+JSON.stringify(data))
            console.log('data.Location__latitude__s'+data.Location__Latitude__s)
            
            this.mapMarkers = [
                {
                    location: {
                        Latitude: data.Location__Latitude__s,
                        Longitude: data.Location__Longitude__s,
                    },
                    title: 'Service representative current location',
                    icon: 'standard:user',
                },
                {
                    location: {
                        Street: data.Account.BillingAddress.street,
                        City :   data.Account.BillingAddress.city,
                        State :  data.Account.BillingAddress.state,
                        PostalCode :  data.Account.BillingAddress.postalCode,
                        Country:  data.Account.BillingAddress.country

   
                    },
                    

                    title: this.CustomerAddress,
                   
                    icon: 'standard:account',
                },
            ];
            this.serviceResourceLatitude = data.Location__Latitude__s;
            this.serviceResourceLongitude = data.Location__Longitude__s;
            this.Street = data.Account.BillingAddress.street;
            this.City = data.Account.BillingAddress.city;
            this.State = data.Account.BillingAddress.state;
            this.PostalCode = data.Account.BillingAddress.postalCode;
            this.Country = data.Account.BillingAddress.country;
            console.log('this.serviceResourceLatitude'+this.serviceResourceLatitude)
            console.log('this.serviceResourceLongitude'+this.serviceResourceLongitude)

        } else if (error) {
            console.log('Error'+ error)
            this.error = error;
        }
    }


    navigateToDrivingDirections() {
        const url = this.buildURL();
        // Navigate to a URL
        this[NavigationMixin.Navigate]({
                type: 'standard__webPage',
                attributes: {
                    url: url
                }
            },
            false // Replaces the current page in your browser history with the URL
        );
    }

    buildURL() {
        const baseURL = 'https://www.google.com/maps/dir';
        const fromLocation = `/${this.serviceResourceLatitude},${this.serviceResourceLongitude}`;
        const toLocation = `/${this.Street},${this.City},${this.State},${this.PostalCode},${this.Country}`;
        console.log('baseURL+ fromLocation + toLocation'+baseURL+ fromLocation + toLocation)
        return baseURL+ fromLocation + toLocation;
    }

}
/*import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import updateLocation from '@salesforce/apex/CaseLocationUpdateController.updateLocation';
export default class LocationTracker extends LightningElement {
    @track startLatitude = '';
    @track startLongitude = '';
    @track endLatitude = '';
    @track endLongitude = '';
    @api recordId; // This will automatically receive the current record's Id
    handleStart() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.startLatitude = position.coords.latitude;
                    this.startLongitude = position.coords.longitude;
                    this.updateGeolocationField();
                },
                (error) => {
                    console.error('Error getting location:', error);
                    this.showToast('Error', 'Error getting location.', 'error');
                }
            );
        }
        this.updateGeolocationField();
    }
    handleEnd() {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.endLatitude = position.coords.latitude;
                    this.endLongitude = position.coords.longitude;
                    // Call the Apex method to update the Geolocation field
                    //this.updateGeolocationField();
                },
                (error) => {
                    console.error('Error getting location:', error);
                    this.showToast('Error', 'Error getting location.', 'error');
                }
            );
        } else {
            console.error('Geolocation not supported');
            this.showToast('Error', 'Geolocation is not supported.', 'error');
        }
        //this.updateGeolocationField();
    }
    updateGeolocationField() {
        updateLocation({
            recordId: this.recordId, // Use the current record's Id
            latitude: this.startLatitude,
            longitude: this.startLongitude
        })
        .then(() => {
            this.showToast('Success', 'Location updated successfully.', 'success');
        })
        .catch(error => {
            console.error('Error updating location:', error);
            this.showToast('Error', 'Error updating location.', 'error');
        });
    }
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            })
        );
    }
}*/