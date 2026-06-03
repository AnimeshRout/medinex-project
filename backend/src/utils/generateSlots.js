// ==============================
// ⏰ Generate Appointment Slots
// ──────────────────────────────
// ==============================

const generateSlots = (date, bookedSlots = [], now = new Date(), isToday = false) => {

  const slots = []

  const start = new Date(date)
  start.setHours(9, 0, 0, 0)

  const end = new Date(date)
  end.setHours(21, 0, 0, 0)  // extended to 9pm to match controller

  while (start < end) {

    const time = start.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })

    // ✅ Mark as booked if already taken
    const isBooked = bookedSlots.includes(time)

    // ✅ Mark as booked if time has passed today
    const isPast = isToday && (start < now)

    slots.push({
      time,
      isBooked: isBooked || isPast
    })

    start.setMinutes(start.getMinutes() + 30)

  }

  return slots

}

module.exports = generateSlots