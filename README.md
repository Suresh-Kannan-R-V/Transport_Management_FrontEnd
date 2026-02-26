| Code | Status             | Description                                                    |
| ---- | ------------------ | -------------------------------------------------------------- |
| 1    | PENDING            | Route created by faculty. Awaiting vehicle assignment.         |
| 2    | VEHICLE_ASSIGNED   | Vehicle assigned by admin. Awaiting faculty approval.          |
| 3    | VEHICLE_REASSIGNED | Vehicle reassigned due to faculty rejection.                   |
| 4    | FACULTY_APPROVED   | Faculty approved assigned vehicle. Awaiting driver assignment. |
| 5    | DRIVER_ASSIGNED    | Driver assigned by admin. Awaiting trip start.                 |
| 6    | DRIVER_REASSIGNED  | Driver reassigned due to unavailability/emergency.             |
| 7    | STARTED            | Faculty provided start OTP. Trip started.                      |
| 8    | COMPLETED          | Admin provided end OTP. Trip completed successfully.           |
| 9    | CANCELLED          | Route cancelled by faculty.                                    |

(PENDING → VEHICLE_ASSIGNED → FACULTY_APPROVED → DRIVER_ASSIGNED → STARTED → COMPLETED)
