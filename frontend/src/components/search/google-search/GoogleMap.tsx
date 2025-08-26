import React, { useEffect, useRef } from "react";

interface ChildProps {
  sendDataToParent: (data: string[], place: string) => void;
}

type Props = ChildProps;

const GoogleMap: React.FC<Props> = ({ sendDataToParent }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const initMap = async () => {
      if (navigator.geolocation && window.google && window.google.maps) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const map = new window.google.maps.Map(mapRef.current!, {
            center: { lat, lng },
            zoom: 10,
          });

          const autocompleteEl = document.getElementById(
            "autocomplete"
          ) as HTMLElement | null;
          autocompleteRef.current = autocompleteEl;

          if (autocompleteEl) {
            autocompleteEl.addEventListener("gmpx-placechange", async () => {
              // @ts-expect-error: Custom Google Maps element
              const place = autocompleteEl.value; // plain text
              // @ts-expect-error: Custom Google Maps element
              const placePrediction = autocompleteEl.getPlace(); // structured info

              if (!placePrediction || !placePrediction.placeId) {
                console.error(
                  "No place selected or missing placeId:",
                  placePrediction
                );
                return;
              }

              console.log("Selected place:", placePrediction);

              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode(
                { placeId: placePrediction.placeId },
                (results, status) => {
                  if (status === "OK" && results[0]) {
                    const location = results[0].geometry.location;
                    const lati = location.lat();
                    const long = location.lng();

                    const placesService =
                      new window.google.maps.places.PlacesService(map);
                    const request: google.maps.places.PlaceSearchRequest = {
                      location: { lat: lati, lng: long },
                      radius: 1000,
                      type: "lodging",
                    };

                    placesService.nearbySearch(request, (results, status) => {
                      if (
                        status ===
                          window.google.maps.places.PlacesServiceStatus.OK &&
                        results
                      ) {
                        const hotelNames = results.map((result) => result.name);
                        sendDataToParent(
                          hotelNames,
                          placePrediction.formattedAddress || place
                        );
                      } else {
                        console.error("Error fetching nearby hotels:", status);
                      }
                    });
                  }
                }
              );
            });
          }
        });
      } else {
        console.error("Google Maps API not loaded.");
      }
    };

    initMap();
  }, [sendDataToParent]);

  return (
    <div>
      {/* @ts-expect-error: Custom element from Google Maps API */}
      <gmpx-place-autocomplete
        id="autocomplete"
        placeholder="Google here..."
        style={{
          width: "100%",
          maxWidth: "485px",
          fontSize: "larger",
          margin: "0 auto",
          display: "block",
        }}
      />

      <div
        ref={mapRef}
        style={{ height: "400px", maxWidth: "100%", margin: "0 auto" }}
        hidden
      ></div>
    </div>
  );
};

export default GoogleMap;
