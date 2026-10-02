import { useState } from "react";
import type { FormEvent } from "react";
import { createRide } from "../api/rides";

interface CreateRideProps {
  onRideCreated: () => void;
}

function CreateRide({ onRideCreated }: CreateRideProps) {
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [fare, setFare] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");

    try {
      const result = await createRide({
        pickupLocation,
        dropoffLocation,
        fare: Number(fare),
      });

      console.log("Ride created:", result);

      setMessage("Ride requested successfully 🚗");

      onRideCreated();

      setPickupLocation("");
      setDropoffLocation("");
      setFare("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create ride"
      );
    }
  };

  return (
    <div>
      <h1>Book a Ride</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Pickup Location</label>
          <input
            type="text"
            value={pickupLocation}
            onChange={(event) =>
              setPickupLocation(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Drop-off Location</label>
          <input
            type="text"
            value={dropoffLocation}
            onChange={(event) =>
              setDropoffLocation(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label>Fare</label>
          <input
            type="number"
            min="0"
            value={fare}
            onChange={(event) => setFare(event.target.value)}
            required
          />
        </div>

        <button type="submit">
          Request Ride
        </button>
      </form>

      {message && <p>{message}</p>}

      {error && <p>{error}</p>}
    </div>
  );
}

export default CreateRide;