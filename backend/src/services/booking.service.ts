import mongoose from "mongoose";
import Booking from "../models/Booking";
import Stay from "../models/Stay";

interface CreateBookingData {
  customer: string;
  stay: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
}

export const createBooking = async (bookingData: CreateBookingData) => {
  const { customer, stay, checkIn, checkOut, guests } = bookingData;

  // Validate IDs
  if (
    !mongoose.Types.ObjectId.isValid(customer) ||
    !mongoose.Types.ObjectId.isValid(stay)
  ) {
    throw new Error("Invalid customer or stay ID");
  }

  // Find stay
  const stayData = await Stay.findById(stay);

  if (!stayData) {
    throw new Error("Stay not found");
  }

  // Validate dates
  if (checkIn >= checkOut) {
    throw new Error("Check-out date must be after check-in date");
  }

  // Validate guests
  if (guests < 1) {
    throw new Error("Guests must be at least 1");
  }

  if (guests > stayData.maxGuests) {
    throw new Error(
      `This stay allows a maximum of ${stayData.maxGuests} guests`,
    );
  }

  // Check overlapping bookings
  const overlappingBooking = await Booking.findOne({
    stay,
    status: { $in: ["PENDING", "CONFIRMED"] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  });

  if (overlappingBooking) {
    throw new Error("This stay is already booked for the selected dates");
  }

  // Calculate number of nights
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / millisecondsPerDay,
  );

  // Calculate price on server
  const totalPrice = nights * stayData.pricePerNight;

  const booking = await Booking.create({
    customer,
    stay,
    checkIn,
    checkOut,
    guests,
    totalPrice,
    status: "PENDING",
  });

  return booking;
};

export const getMyBookings = async (customerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new Error("Invalid customer ID");
  }

  const bookings = await Booking.find({
    customer: customerId,
  })
    .populate("stay", "title city state pricePerNight")
    .sort({ createdAt: -1 });

  return bookings;
};

export const getHostBookings = async (hostId: string) => {
  if (!mongoose.Types.ObjectId.isValid(hostId)) {
    throw new Error("Invalid host ID");
  }

  const stays = await Stay.find({
    host: hostId,
  }).select("_id");

  const stayIds = stays.map((stay) => stay._id);

  const bookings = await Booking.find({
    stay: { $in: stayIds },
  })
    .populate("customer", "name email")
    .populate("stay", "title city state pricePerNight")
    .sort({ createdAt: -1 });

  return bookings;
};

export const updateBookingStatus = async (
  bookingId: string,
  hostId: string,
  status: "CONFIRMED" | "REJECTED"
) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new Error("Invalid booking ID");
  }

  const booking = await Booking.findById(bookingId).populate("stay");

  if (!booking) {
    throw new Error("Booking not found");
  }

  const stay = booking.stay as unknown as {
    _id: mongoose.Types.ObjectId;
    host: mongoose.Types.ObjectId;
  };

  if (stay.host.toString() !== hostId) {
    throw new Error(
      "You can only manage bookings for your own stays"
    );
  }

  if (booking.status !== "PENDING") {
    throw new Error(
      "Only pending bookings can be updated"
    );
  }

  booking.status = status;

  await booking.save();

  return booking;
};

export const cancelBooking = async (
  bookingId: string,
  userId: string,
  userRole: "CUSTOMER" | "HOST"
) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new Error("Invalid booking ID");
  }

  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Customer can cancel only their own booking
  if (
    userRole === "CUSTOMER" &&
    booking.customer.toString() !== userId
  ) {
    throw new Error(
      "You can only cancel your own bookings"
    );
  }

  // Host can cancel only bookings for their own stays
  if (userRole === "HOST") {
    const stay = await Stay.findById(booking.stay);

    if (!stay) {
      throw new Error("Stay not found");
    }

    if (stay.host.toString() !== userId) {
      throw new Error(
        "You can only cancel bookings for your own stays"
      );
    }
  }

  // Only active bookings can be cancelled
  if (
    booking.status !== "PENDING" &&
    booking.status !== "CONFIRMED"
  ) {
    throw new Error(
      "Only pending or confirmed bookings can be cancelled"
    );
  }

  booking.status = "CANCELLED";

  await booking.save();

  return booking;
};

export const getBookingById = async (
  bookingId: string,
  userId: string,
  userRole: "CUSTOMER" | "HOST" | "ADMIN"
) => {
  if (!mongoose.Types.ObjectId.isValid(bookingId)) {
    throw new Error("Invalid booking ID");
  }

  const booking = await Booking.findById(bookingId)
    .populate("customer", "name email")
    .populate("stay", "title city state pricePerNight host");

  if (!booking) {
    throw new Error("Booking not found");
  }

  const stay = booking.stay as unknown as {
    _id: mongoose.Types.ObjectId;
    host: mongoose.Types.ObjectId;
  };

  if (userRole === "CUSTOMER") {
    const customer = booking.customer as unknown as {
      _id: mongoose.Types.ObjectId;
    };

    if (customer._id.toString() !== userId) {
      throw new Error("You can only view your own bookings");
    }
  }

  if (userRole === "HOST") {
    if (stay.host.toString() !== userId) {
      throw new Error(
        "You can only view bookings for your own stays"
      );
    }
  }

  return booking;
};