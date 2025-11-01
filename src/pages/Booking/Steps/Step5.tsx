import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface Props {
  formData: any;
}

export function Step5({ formData }: Props) {
  const navigate = useNavigate();

  const days =
    formData.check_in && formData.check_out
      ? Math.ceil(
          (new Date(formData.check_out).getTime() -
            new Date(formData.check_in).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}>
      <motion.h2
        className="text-3xl font-bold text-center"
        variants={fadeInUp}
        transition={{ delay: 0.1 }}>
        Preview Booking
      </motion.h2>

      <div className="grid grid-cols-2 gap-6">
        <motion.div
          className="bg-white border p-4 rounded shadow-sm"
          variants={fadeInUp}
          transition={{ delay: 0.15 }}>
          <h3 className="font-semibold mb-3">Selected Date</h3>
          <p>Days: {days}</p>
          <p>Check-In: {formData.check_in || "—"}</p>
          <p>Check-Out: {formData.check_out || "—"}</p>
        </motion.div>

        <motion.div
          className="bg-white border p-4 rounded shadow-sm"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}>
          <h3 className="font-semibold mb-3">Personal Information</h3>
          <p>
            <strong>Name:</strong>{" "}
            {`${formData.lastName} ${formData.firstName}`}
          </p>
          <p>
            <strong>Gender:</strong> {formData.gender}
          </p>
          <p>
            <strong>Phone:</strong> {formData.phone}
          </p>
          <p>
            <strong>Email:</strong> {formData.email}
          </p>
          <p>
            <strong>Address:</strong> {formData.address}
          </p>
        </motion.div>

        <motion.div
          className="col-span-2 bg-white border p-4 rounded shadow-sm"
          variants={fadeInUp}
          transition={{ delay: 0.25 }}>
          <h3 className="font-semibold mb-3">Selected Room(s)</h3>
          {Array.isArray(formData.rooms) && formData.rooms.length > 0 ? (
            <div>
              {formData.rooms.map((room: any, idx: number) => {
                const [open, setOpen] = React.useState(false);

                return (
                  <motion.div
                    key={room.id || idx}
                    className="mb-2 border rounded overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}>
                    <button
                      type="button"
                      className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-t"
                      onClick={() => setOpen((prev) => !prev)}>
                      <span>
                        Room {room.room_number} ({room.type})
                      </span>
                      <span>{open ? "▲" : "▼"}</span>
                    </button>

                    {open && (
                      <motion.div
                        className="px-4 py-3 bg-white border-t"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}>
                        {room.featured_image && (
                          <div className="mb-3">
                            <img
                              src={room.featured_image}
                              alt={`Room ${room.room_number}`}
                              className="w-full h-48 object-cover rounded-md"
                              loading="lazy"
                            />
                          </div>
                        )}
                        <div className="text-sm space-y-1">
                          <p>
                            <strong>Room Number:</strong> {room.room_number}
                          </p>
                          <p>
                            <strong>Type:</strong> {room.type}
                          </p>
                          <p>
                            <strong>Capacity:</strong> {room.capacity}
                          </p>
                          <p>
                            <strong>Price:</strong> ₱{room.price}
                          </p>
                          <p>
                            <strong>Status:</strong> {room.status}
                          </p>
                          <p>
                            <strong>Description:</strong> {room.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p>No room selected</p>
          )}
        </motion.div>
      </div>

      <motion.div
        className="flex justify-center mt-8"
        variants={fadeInUp}
        transition={{ delay: 0.3 }}>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-md">
          Return Home
        </button>
      </motion.div>
    </motion.div>
  );
}
